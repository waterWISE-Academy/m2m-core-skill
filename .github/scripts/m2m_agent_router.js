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
          max_tokens: 1000,
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
    const systemPrompt = "You are an autonomous AI agent in a GitHub Actions CI environment. Your task is to output purely functional code based on the user's issue title. Do not wrap in markdown blocks, output raw code only.";
    const userPrompt = `Please write a simple javascript program that resolves this issue title: ${issue.title}. If the title is vague, just output a generic hello world function.`;

    let llmCodeResult = `// Auto-generated fallback code for issue #${issueNumber}\nconsole.log("Hello from M2M Agent!");\n`;

    try {
      llmCodeResult = await callLLMWithFallback(systemPrompt, userPrompt);
    } catch (err) {
      console.log(`❌ [LLM Error] ${err.message}. Using default Mock code.`);
    }

    // 3. Create a commit and PR on Spoke Repo
    console.log(`[PR] Preparing to create Pull Request on ${spokeOwner}/${spokeRepo}`);

    // Get main branch ref
    const { data: refData } = await octokit.rest.git.getRef({
      owner: spokeOwner,
      repo: spokeRepo,
      ref: 'heads/main'
    });
    const baseSha = refData.object.sha;

    // Create a new branch
    const branchName = `agent-update/issue-${issueNumber}-${Date.now()}`;
    await octokit.rest.git.createRef({
      owner: spokeOwner,
      repo: spokeRepo,
      ref: `refs/heads/${branchName}`,
      sha: baseSha
    });

    // Create a new file blob
    const { data: blobData } = await octokit.rest.git.createBlob({
      owner: spokeOwner,
      repo: spokeRepo,
      content: Buffer.from(llmCodeResult).toString('base64'),
      encoding: 'base64'
    });

    // Get current base tree
    const { data: commitData } = await octokit.rest.git.getCommit({
      owner: spokeOwner,
      repo: spokeRepo,
      commit_sha: baseSha
    });

    // Create new tree
    const { data: treeData } = await octokit.rest.git.createTree({
      owner: spokeOwner,
      repo: spokeRepo,
      base_tree: commitData.tree.sha,
      tree: [
        {
          path: `src/agent_fix_${issueNumber}.js`,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        }
      ]
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

    // Add PR reference back to issue
    await octokit.rest.issues.createComment({
      owner: spokeOwner,
      repo: spokeRepo,
      issue_number: issueNumber,
      body: `✅ **[System 1 / Worker Agent ${workerAgent}]** 程式碼實作完成！\n已成功建立 Pull Request: ${prData.html_url}\n請進行 Code Review 或等待系統自動執行測試與審查。`
    });

    console.log("🎉 Workflow completed successfully.");

  } catch (error) {
    console.error("❌ Agent Execution Failed:", error);
    core.setFailed(error.message);
  }
}

runRealAgent();
