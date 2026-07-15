const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\b24061fb-1e9d-4cdd-ad6d-2ea43364eb52\\.system_generated\\logs\\transcript.jsonl';
const outPath = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\b24061fb-1e9d-4cdd-ad6d-2ea43364eb52\\scratch\\previous_page.tsx';

async function processLineByLine() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const previousVersions = [];

  for await (const line of rl) {
    try {
      const data = JSON.parse(line);
      const tcalls = data.tool_calls || [];
      for (const tc of tcalls) {
        if (tc.name === 'default_api:write_to_file') {
          const args = tc.args || {};
          const target = args.TargetFile || '';
          if (target.includes('page.tsx')) {
            const summary = args.ArtifactMetadata?.Summary || '';
            const content = args.CodeContent || '';
            previousVersions.push({ summary, content });
          }
        }
      }
    } catch (e) {
      // ignore JSON parse errors
    }
  }

  console.log(`Found ${previousVersions.length} versions:`);
  previousVersions.forEach((v, i) => {
    console.log(`[${i}] ${v.summary.substring(0, 80)}`);
  });

  // We want the version with "Used/Unused status indicators" (version 1)
  if (previousVersions.length > 1) {
    const versionIndex = 1; // Change to 1 for the second version
    fs.writeFileSync(outPath, previousVersions[versionIndex].content, 'utf8');
    console.log(`Successfully wrote version ${versionIndex} to ${outPath}`);
  } else {
    console.log("Not enough versions found!");
  }
}

processLineByLine();
