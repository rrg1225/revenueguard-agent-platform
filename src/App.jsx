import { useEffect, useMemo, useState } from "react";

const sampleTasks = {
  "northstar-ai": "Review revenue leakage, renewal posture, and dry-run save plan for Northstar AI.",
  "meridian-bank": "Assess renewal risk, leakage exposure, and a dry-run save plan for Meridian Bank.",
  "atlas-logistics": "Review entitlement drift and renewal risk for Atlas Logistics with citations."
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function App() {
  const [evidence, setEvidence] = useState([]);
  const [scorecard, setScorecard] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState("northstar-ai");
  const [task, setTask] = useState(sampleTasks["northstar-ai"]);
  const [run, setRun] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/evidence").then((res) => res.json()),
      fetch("/api/metrics/scorecard").then((res) => res.json())
    ]).then(([evidenceData, scorecardData]) => {
      setEvidence(evidenceData);
      setScorecard(scorecardData);
    }).catch(() => setError("API unavailable"));
  }, []);

  const account = useMemo(() => {
    return evidence.find((item) => item.accountId === selectedAccount) || evidence[0];
  }, [evidence, selectedAccount]);

  function chooseAccount(accountId) {
    setSelectedAccount(accountId);
    setTask(sampleTasks[accountId] || sampleTasks["northstar-ai"]);
    setRun(null);
    setError("");
  }

  async function executeRun(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accountId: selectedAccount, task })
      });
      const data = await response.json();
      setRun(data);
      if (!response.ok) setError(data.reason || data.error || "Run blocked");
    } catch {
      setError("Run failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">RevenueGuard</p>
          <h1>RevOps Agent Command Center</h1>
        </div>
        <div className="score-strip">
          <Metric label="Ops score" value={scorecard ? `${scorecard.score}` : "--"} />
          <Metric label="Mode" value="dry-run" />
          <Metric label="Accounts" value={String(evidence.length || "--")} />
        </div>
      </section>

      <section className="workspace">
        <aside className="account-rail">
          {evidence.map((item) => (
            <button
              className={item.accountId === selectedAccount ? "account-row active" : "account-row"}
              key={item.accountId}
              type="button"
              onClick={() => chooseAccount(item.accountId)}
            >
              <span>
                <strong>{item.account}</strong>
                <small>{item.segment}</small>
              </span>
              <b>{item.renewalDays}d</b>
            </button>
          ))}
        </aside>

        <section className="run-panel">
          <div className="account-summary">
            <Metric label="ARR" value={account ? money.format(account.arr) : "--"} />
            <Metric label="Owner" value={account?.owner || "--"} />
            <Metric label="Sentiment" value={account?.sentiment || "--"} />
          </div>

          <form onSubmit={executeRun} className="agent-form">
            <label htmlFor="task">Agent task</label>
            <textarea id="task" value={task} onChange={(event) => setTask(event.target.value)} />
            <button type="submit" disabled={loading}>{loading ? "Running" : "Run Agent"}</button>
          </form>

          {error && <div className="error-band">{error}</div>}

          {run && (
            <section className="result-grid">
              <div className="result-block wide">
                <p className="eyebrow">Run {run.status}</p>
                <h2>{run.plan?.executiveSummary || run.reason}</h2>
              </div>

              {run.leakage && (
                <div className="result-block">
                  <p className="eyebrow">Leakage</p>
                  <h3>{money.format(run.leakage.estimatedLeakage)}</h3>
                  <Bar value={run.leakage.estimatedLeakage} max={120000} />
                </div>
              )}

              {run.renewalRisk && (
                <div className="result-block">
                  <p className="eyebrow">Renewal risk</p>
                  <h3>{run.renewalRisk.score}/100</h3>
                  <Bar value={run.renewalRisk.score} max={100} />
                </div>
              )}

              {run.plan && (
                <div className="result-block wide">
                  <p className="eyebrow">Action plan</p>
                  <ul>
                    {run.plan.actions.map((action) => <li key={action}>{action}</li>)}
                  </ul>
                </div>
              )}

              {run.approvals && (
                <div className="result-block">
                  <p className="eyebrow">Approval gates</p>
                  <ul>
                    {run.approvals.map((gate) => <li key={gate}>{gate}</li>)}
                  </ul>
                </div>
              )}

              <div className="result-block">
                <p className="eyebrow">Trace</p>
                <ol className="trace-list">
                  {run.events.map((item) => <li key={`${item.at}-${item.name}`}>{item.name}</li>)}
                </ol>
              </div>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Bar({ value, max }) {
  const width = `${Math.max(8, Math.min(100, Math.round((value / max) * 100)))}%`;
  return <div className="bar"><span style={{ width }} /></div>;
}
