import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import express from "express";
import { listEvidence } from "./agent/corpus.js";
import { runRevenueAgent } from "./agent/loop.js";
import { toolCatalog } from "./agent/tools.js";
import { operationalScorecard, recordError, recordRequest, recordRun, runtimeMetrics } from "./runtime.js";

export function createApp(options = {}) {
  const app = express();
  const traceDir = options.traceDir || path.join(process.cwd(), "traces");

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "128kb" }));
  app.use((req, res, next) => {
    res.setHeader("x-request-id", req.headers["x-request-id"] || Math.random().toString(36).slice(2, 10));
    res.setHeader("x-frame-options", "DENY");
    res.setHeader("content-security-policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'");
    res.setHeader("x-content-type-options", "nosniff");
    res.setHeader("referrer-policy", "no-referrer");
    res.on("finish", () => recordRequest(res.statusCode));
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      service: "revenueguard-agent-platform",
      mode: process.env.AGENT_MODE || "dry-run",
      writebackEnabled: process.env.CRM_WRITE_ENABLED === "true"
    });
  });

  app.get("/api/tools", (_req, res) => res.json(toolCatalog));
  app.get("/api/evidence", (_req, res) => res.json(listEvidence()));
  app.get("/api/metrics/runtime", (_req, res) => res.json(runtimeMetrics()));
  app.get("/api/metrics/scorecard", (_req, res) => res.json(operationalScorecard()));

  app.post("/api/runs", async (req, res, next) => {
    try {
      const body = req.body || {};
      const task = body.task || body.ask;
      if (typeof task !== "string" || task.trim().length < 8) {
        return res.status(400).json({ error: "task must be at least 8 characters" });
      }
      const run = await runRevenueAgent(task, {
        accountId: body.accountId || body.account,
        mode: body.mode,
        maxSteps: body.maxSteps
      });
      persistTrace(traceDir, run);
      recordRun(run);
      return res.status(run.status === "blocked" ? 422 : 200).json(run);
    } catch (error) {
      return next(error);
    }
  });

  app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

  const distPath = path.join(process.cwd(), "dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/.*/, (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.use((error, _req, res, _next) => {
    recordError();
    res.status(500).json({ error: "INTERNAL_ERROR", message: error.message });
  });

  return app;
}

function persistTrace(traceDir, run) {
  fs.mkdirSync(traceDir, { recursive: true });
  fs.writeFileSync(path.join(traceDir, `${run.runId}.json`), JSON.stringify(run, null, 2));
}
