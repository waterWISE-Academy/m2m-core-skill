const fs = require('fs');
const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');

async function callLLMWithFallback(systemPrompt, userPrompt) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  const providers = [
    {
      name: 'Tier 1 (Core Coding) - DeepSeek',
      url: 'https://api.deepseek.com/chat/completions',
      key: process.env.DEEPSEEK_API_KEY,
      model: 'deepseek-chat'
    },
    {
      name: 'Tier 1 (Micro Tasks) - Groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key: process.env.GROQ_API_KEY,
      model: 'llama3-70b-8192'
    },
    {
      name: 'Tier 2 (Complex) - Gemini 1.5 Pro',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      key: process.env.GEMINI_API_KEY,
      model: 'gemini-1.5-pro'
    },
    {
      name: 'Tier 3 (Fallback) - GitHub Models',
      url: 'https://models.inference.ai.azure.com/chat/completions',
      key: process.env.GH_MODELS_API_KEY,
      model: 'gpt-4o'
    }
  ];

  for (const provider of providers) {
    if (!provider.key) {
      console.log(`[LLM Router] Skipping ${provider.name} due to missing API key.`);
      continue;
    }

    console.log(`[LLM Router] Attempting to use ${provider.name} (Model: ${provider.model})...`);
    try {
      const response = await fetch(provider.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.key}`
        },
        body: JSON.stringify({
          model: provider.model,
          messages: messages,
          max_tokens: 8192,
          temperature: 0.1
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          console.log(`✅ [LLM Router] Successfully generated code using ${provider.name}.`);
          return data.choices[0].message.content.trim();
        }
      } else {
        console.error(`⚠️ [LLM Router] ${provider.name} API Error: ${response.status} - ${await response.text()}`);
      }
    } catch (error) {
      console.error(`⚠️ [LLM Router] Exception calling ${provider.name}:`, error.message);
    }
  }

  throw new Error("All configured LLM providers failed or no keys were provided.");
}

async function runRealAgent() {
  console.log("🚀 M2M Hub Internal Execution Engine Initiated.");

  const spokeOwner = process.env.SPOKE_OWNER;
  const spokeRepo = process.env.SPOKE_REPO;
  const issueNumber = process.env.ISSUE_NUMBER;
  const workerAgent = process.env.WORKER_AGENT || 'antigravity';
  const orgToken = process.env.ORG_GITHUB_TOKEN;

  if (!spokeOwner || !spokeRepo || !issueNumber || !orgToken) {
    core.setFailed("Missing required Spoke context or ORG_GITHUB_TOKEN.");
    return;
  }

  const octokit = github.getOctokit(orgToken);

  console.log(`[Target Spoke] ${spokeOwner}/${spokeRepo}, Issue: #${issueNumber}`);

  try {
    // 1. Fetch Issue Data
    const { data: issue } = await octokit.rest.issues.get({
      owner: spokeOwner,
      repo: spokeRepo,
      issue_number: issueNumber
    });

    console.log(`[Issue Title] ${issue.title}`);

    // 2. Execute 3-Tier Dynamic Routing LLM Call
    const systemPrompt = `You are an expert autonomous software architect and developer. Your task is to read the user's development plan and generate the COMPLETE codebase to fulfill it.
CRITICAL INSTRUCTION: You MUST output ONLY a valid JSON array containing objects with 'path' and 'content' keys. Do NOT wrap the JSON in markdown formatting (like \`\`\`json). Do NOT add any conversational text before or after the JSON.

Expected output format:
[
  {
    "path": "src/index.js",
    "content": "console.log('Hello');"
  },
  {
    "path": "public/index.html",
    "content": "<html><body><h1>Hello</h1></body></html>"
  }
]`;

    const userPrompt = `Issue Title: ${issue.title}\n\nIssue Body (Development Plan):\n${issue.body || 'No detailed plan provided. Please infer basic project structure from the title.'}\n\nPlease generate the full project files as a JSON array.`;

    let llmCodeResult = "[]";
    let isFallback = false;
    let fallbackErrorMessage = "";

    try {
      llmCodeResult = await callLLMWithFallback(systemPrompt, userPrompt);
    } catch (err) {
      console.log(`❌ [LLM Error] ${err.message}. Using default Mock code.`);
      isFallback = true;
      fallbackErrorMessage = err.message;
      llmCodeResult = JSON.stringify([{
        path: `src/agent_fallback_${issueNumber}.js`,
        content: `// Auto-generated fallback code for issue #${issueNumber}\nconsole.log("LLM Error: ${err.message}");\n`
      }]);
    }

    // 3. Parse LLM JSON output and create a commit/PR on Spoke Repo
    console.log(`[PR] Preparing to create Pull Request on ${spokeOwner}/${spokeRepo}`);

    // Get main branch ref
    const { data: refData } = await octokit.rest.git.getRef({
      owner: spokeOwner,
      repo: spokeRepo,
      ref: 'heads/main'
    });
    const baseSha = refData.object.sha;

    // Parse the JSON array returned by the LLM
    let filesToCommit = [];
    try {
      // Robust stripping in case LLM ignored instructions and wrapped in markdown
      let cleanJsonString = llmCodeResult.trim();
      if (cleanJsonString.startsWith('```json')) {
        cleanJsonString = cleanJsonString.substring(7);
      } else if (cleanJsonString.startsWith('```')) {
        cleanJsonString = cleanJsonString.substring(3);
      }
      if (cleanJsonString.endsWith('```')) {
        cleanJsonString = cleanJsonString.substring(0, cleanJsonString.length - 3);
      }
      cleanJsonString = cleanJsonString.trim();

      filesToCommit = JSON.parse(cleanJsonString);
      if (!Array.isArray(filesToCommit)) {
        throw new Error("LLM output is not a JSON array.");
      }
      if (filesToCommit.length === 0) {
        throw new Error("LLM output array is empty.");
      }
    } catch (parseError) {
      console.error("❌ Failed to parse LLM JSON output:", parseError.message);
      console.error("LLM Raw Output:", llmCodeResult);
      // Fallback to text file if parsing fails
      filesToCommit = [{
        path: `src/agent_error_${issueNumber}.txt`,
        content: `Failed to parse LLM output. Raw response:\n\n${llmCodeResult}`
      }];
    }

    // Create a new branch
    const branchName = `agent-update/issue-${issueNumber}-${Date.now()}`;
    await octokit.rest.git.createRef({
      owner: spokeOwner,
      repo: spokeRepo,
      ref: `refs/heads/${branchName}`,
      sha: baseSha
    });

    // Create file blobs dynamically
    const treeItems = [];
    for (const file of filesToCommit) {
      if (!file.path || !file.content) {
        console.warn(`Skipping invalid file object: ${JSON.stringify(file)}`);
        continue;
      }
      console.log(`[Git] Creating blob for: ${file.path}`);
      const { data: blobData } = await octokit.rest.git.createBlob({
        owner: spokeOwner,
        repo: spokeRepo,
        content: Buffer.from(file.content).toString('base64'),
        encoding: 'base64'
      });

      treeItems.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha
      });
    }

    // Get current base tree
    const { data: commitData } = await octokit.rest.git.getCommit({
      owner: spokeOwner,
      repo: spokeRepo,
      commit_sha: baseSha
    });

    // Create new tree with multiple files
    const { data: treeData } = await octokit.rest.git.createTree({
      owner: spokeOwner,
      repo: spokeRepo,
      base_tree: commitData.tree.sha,
      tree: treeItems
    });

    // Create commit
    const { data: newCommitData } = await octokit.rest.git.createCommit({
      owner: spokeOwner,
      repo: spokeRepo,
      message: `[M2M-Agent] Implement fix for Issue #${issueNumber}`,
      tree: treeData.sha,
      parents: [baseSha]
    });

    // Update branch ref
    await octokit.rest.git.updateRef({
      owner: spokeOwner,
      repo: spokeRepo,
      ref: `heads/${branchName}`,
      sha: newCommitData.sha
    });

    // Create Pull Request
    const { data: prData } = await octokit.rest.pulls.create({
      owner: spokeOwner,
      repo: spokeRepo,
      title: `[M2M-Agent] Automated Implementation for Issue #${issueNumber}`,
      body: `This PR was autonomously generated by the M2M Protocol (Agent: ${workerAgent}).\n\nCloses #${issueNumber}`,
      head: branchName,
      base: 'main'
    });

    console.log(`✅ Pull Request Created Successfully: ${prData.html_url}`);

    // Auto-Merge logic based on user request ("Zero-Touch Autonomy")
    console.log(`[Auto-Merge] Attempting to auto-merge PR #${prData.number}...`);
    try {
      // Optional: Give GitHub a brief moment to process the PR creation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const query = `
        mutation($pullRequestId: ID!, $commitHeadline: String!) {
          enablePullRequestAutoMerge(input: {
            pullRequestId: $pullRequestId,
            commitHeadline: $commitHeadline,
            mergeMethod: MERGE
          }) {
            pullRequest {
              autoMergeRequest {
                enabledAt
              }
            }
          }
        }
      `;

      const variables = {
        pullRequestId: prData.node_id,
        commitHeadline: `Auto-merge: [M2M-Agent] Implementation for Issue #${issueNumber}`
      };

      await octokit.graphql(query, variables);

      console.log(`✅ [Auto-Merge] PR #${prData.number} successfully queued for auto-merge.`);

      // Update Issue comment to reflect completion and merge
      let commentBody = "";
      if (isFallback) {
        commentBody = `⚠️ **[System 1 / Worker Agent ${workerAgent} - 執行失敗 (LLM Error)]** \n\n已建立 Fallback Pull Request (僅含錯誤紀錄): ${prData.html_url}\n\n🚨 **錯誤原因：** \`${fallbackErrorMessage}\`\n\n**產品架構並未生成。** 這通常是因為您的 M2M Hub 中央控制庫 (m2m-core-skill) 尚未設定，或設定了無效的 LLM API Keys。請前往 GitHub Settings -> Secrets and variables -> Actions，並確保您已設定如 \`DEEPSEEK_API_KEY\` 或 \`GH_MODELS_API_KEY\` 等環境變數以啟動 AI 模型。\n\n🤖 **[Auto-Merge]** 根據系統設定，此除錯用 PR 已啟用自動合併，將在 CI 通過後關閉。`;
      } else {
        commentBody = `✅ **[System 1 / Worker Agent ${workerAgent}]** 程式碼實作完成！\n已成功建立 Pull Request: ${prData.html_url}\n\n🤖 **[Auto-Merge]** 根據系統設定，已啟用 PR 自動合併，待 CI 檢查通過後將自動合併至 main 分支。任務完成！`;
      }

      await octokit.rest.issues.createComment({
        owner: spokeOwner,
        repo: spokeRepo,
        issue_number: issueNumber,
        body: commentBody
      });
    } catch (mergeError) {
      console.error(`⚠️ [Auto-Merge Error] Failed to auto-merge PR #${prData.number}:`, mergeError.message);

      // Fallback comment if auto-merge fails (e.g., branch protection rules)
      let fallbackMergeBody = "";
      if (isFallback) {
        fallbackMergeBody = `⚠️ **[System 1 / Worker Agent ${workerAgent} - 執行失敗 (LLM Error)]** \n\n已建立 Fallback Pull Request (僅含錯誤紀錄): ${prData.html_url}\n\n🚨 **錯誤原因：** \`${fallbackErrorMessage}\`\n\n**產品架構並未生成。** 請前往 Hub 設定有效的 LLM API Keys。\n\n⚠️ **[Auto-Merge]** 自動合併失敗（可能遇到分支保護規則：${mergeError.message}）。`;
      } else {
        fallbackMergeBody = `✅ **[System 1 / Worker Agent ${workerAgent}]** 程式碼實作完成！\n已成功建立 Pull Request: ${prData.html_url}\n\n⚠️ **[Auto-Merge]** 自動合併失敗（可能遇到分支保護規則：${mergeError.message}）。請手動審查並合併。`;
      }

      await octokit.rest.issues.createComment({
        owner: spokeOwner,
        repo: spokeRepo,
        issue_number: issueNumber,
        body: fallbackMergeBody
      });
    }

    console.log("🎉 Workflow completed successfully.");

  } catch (error) {
    console.error("❌ Agent Execution Failed:", error);
    core.setFailed(error.message);
  }
}

runRealAgent();
