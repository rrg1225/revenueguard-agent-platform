# Operations

## Local Gates

```bash
npm run ci:local
```

This runs repository health checks, operational checks, API tests, eval scenarios, and the production build.

## Runtime Observability

- `/api/metrics/runtime` exposes request, status, and error counters.
- `/api/metrics/scorecard` summarizes operational readiness checks.
- Agent runs are persisted to `traces/*.json` locally and ignored by Git.

## Failure Handling

Unsafe requests are blocked before tool execution. Failed tool validation returns a failed run with a trace event that identifies the tool.
