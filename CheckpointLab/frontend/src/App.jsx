import { useCallback, useEffect, useState } from "react";
import {
  Activity, AlertTriangle, Archive, CheckCircle2, CircleHelp,
  Clock3, Cpu, Database, Play, Pause, RotateCcw, Save,
  ShieldCheck, Square, Trash2, Zap
} from "lucide-react";

const API = "http://127.0.0.1:8000/api";

function timeLabel(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function App() {
  const [data, setData] = useState(null);
  const [recoveryComparison, setRecoveryComparison] = useState(null);
  useEffect(() => {
  if (!data?.last_recovery) return;

  setRecoveryComparison({
    beforeProgress:
      Number(data.process.progress ?? 0) +
      Number(data.last_recovery.lost_work ?? 0),
    restoredProgress: Number(data.last_recovery.restored_progress ?? 0),
    checkpointId: data.last_recovery.checkpoint_id,
    lostWork: Number(data.last_recovery.lost_work ?? 0),
  });
}, [data]);
  const [units, setUnits] = useState(10);
  const [totalWork, setTotalWork] = useState(100);
  const [failureAt, setFailureAt] = useState("");
  const [label, setLabel] = useState("");
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`${API}/dashboard`);
      if (!response.ok) throw new Error("Could not load dashboard.");
      setData(await response.json());
    } catch {
      setNotice({ type: "error", text: "Backend is not reachable. Start FastAPI on port 8000." });
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  async function action(path, options = {}) {
    setBusy(true);
    setNotice({ type: "", text: "" });
    try {
      const response = await fetch(`${API}${path}`, {
        method: options.method || "POST",
        headers: { "Content-Type": "application/json" },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Request failed.");
      
if (path.startsWith("/process/recover") && result.last_recovery) {
  setRecoveryComparison({
    beforeProgress: Number(data?.process?.progress ?? 0),
    restoredProgress: Number(result.last_recovery.restored_progress ?? 0),
    checkpointId: result.last_recovery.checkpoint_id,
    lostWork: Number(result.last_recovery.lost_work ?? 0),
  });
}

      setData(result);
      if (result.last_recovery) {
        const r = result.last_recovery;
        setNotice({
          type: "success",
          text: `Recovered from ${r.checkpoint_id}. Restored to ${r.restored_progress}; ${r.lost_work} unit(s) of work were repeated.`,
        });
      } else {
        const messages = {
          "/process/pause": "Process paused.",
          "/process/resume": "Process resumed.",
          "/process/failure-config": "Failure configuration updated.",
          "/process/run": "Process advanced.",
          "/checkpoints": "Checkpoint saved to JSON storage.",
          "/process/crash": "Failure simulated. Recover from a checkpoint to continue.",
          "/process/reset": "A new process has been initialized.",
        };
        setNotice({ type: "success", text: messages[path] || "Operation completed." });
      }
      if (path === "/checkpoints") setLabel("");
    } catch (error) {
      setNotice({ type: "error", text: error.message });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deleteCheckpoint(id) {
    setBusy(true);
    try {
      const response = await fetch(`${API}/checkpoints/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Could not delete checkpoint.");
      setData(result);
      setNotice({ type: "success", text: `${id} deleted.` });
      if (selectedCheckpoint === id) setSelectedCheckpoint("");
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return <main className="loading"><div className="spinner" /><h2>Connecting to CheckpointLab</h2><p>Make sure the FastAPI backend is running.</p></main>;
  }

  const { process: proc, metrics, checkpoints, events } = data;
  const progress = metrics.progress_percent;
  
const lastRecoveryLost = data.last_recovery?.lost_work ?? null;

const recoveryRate =
  metrics.failure_count > 0
    ? Math.round(
        (metrics.recovery_count / metrics.failure_count) * 100
      )
    : 0;

// A simple checkpoint-spacing score for demonstration.
// Smaller average gaps between checkpoints produce a higher score.
const checkpointPositions = [
  0,
  ...checkpoints.map((cp) => Number(cp.progress)),
  Number(proc.total_work),
].sort((a, b) => a - b);

const checkpointGaps = checkpointPositions
  .slice(1)
  .map((position, index) => position - checkpointPositions[index]);

const averageCheckpointGap =
  checkpointGaps.length > 0
    ? checkpointGaps.reduce((sum, gap) => sum + gap, 0) /
      checkpointGaps.length
    : Number(proc.total_work);

const checkpointEfficiency =
  Number(proc.total_work) > 0
    ? Math.round(
        (1 - averageCheckpointGap / Number(proc.total_work)) * 100
      )
    : 0;

  const isFailed = proc.state === "Failed";
  const isCompleted = proc.state === "Completed";
  const isPaused = proc.state === "Paused";
  
  return (
     <div className = "app-shell">   
<aside className="sidebar">
  <div className="brand">
    <div className="brand-icon"><Cpu size={22} /></div>
    <div>
      <b>CheckpointLab</b>
      <span>OPERATING SYSTEMS LAB</span>
    </div>
  </div>

  
<div className="side-label">WORKSPACE</div>

<a className="nav-item" href="#process-simulator">
  <Activity size={18} />
  <span>Process Visualization Lab</span>
</a>

<a className="nav-item" href="#checkpoint-manager">
  <Archive size={18} />
  <span>Checkpoint Manager</span>
</a>

<a className="nav-item" href="#recovery-analytics">
  <ShieldCheck size={18} />
  <span>Recovery Analytics</span>
</a>

<a className="nav-item" href="#how-it-works">
  <span className="nav-step-number">05</span>
  <span>How It Works</span>
</a>


<a className="nav-item" href="#event-log">
  <Clock3 size={18} />
  <span>Execution Event Log</span>
</a>

</aside>
      <main className="main-content">
        <header className="topbar">
          <div><div className="eyebrow">OS COURSE PROJECT / SIMULATION</div><h1>Process checkpoint & recovery</h1><p>Explore fault tolerance through checkpointing and rollback recovery.</p></div>
          <div className={`status-pill ${proc.state.toLowerCase()}`}><span />{proc.state}</div>
        </header>

        {notice.text && <div className={`notice ${notice.type}`} role="status">{notice.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}{notice.text}<button onClick={() => setNotice({ type: "", text: "" })} aria-label="Dismiss">×</button></div>}

        <section className="metric-grid">
          <Metric icon={<Activity />} label="Process progress" value={`${proc.progress} / ${proc.total_work}`} detail={`${progress}% completed`} />
          <Metric icon={<Archive />} label="Saved checkpoints" value={metrics.checkpoint_count} detail={metrics.latest_checkpoint_id ? `Latest: ${metrics.latest_checkpoint_id}` : "No checkpoints yet"} />
          <Metric icon={<Zap />} label="Simulated failures" value={metrics.failure_count} detail="Injected process failures" />
          <Metric icon={<RotateCcw />} label="Recoveries" value={metrics.recovery_count} detail="Successful rollbacks" />
        </section>

        <div className="content-grid">
          <section id="process-simulator" className="panel process-panel">
            <div className="panel-heading"><div><div className="eyebrow">LIVE SIMULATION</div><h2>Process Visualization</h2></div><span className="process-id">{proc.process_id}</span></div>
            <div className="progress-summary"><div><span className="muted">Current progress</span><strong>{proc.progress}<small> / {proc.total_work} units</small></strong></div><div className="percent">{progress}%</div></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <div className="progress-labels"><span>0 units</span><span>{proc.total_work} units</span></div>

            <div className="timeline">
              <div className="timeline-line" />
              <div className="timeline-point start"><span>START</span><i /></div>
              {checkpoints.slice().reverse().map((cp) => (
                <div key={cp.id} className="timeline-point checkpoint" style={{ left: `${Math.max(2, Math.min(98, cp.progress / proc.total_work * 100))}%` }} title={`${cp.id} at ${cp.progress}`}>
                  <i /><span>{cp.id}</span>
                </div>
              ))}
              {events.filter((e) => e.type === "failure").slice(0, 1).map((e) => (
                <div key={e.id} className="timeline-point failure" style={{ left: `${Math.max(2, Math.min(98, e.progress / proc.total_work * 100))}%` }} title="Failure point"><i /><span>FAILURE</span></div>
              ))}
              <div className="timeline-point end"><i /><span>END</span></div>
            </div>
            <div className="legend"><span><i className="legend-blue" /> Checkpoint</span><span><i className="legend-red" /> Failure</span><span><i className="legend-gray" /> Process range</span></div>

            <div className="control-box">
              <div className="control-title"><h3>Simulation controls</h3><span>Choose an operation</span></div>
              <div className="run-controls">
                <label>Work units per step<select value={units} onChange={(e) => setUnits(Number(e.target.value))}><option value={5}>5 units</option><option value={10}>10 units</option><option value={20}>20 units</option><option value={25}>25 units</option><option value={50}>50 units</option></select></label>
                <button className="btn btn-primary" disabled={busy || isFailed || isCompleted} onClick={() => action("/process/run", { body: { units } })}><Play size={16} fill="currentColor" /> Run process</button>
              </div>
              <div className="button-row">
                <button className="btn btn-green" disabled={busy || isFailed} onClick={() => action("/checkpoints", { body: { label } })}><Save size={16} /> Save checkpoint</button>
                <button className="btn btn-danger" disabled={busy || isFailed || isCompleted} onClick={() => action("/process/crash")}><Zap size={16} /> Simulate crash</button>
                <button className="btn btn-purple" disabled={busy || checkpoints.length === 0} onClick={() => action(`/process/recover${selectedCheckpoint ? `?checkpoint_id=${encodeURIComponent(selectedCheckpoint)}` : ""}`)}><RotateCcw size={16} /> Recover</button>
              </div>
              
<div className="button-row">
  <button
    className="btn btn-purple"
    disabled={busy || isFailed || isCompleted || isPaused}
    onClick={() => action("/process/pause")}
  >
    <Pause size={16} /> Pause
  </button>

  <button
    className="btn btn-primary"
    disabled={busy || !isPaused}
    onClick={() => action("/process/resume")}
  >
    <Play size={16} /> Resume
  </button>
</div>

<div className="failure-config" style={{ marginTop: "16px" }}>
  <label className="field-label">
    Inject failure at work unit
    <input
      type="number"
      min={proc.progress + 1}
      max={proc.total_work}
      value={failureAt}
      onChange={(e) => setFailureAt(e.target.value)}
      placeholder={`Enter ${proc.progress + 1}-${proc.total_work}`}
      disabled={busy || isFailed || isCompleted || isPaused}
    />
  </label>

  <div className="button-row">
    <button
      className="btn btn-danger"
      disabled={
        busy ||
        isFailed ||
        isCompleted ||
        isPaused ||
        failureAt === "" ||
        Number(failureAt) <= proc.progress ||
        Number(failureAt) > proc.total_work
      }
      onClick={() =>
        action("/process/failure-config", {
          body: { failure_at: Number(failureAt) }
        })
      }
    >
      <Zap size={16} /> Schedule failure
    </button>

    <button
      className="btn"
      disabled={busy || isFailed || isCompleted || isPaused}
      onClick={() => {
        setFailureAt("");
        action("/process/failure-config", {
          body: { failure_at: null }
        });
      }}
    >
      Clear failure
    </button>
  </div>
</div>

              <p className="control-hint"><CircleHelp size={14} /> Save a checkpoint before simulating a crash to enable rollback recovery.</p>
            </div>
            
<div className="recovery-comparison">
  <div className="comparison-heading">
    <div>
      <div className="eyebrow">RECOVERY REPORT</div>
      <h3>Recovery Comparison</h3>
    </div>
    <RotateCcw size={20} />
  </div>

  {!recoveryComparison ? (
    <p className="comparison-empty">
      Run the process, save a checkpoint, simulate a crash, and recover
      to compare the process states.
    </p>
  ) : (
    <>
      <div className="comparison-grid">
        <div className="comparison-stat">
          <span>Before recovery</span>
          <strong>{recoveryComparison.beforeProgress}</strong>
          <small>Work units reached</small>
        </div>

        <div className="comparison-stat">
          <span>After recovery</span>
          <strong>{recoveryComparison.restoredProgress}</strong>
          <small>Work units restored</small>
        </div>

        <div className="comparison-stat lost">
          <span>Work to repeat</span>
          <strong>{recoveryComparison.lostWork}</strong>
          <small>Units lost to rollback</small>
        </div>
      </div>

      <div className="comparison-rollback">
        <span>RESTORED CHECKPOINT</span>
        <strong>{recoveryComparison.checkpointId}</strong>
        <span className="rollback-arrow">
          {recoveryComparison.beforeProgress}
          {"  ←  "}
          {recoveryComparison.restoredProgress}
        </span>
      </div>
    </>
  )}
</div>

          </section>

          <section id="checkpoint-manager" className="panel checkpoint-panel">
            <div className="panel-heading"><div><div className="eyebrow">SNAPSHOT STORAGE</div><h2>Checkpoint manager</h2></div><Database className="heading-icon" size={21} /></div>
            <label className="field-label">Checkpoint label (optional)<input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Before phase 2" maxLength={60} /></label>
            <label className="field-label">Recovery target<select value={selectedCheckpoint} onChange={(e) => setSelectedCheckpoint(e.target.value)}><option value="">Latest checkpoint</option>{checkpoints.map((cp) => <option key={cp.id} value={cp.id}>{cp.id} — unit {cp.progress}</option>)}</select></label>
            <div className="checkpoint-list-heading"><h3>Saved snapshots</h3><span>{checkpoints.length} total</span></div>
            <div className="checkpoint-list">
              {checkpoints.length === 0 ? <div className="empty-state"><Archive size={28} /><b>No checkpoints saved</b><span>Save the current process state to create your first snapshot.</span></div> : checkpoints.map((cp) => (
                <div className={`checkpoint-card ${selectedCheckpoint === cp.id ? "selected" : ""}`} key={cp.id}>
                  <button className="checkpoint-select" onClick={() => setSelectedCheckpoint(cp.id)} title="Select recovery target"><div className="checkpoint-icon"><Save size={17} /></div><div className="checkpoint-info"><b>{cp.label}</b><span>{cp.id} · {cp.progress}/{cp.total_work} units</span><small><Clock3 size={12} /> {timeLabel(cp.created_at)}</small></div></button>
                  <button className="icon-button" disabled={busy} onClick={() => deleteCheckpoint(cp.id)} title={`Delete ${cp.id}`}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            <div className="storage-note"><Database size={15} /><span>Snapshots are stored as JSON files in <code>backend/data/checkpoints/</code>.</span></div>
          </section>
        </div>

        <section id="event-log" className="panel event-panel">
          <div className="panel-heading"><div><div className="eyebrow">AUDIT TRAIL</div><h2>Execution event log</h2></div><span className="event-count">{events.length} events</span></div>
          <div className="event-table-wrap"><table><thead><tr><th>EVENT</th><th>DESCRIPTION</th><th>PROGRESS</th><th>TIME</th></tr></thead><tbody>{events.slice(0, 12).map((event) => <tr key={event.id}><td><EventTag type={event.type} /></td><td>{event.message}</td><td>{event.progress} units</td><td className="time-cell">{timeLabel(event.time)}</td></tr>)}</tbody></table></div>
        </section>
        
<section id="recovery-analytics" className="panel analytics-panel">
  <div className="panel-heading">
    <div>
      <div className="eyebrow">FAULT TOLERANCE / REPORT</div>
      <h2>Recovery Analytics</h2>
    </div>
    <ShieldCheck className="heading-icon" size={22} />
  </div>

  <p className="analytics-description">
    Evaluate rollback cost, checkpoint spacing, and recovery outcomes
    using the current simulation data.
  </p>

  <div className="analytics-grid">
    <div className="analytics-card">
      <span>Latest work lost</span>
      <strong>
        {lastRecoveryLost === null ? "—" : lastRecoveryLost}
      </strong>
      <small>Work units repeated after rollback</small>
    </div>

    <div className="analytics-card">
      <span>Recovery success rate</span>
      <strong>{recoveryRate}%</strong>
      <small>
        {metrics.recovery_count} recoveries / {metrics.failure_count} failures
      </small>
    </div>

    <div className="analytics-card">
      <span>Checkpoint efficiency</span>
      <strong>{checkpointEfficiency}%</strong>
      <small>Checkpoint-spacing demonstration score</small>
    </div>

    <div className="analytics-card">
      <span>Average checkpoint gap</span>
      <strong>{Math.round(averageCheckpointGap)}</strong>
      <small>Work units between timeline positions</small>
    </div>
  </div>

  <div className="analytics-note">
    <b>How to interpret this</b>
    <p>
      Saving checkpoints more frequently can reduce rollback work, but
      also increases checkpoint storage and overhead. This score measures
      spacing only; it does not measure storage cost or execution time.
    </p>
  </div>
</section>

<section id="how-it-works" className="panel how-it-works-panel">
  <div className="panel-heading">
    <div>
      <div className="eyebrow">SYSTEM GUIDE / 05</div>
      <h2>How CheckpointLab Works</h2>
    </div>
    <span className="how-status">PROCESS LIFECYCLE</span>
  </div>

  <p className="how-intro">
    Explore how process execution, checkpointing, failure simulation,
    and rollback recovery work together in an operating system.
    Scroll through each step to learn the complete lifecycle.
  </p>

  <div className="how-steps">

    <article className="how-step">
      <div className="how-step-marker">01</div>
      <div className="how-step-content">
        <span className="how-kicker">EXECUTION</span>
        <h3>Run the process</h3>
        <p>
          The process performs work in units. Its progress increases
          as execution continues toward the configured total.
        </p>
        <div className="how-visual">
          <span>START</span>
          <div className="how-track">
            <span className="how-track-progress" />
            <i /><i /><i /><i />
          </div>
          <span>END</span>
        </div>
        <p className="how-note">
          OS concept: process execution and progress tracking.
        </p>
      </div>
    </article>

    <article className="how-step">
      <div className="how-step-marker">02</div>
      <div className="how-step-content">
        <span className="how-kicker">CHECKPOINTING</span>
        <h3>Save a checkpoint</h3>
        <p>
          A checkpoint records a saved process state. If a failure
          occurs later, the simulator can restore an available snapshot.
        </p>
        <div className="how-visual checkpoint-visual">
          <span>PROCESS</span>
          <div className="how-track">
            <i /><i className="how-checkpoint-node" /><i /><i />
          </div>
          <span className="how-highlight">CP-001</span>
        </div>
        <p className="how-note">
          OS concept: saving state for recovery.
        </p>
      </div>
    </article>

    <article className="how-step">
      <div className="how-step-marker failure-marker">03</div>
      <div className="how-step-content">
        <span className="how-kicker failure-text">FAILURE SIMULATION</span>
        <h3>Simulate a crash</h3>
        <p>
          A simulated failure interrupts execution. Work completed
          after the last usable checkpoint may need to be repeated.
        </p>
        <div className="how-visual failure-visual">
          <span>CHECKPOINT</span>
          <div className="how-track">
            <i /><i className="how-checkpoint-node" />
            <i /><i className="how-failure-node">×</i>
          </div>
          <span className="failure-text">FAILURE</span>
        </div>
        <p className="how-note">
          OS concept: failure handling and lost work.
        </p>
      </div>
    </article>

    <article className="how-step">
      <div className="how-step-marker">04</div>
      <div className="how-step-content">
        <span className="how-kicker">ROLLBACK RECOVERY</span>
        <h3>Recover and compare</h3>
        <p>
          Recovery restores the selected checkpoint. The Recovery
          Comparison panel shows progress before recovery, restored
          progress, and the amount of work rolled back.
        </p>
        <div className="how-visual recovery-visual">
          <span className="how-highlight">40 units</span>
          <span className="rollback-symbol">←</span>
          <span>20 units restored</span>
        </div>
        <p className="how-note">
          OS concept: rollback, restored state, and recovery analysis.
        </p>
      </div>
    </article>

  </div>

  <div className="how-footer">
    <span className="how-live-dot" />
    <span>LEARN THE LIFECYCLE</span>
    <a href="#process-visualization">Return to simulator ↑</a>
  </div>
</section>



        <section className="bottom-grid">
          <div className="info-card"><div className="info-icon blue"><Archive size={19} /></div><div><h3>Checkpointing</h3><p>Save a consistent snapshot of progress and process metadata for later restoration.</p></div></div>
          <div className="info-card"><div className="info-icon red"><RotateCcw size={19} /></div><div><h3>Rollback recovery</h3><p>Restore a previous snapshot after failure and repeat the work performed after it.</p></div></div>
          <div className="info-card"><div className="info-icon green"><ShieldCheck size={19} /></div><div><h3>Fault tolerance</h3><p>Measure how checkpoint frequency affects the amount of work lost after a failure.</p></div></div>
        </section>

        <footer><span>CheckpointLab · Operating Systems Project</span><button className="reset-button" disabled={busy} onClick={() => { if (window.confirm("Start a new process? Existing checkpoints will be kept.")) action("/process/reset", { body: { total_work: totalWork } }); }}><RotateCcw size={14} /> Reset process</button><label className="reset-work">Total work <input type="number" min="1" max="100000" value={totalWork} onChange={(e) => setTotalWork(Math.max(1, Math.min(100000, Number(e.target.value) || 1)))} /></label></footer>
      </main>
    </div>
  );
}

function Metric({ icon, label, value, detail }) {
  return <div className="metric-card"><div className="metric-top"><span>{label}</span><div className="metric-icon">{icon}</div></div><div className="metric-value">{value}</div><div className="metric-detail">{detail}</div></div>;
}

function EventTag({ type }) {
  const labels = { system: "SYSTEM", execution: "EXECUTION", checkpoint: "CHECKPOINT", failure: "FAILURE", recovery: "RECOVERY", success: "SUCCESS" };
  return <span className={`event-tag ${type}`}>{labels[type] || type.toUpperCase()}</span>;
}

export default App;
