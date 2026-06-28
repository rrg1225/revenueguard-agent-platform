export const evidenceCorpus = [
  {
    accountId: "northstar-ai",
    account: "Northstar AI",
    segment: "Enterprise SaaS",
    owner: "Maya Chen",
    arr: 420000,
    renewalDays: 38,
    contract: {
      plan: "Enterprise",
      seatsPurchased: 240,
      includedUsageUnits: 1800000,
      overageRate: 0.018,
      supportSla: "premium",
      renewalClause: "Auto-renewal requires executive approval when net expansion exceeds 15%."
    },
    billing: {
      billedSeats: 240,
      billedUsageUnits: 1785000,
      openCredits: 0,
      lastInvoiceStatus: "paid"
    },
    productUsage: {
      activeSeats: 312,
      usageUnits: 2248000,
      adminSeats: 18,
      featureAdoption: ["workflow automation", "audit export", "private connectors"]
    },
    support: {
      openEscalations: 2,
      sentiment: "strained",
      themes: ["slow connector sync", "SAML provisioning defects"]
    },
    notes: [
      "Champion asked for usage true-up estimate before renewal call.",
      "Procurement flagged surprise overage sensitivity.",
      "Expansion team believes private connectors drove seat growth."
    ]
  },
  {
    accountId: "meridian-bank",
    account: "Meridian Bank",
    segment: "Regulated Financial Services",
    owner: "Jon Bell",
    arr: 860000,
    renewalDays: 72,
    contract: {
      plan: "Enterprise Plus",
      seatsPurchased: 540,
      includedUsageUnits: 4200000,
      overageRate: 0.024,
      supportSla: "premier",
      renewalClause: "Discount amendments require finance and legal review."
    },
    billing: {
      billedSeats: 540,
      billedUsageUnits: 4360000,
      openCredits: 25000,
      lastInvoiceStatus: "disputed"
    },
    productUsage: {
      activeSeats: 518,
      usageUnits: 5120000,
      adminSeats: 34,
      featureAdoption: ["audit export", "policy packs", "workspace isolation"]
    },
    support: {
      openEscalations: 4,
      sentiment: "at risk",
      themes: ["invoice dispute", "security questionnaire", "latency spike"]
    },
    notes: [
      "CFO requested detailed usage evidence before accepting true-up.",
      "Security review is blocking expansion signature.",
      "Customer success requested executive sponsor alignment."
    ]
  },
  {
    accountId: "atlas-logistics",
    account: "Atlas Logistics",
    segment: "Mid-Market Operations",
    owner: "Priya Shah",
    arr: 132000,
    renewalDays: 119,
    contract: {
      plan: "Growth",
      seatsPurchased: 105,
      includedUsageUnits: 620000,
      overageRate: 0.012,
      supportSla: "standard",
      renewalClause: "Usage true-up can be quoted by RevOps after account owner review."
    },
    billing: {
      billedSeats: 105,
      billedUsageUnits: 608000,
      openCredits: 0,
      lastInvoiceStatus: "paid"
    },
    productUsage: {
      activeSeats: 96,
      usageUnits: 641500,
      adminSeats: 6,
      featureAdoption: ["routing dashboards", "weekly exports"]
    },
    support: {
      openEscalations: 0,
      sentiment: "healthy",
      themes: ["report formatting"]
    },
    notes: [
      "Operations lead asked about adding 20 seats next quarter.",
      "No finance objections in latest QBR.",
      "Usage is slightly above plan but trend is predictable."
    ]
  }
];

export function listEvidence() {
  return evidenceCorpus.map((item) => ({
    accountId: item.accountId,
    account: item.account,
    segment: item.segment,
    owner: item.owner,
    arr: item.arr,
    renewalDays: item.renewalDays,
    sentiment: item.support.sentiment
  }));
}

export function findAccount(accountIdOrName) {
  const target = String(accountIdOrName || "").toLowerCase();
  return evidenceCorpus.find((item) => {
    return item.accountId === target || item.account.toLowerCase().includes(target);
  }) || evidenceCorpus[0];
}
