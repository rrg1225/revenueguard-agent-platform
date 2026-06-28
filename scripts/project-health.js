import fs from "node:fs";

const required = [
  "README.md",
  ".env.example",
  ".github/workflows/ci.yml",
  "server/http.js",
  "server/agent/loop.js",
  "src/App.jsx",
  "test/api.test.js",
  "eval/scenarios.test.js",
  "docs/ARCHITECTURE.md",
  "docs/OPERATIONS.md"
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error(`Missing required files: ${missing.join(", ")}`);
  process.exit(1);
}

const readme = fs.readFileSync("README.md", "utf8").toLowerCase();
for (const phrase of ["guardrails", "audit traces", "evals", "approval"]) {
  if (!readme.includes(phrase)) {
    console.error(`README missing portfolio signal: ${phrase}`);
    process.exit(1);
  }
}

console.log("[health] RevenueGuard project health checks passed");
