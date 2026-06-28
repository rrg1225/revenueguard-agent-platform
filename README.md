# RevenueGuard Agent Platform

[![CI](https://github.com/rrg1225/revenueguard-agent-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/rrg1225/revenueguard-agent-platform/actions/workflows/ci.yml)
![AI Agent](https://img.shields.io/badge/AI-Agent%20RevOps-0F766E)
![Guardrails](https://img.shields.io/badge/Guardrails-Dry%20Run%20Only-7C3AED)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

RevenueGuard Agent Platform is a full-stack RevOps AI agent workspace for finding revenue leakage, contract entitlement drift, usage anomalies, and renewal risk before they reach finance close or customer escalation.

The project demonstrates production-grade agent engineering in a portfolio-friendly domain: deterministic tool orchestration, evidence-grounded outputs, policy guardrails, dry-run action plans, audit traces, operational scorecards, and regression evals. It runs without external services by default, while keeping clear extension points for CRM, billing, warehouse, and model-provider adapters.

## Highlights

- Deterministic observe -> decide -> act -> validate -> handoff agent loop.
- Seeded evidence retrieval across contracts, usage, billing, support, and renewal notes.
- Tool contracts for entitlement extraction, usage anomaly detection, leakage scoring, renewal risk, and save-plan drafting.
- Guardrails that block fabricated evidence, approval bypass, and external write instructions.
- Human-in-the-loop gates for writeback, discounting, credit memos, and high-value accounts.
- React operations console for account input, risk posture, leakage summary, action plan, citations, and trace inspection.
- Express API with request IDs, hardened headers, runtime metrics, operational scorecard, and persisted local traces.
- API tests plus scenario evals covering healthy, high-risk, and unsafe requests.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API defaults to `http://localhost:4740`.

## Scripts

```bash
npm run ci:local  # health checks, ops checks, tests, evals, build
npm test          # API tests and deterministic eval scenarios
npm run eval      # scenario replay for agent behavior
npm run build     # production React bundle
npm run start     # serve API and built frontend
```

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Service health and provider mode |
| `GET` | `/api/tools` | Agent tool catalog and permissions |
| `GET` | `/api/evidence` | Seeded RevOps evidence corpus |
| `GET` | `/api/metrics/runtime` | Request and status metrics |
| `GET` | `/api/metrics/scorecard` | Operational readiness checks |
| `POST` | `/api/runs` | Execute a RevOps agent run and persist trace |

## Environment

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `4740` | Express API port |
| `AGENT_MODE` | `dry-run` | Agent execution mode |
| `CRM_WRITE_ENABLED` | `false` | Reserved for future explicit writeback adapters |
| `OPENAI_API_KEY` | empty | Optional future provider key; deterministic mode works without it |

## Portfolio Positioning

This project is designed to be credible in interviews because it shows how an AI agent can operate inside a revenue workflow without pretending to perform irreversible actions. The system separates read-only analysis from writeback permissions, validates every tool output, preserves traceability, and turns raw operational signals into an executive-ready leakage and renewal risk plan.
