import { operationalScorecard } from "../server/runtime.js";
import { toolCatalog } from "../server/agent/tools.js";

const scorecard = operationalScorecard();
if (scorecard.score < 100) {
  console.error("Operational scorecard is below publish threshold");
  process.exit(1);
}

const unsafeTool = toolCatalog.find((tool) => !["read", "analyze", "draft"].includes(tool.permission));
if (unsafeTool) {
  console.error(`Unexpected tool permission: ${unsafeTool.name}`);
  process.exit(1);
}

console.log("[ops] RevenueGuard operational readiness checks passed");
