const https = require('https');

async function triggerHubEngine() {
  const GITHUB_TOKEN = process.env.ORG_GITHUB_TOKEN || process.env.GITHUB_TOKEN;

  if (!GITHUB_TOKEN) {
    console.error("No GITHUB_TOKEN available to trigger the dispatch.");
    process.exit(1);
  }

  const data = JSON.stringify({
    event_type: "m2m_worker_trigger",
    client_payload: {
      issue_number: 5,
      worker_agent: "antigravity",
      spoke_owner: "waterWISE-Academy",
      spoke_repo: "production-spoke"
    }
  });

  const options = {
    hostname: 'api.github.com',
    path: '/repos/waterWISE-Academy/m2m-core-skill/dispatches',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'M2M-Agent-Trigger',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log("✅ Dispatch sent successfully. Hub Engine triggered!");
    } else {
      console.error("❌ Failed to send dispatch.");
    }
    res.setEncoding('utf8');
    res.on('data', chunk => console.log(chunk));
  });

  req.on('error', e => console.error(`Problem with request: ${e.message}`));
  req.write(data);
  req.end();
}

triggerHubEngine();
