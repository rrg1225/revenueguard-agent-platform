export const toolCatalog = [
  {
    name: "retrieve_account_evidence",
    permission: "read",
    description: "Retrieve contract, billing, usage, support, and renewal notes for one account."
  },
  {
    name: "extract_entitlements",
    permission: "analyze",
    description: "Compare purchased entitlements with billed and observed usage."
  },
  {
    name: "score_revenue_leakage",
    permission: "analyze",
    description: "Estimate leakage from seat and usage deltas without writing to billing systems."
  },
  {
    name: "score_renewal_risk",
    permission: "analyze",
    description: "Score renewal risk using sentiment, escalation count, invoice status, and renewal timing."
  },
  {
    name: "draft_save_plan",
    permission: "draft",
    description: "Draft a dry-run action plan with citations and approval gates."
  }
];

export function retrieveAccountEvidence(account) {
  return {
    accountId: account.accountId,
    account: account.account,
    segment: account.segment,
    owner: account.owner,
    arr: account.arr,
    renewalDays: account.renewalDays,
    contract: account.contract,
    billing: account.billing,
    productUsage: account.productUsage,
    support: account.support,
    notes: account.notes,
    citations: [
      `contract:${account.accountId}`,
      `billing:${account.accountId}`,
      `usage:${account.accountId}`,
      `support:${account.accountId}`
    ]
  };
}

export function extractEntitlements(evidence) {
  const seatDelta = evidence.productUsage.activeSeats - evidence.contract.seatsPurchased;
  const usageDelta = evidence.productUsage.usageUnits - evidence.contract.includedUsageUnits;
  return {
    plan: evidence.contract.plan,
    seatDelta,
    usageDelta,
    overEntitledSeats: Math.max(0, seatDelta),
    usageOverageUnits: Math.max(0, usageDelta),
    citations: ["contract", "usage", "billing"].map((source) => `${source}:${evidence.accountId}`)
  };
}

export function scoreRevenueLeakage(evidence, entitlements) {
  const seatValue = evidence.arr / Math.max(1, evidence.contract.seatsPurchased);
  const seatLeakage = Math.round(entitlements.overEntitledSeats * seatValue);
  const usageLeakage = Math.round(entitlements.usageOverageUnits * evidence.contract.overageRate);
  const disputedCreditRisk = evidence.billing.lastInvoiceStatus === "disputed" ? evidence.billing.openCredits : 0;
  const estimatedLeakage = seatLeakage + usageLeakage + disputedCreditRisk;
  const tier = estimatedLeakage > 75000 ? "critical" : estimatedLeakage > 25000 ? "elevated" : "watch";

  return {
    seatLeakage,
    usageLeakage,
    disputedCreditRisk,
    estimatedLeakage,
    tier,
    citations: [`billing:${evidence.accountId}`, `usage:${evidence.accountId}`]
  };
}

export function scoreRenewalRisk(evidence, leakage) {
  let score = 20;
  score += evidence.renewalDays < 45 ? 25 : evidence.renewalDays < 90 ? 15 : 5;
  score += evidence.support.openEscalations * 9;
  score += evidence.billing.lastInvoiceStatus === "disputed" ? 20 : 0;
  score += leakage.estimatedLeakage > 50000 ? 15 : leakage.estimatedLeakage > 15000 ? 8 : 0;
  score += evidence.support.sentiment === "at risk" ? 18 : evidence.support.sentiment === "strained" ? 10 : 0;
  score = Math.min(100, score);

  return {
    score,
    tier: score >= 75 ? "critical" : score >= 55 ? "elevated" : "managed",
    drivers: [
      `${evidence.renewalDays} days to renewal`,
      `${evidence.support.openEscalations} open support escalations`,
      `${evidence.billing.lastInvoiceStatus} invoice status`,
      `$${leakage.estimatedLeakage.toLocaleString()} estimated leakage`
    ],
    citations: [`support:${evidence.accountId}`, `billing:${evidence.accountId}`]
  };
}

export function draftSavePlan(evidence, entitlements, leakage, renewalRisk, gates) {
  const actions = [
    `Validate ${entitlements.overEntitledSeats} over-entitled seats with ${evidence.owner}.`,
    `Prepare usage true-up worksheet for ${entitlements.usageOverageUnits.toLocaleString()} units.`,
    `Resolve ${evidence.support.openEscalations} open escalation(s) before renewal negotiation.`,
    `Create customer-facing renewal narrative grounded in contract and usage evidence.`
  ];

  return {
    executiveSummary: `${evidence.account} is ${renewalRisk.tier} renewal risk with ${leakage.tier} leakage exposure.`,
    actions,
    negotiationPlan: {
      posture: renewalRisk.tier === "critical" ? "executive-save" : leakage.tier === "critical" ? "commercial-true-up" : "standard-renewal",
      valueStory: [
        `Estimated leakage exposure: $${leakage.estimatedLeakage.toLocaleString()}.`,
        `Renewal risk score: ${renewalRisk.score}/100.`,
        `Account owner: ${evidence.owner}.`
      ],
      giveGets: [
        { give: "billing reconciliation support", get: "confirmed seat and usage baseline" },
        { give: "executive escalation path", get: "support escalation closure plan" },
        { give: "renewal narrative draft", get: "finance and legal approval before customer contact" }
      ],
      noGoCriteria: ["missing contract citation", "unresolved legal approval", "customer-facing claim not grounded in evidence"]
    },
    approvalGates: gates,
    customerSafeLanguage: "All recommendations are dry-run only and require finance, legal, or account-owner review before external action.",
    citations: [
      ...new Set([
        ...entitlements.citations,
        ...leakage.citations,
        ...renewalRisk.citations,
        `notes:${evidence.accountId}`
      ])
    ]
  };
}
