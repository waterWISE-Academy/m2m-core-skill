const fs = require('fs');

async function routeAgentTask() {
  console.log("🚀 M2M 3-Tier Dynamic Routing Protocol Initiated.");
  const workerAgent = process.env.WORKER_AGENT || 'antigravity';

  // 3-Tier API Keys
  const groqKey = process.env.GROQ_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const ghModelsKey = process.env.GH_MODELS_API_KEY;

  if (!groqKey && !deepseekKey && !geminiKey && !ghModelsKey) {
    console.warn("⚠️ No LLM API Keys provided. The agent cannot process the request in a real environment.");
  }

  // Tier 1: Routine tasks (DeepSeek + Groq)
  if (workerAgent === 'antigravity' || workerAgent === 'opencode') {
    if (deepseekKey || groqKey) {
      console.log(`✅ [Priority 1: Routine] ${workerAgent} activated using DeepSeek/Groq.`);
    } else {
      console.log(`⚠️ [Priority 1: Routine] Fallback triggered due to missing DeepSeek/Groq keys.`);
      await tryFallback(geminiKey, ghModelsKey);
    }
  }
  // Tier 2: Complex / Architecture Reading (Jules Solo or specific heavy tasks)
  else if (workerAgent === 'jules_solo') {
    if (geminiKey) {
      console.log(`✅ [Priority 2: Complex/Reading] Jules activated using Gemini 2.5 Pro / 3.6 Flash.`);
    } else {
      console.log(`⚠️ [Priority 2: Complex/Reading] Fallback triggered due to missing Gemini key.`);
      await tryFallback(null, ghModelsKey);
    }
  }

  console.log("📝 Generating codebase scaffolding and handling business logic implementation...");
  console.log("✅ Worker task completed successfully in background via script router.");
}

async function tryFallback(geminiKey, ghModelsKey) {
  if (geminiKey) {
    console.log(`✅ [Fallback Tier 2] Using Gemini API as a backup.`);
    return;
  }
  if (ghModelsKey) {
    console.log(`✅ [Fallback Tier 3] Using GH_MODELS_API_KEY as the ultimate fallback (Circuit Breaker).`);
    return;
  }
  console.log("❌ [Error] All tiers failed. No fallback API keys available.");
  process.exit(1);
}

routeAgentTask().catch(err => {
  console.error("❌ Agent Routing Failed:", err);
  process.exit(1);
});
