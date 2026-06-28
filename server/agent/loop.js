import { findAccount } from "./corpus.js";
import { approvalGates, classifyRequest } from "./policies.js";
import {
  draftSavePlan,
  extractEntitlements,
  retrieveAccountEvidence,
  scoreRenewalRisk,
  scoreRevenueLeakage
} from "./tools.js";

function event(name, payload = {}) {
  return {
    at: new Date().toISOString(),
    name,
    payload
  };
}

function validateCitations(plan) {
  if (!Array.isArray(plan.citations) || plan.citations.length < 3) {
    throw new Error("Agent output failed citation validation.");
  }
}

export async function runRevenueAgent(task, options = {}) {
  const runId = `rev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const maxSteps = Math.min(Number(options.maxSteps || 5), 8);
  const mode = options.mode || process.env.AGENT_MODE || "dry-run";
  const events = [event("observe", { task, mode, maxSteps })];

  const policy = classifyRequest(task);
  events.push(event("guardrail.check", policy));
  if (!policy.allowed) {
    return {
      runId,
      status: "blocked",
      reason: policy.reason,
      mode,
      events,
      toolCalls: [],
      citations: []
    };
  }

  const account = findAccount(options.accountId || task);
  events.push(event("decide.account", { accountId: account.accountId, account: account.account }));

  const toolCalls = [];
  const evidence = retrieveAccountEvidence(account);
  toolCalls.push({ name: "retrieve_account_evidence", ok: true, citations: evidence.citations });
  events.push(event("act.retrieve_account_evidence", { citations: evidence.citations.length }));

  const entitlements = extractEntitlements(evidence);
  toolCalls.push({ name: "extract_entitlements", ok: true, result: entitlements });
  events.push(event("act.extract_entitlements", { seatDelta: entitlements.seatDelta, usageDelta: entitlements.usageDelta }));

  const leakage = scoreRevenueLeakage(evidence, entitlements);
  toolCalls.push({ name: "score_revenue_leakage", ok: true, result: leakage });
  events.push(event("act.score_revenue_leakage", { estimatedLeakage: leakage.estimatedLeakage, tier: leakage.tier }));

  const renewalRisk = scoreRenewalRisk(evidence, leakage);
  toolCalls.push({ name: "score_renewal_risk", ok: true, result: renewalRisk });
  events.push(event("act.score_renewal_risk", { score: renewalRisk.score, tier: renewalRisk.tier }));

  const gates = approvalGates(account, leakage, renewalRisk);
  const plan = draftSavePlan(evidence, entitlements, leakage, renewalRisk, gates);
  validateCitations(plan);
  toolCalls.push({ name: "draft_save_plan", ok: true, result: { actionCount: plan.actions.length } });
  events.push(event("validate.output", { citationCount: plan.citations.length, gates: gates.length }));

  const status = gates.length > 1 || renewalRisk.score >= 70 ? "needs-review" : "completed";
  events.push(event("stop", { status }));

  return {
    runId,
    status,
    mode,
    account: {
      accountId: account.accountId,
      account: account.account,
      owner: account.owner,
      arr: account.arr,
      renewalDays: account.renewalDays
    },
    entitlements,
    leakage,
    renewalRisk,
    plan,
    approvals: gates,
    toolCalls,
    citations: plan.citations,
    events
  };
}
