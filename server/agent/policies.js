const unsafePatterns = [
  /fabricate|invent|fake/i,
  /bypass|skip approval|ignore approval/i,
  /delete|purge|drop/i,
  /send invoice|issue invoice|charge the customer/i,
  /apply discount|change contract|modify contract/i,
  /write to salesforce|update crm|push to crm/i,
  /credit memo|refund/i
];

export function classifyRequest(task) {
  const text = String(task || "");
  if (text.trim().length < 8) {
    return {
      allowed: false,
      reason: "Task is too short for a governed RevOps workflow."
    };
  }

  const matched = unsafePatterns.find((pattern) => pattern.test(text));
  if (matched) {
    return {
      allowed: false,
      reason: "Request includes unsafe writeback, fabrication, or approval-bypass intent."
    };
  }

  return { allowed: true, reason: "read_only_analysis" };
}

export function approvalGates(account, leakage, renewalRisk) {
  const gates = [];
  if (leakage.estimatedLeakage > 15000) {
    gates.push("Finance review before quoting true-up or credits");
  }
  if (renewalRisk.score >= 70) {
    gates.push("Executive sponsor review before customer-facing plan");
  }
  if (account.contract.renewalClause.toLowerCase().includes("legal")) {
    gates.push("Legal review for discount or amendment language");
  }
  if (account.support.openEscalations > 0) {
    gates.push("Customer success owner confirms escalation plan");
  }
  return gates.length ? gates : ["Account owner review"];
}
