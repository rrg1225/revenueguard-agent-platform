# Architecture

RevenueGuard is intentionally deterministic so the agent workflow is easy to inspect, test, and extend.

## Agent Loop

1. Observe the account request and classify policy risk.
2. Search a seeded evidence corpus for contract, usage, billing, support, and renewal records.
3. Extract contract entitlements and compare them to usage signals.
4. Score revenue leakage and renewal risk.
5. Draft a dry-run save plan with approval gates.
6. Validate every tool result and persist an audit trace.

## Boundaries

- Read-only tools can inspect evidence.
- Analysis tools can calculate risk and leakage.
- Write tools are represented as dry-run action plans only.
- Approval-sensitive requests are blocked or routed to human review.

## Extension Points

- Replace seeded evidence with a warehouse, billing API, CRM, or vector index.
- Add model-backed summarization behind the same tool contracts.
- Add explicit writeback adapters only after approval state is represented in code.
