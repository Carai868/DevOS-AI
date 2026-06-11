/**
 * RunnerPanel — PyRunner integration panel
 * Design: Brutalist Terminal — hard borders, status dots, log streaming
 * Features: Script list, run triggers, run history, log viewer, schedule editor
 */

import { useState, useRef, useEffect } from "react";
import { Play, Clock, Trash2, Plus, ChevronDown, ChevronRight, RefreshCw, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { useIDE, PyRunnerScript, RunRecord } from "@/contexts/IDEContext";
import { toast } from "sonner";

function formatDuration(ms?: number) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  } catch { return iso; }
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch { return iso; }
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`ide-badge ${status}`}>{status}</span>;
}

function ScriptRow({ script }: { script: PyRunnerScript }) {
  const { runScript, removeScript, activeRunId, runs, setActiveRunId, updateScriptSchedule } = useIDE();
  const [showSchedule, setShowSchedule] = useState(false);
  const [cronInput, setCronInput] = useState(script.schedule || "");

  const latestRun = runs.find((r) => r.scriptId === script.id);

  const handleRun = () => {
    runScript(script.id);
    toast.success(`Running ${script.name}...`);
  };

  const handleScheduleSave = () => {
    updateScriptSchedule(script.id, cronInput);
    setShowSchedule(false);
    toast.success(cronInput ? `Scheduled: ${cronInput}` : "Schedule removed");
  };

  return (
    <div style={{ borderBottom: "1px solid #1E1E1E" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          gap: 8,
          background: latestRun && activeRunId === latestRun.id ? "rgba(0,255,135,0.04)" : "transparent",
        }}
      >
        {/* Status dot */}
        <span className={`ide-status-dot ${script.status}`} />

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#E8E8E8", fontWeight: 700 }}>{script.name}</span>
            <StatusBadge status={script.status} />
          </div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 2, display: "flex", gap: 8 }}>
            {script.lastRun && <span>Last: {formatDate(script.lastRun)}</span>}
            {script.schedule && <span style={{ color: "#FFAA00" }}>⏱ {script.schedule}</span>}
            <span>Runs: {script.runCount}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button
            className="ide-btn primary"
            onClick={handleRun}
            disabled={script.status === "running"}
            title="Run now"
            style={{ opacity: script.status === "running" ? 0.5 : 1 }}
          >
            {script.status === "running"
              ? <RefreshCw size={10} style={{ animation: "spin 1s linear infinite" }} />
              : <Play size={10} />
            }
          </button>
          <button
            className="ide-btn"
            onClick={() => setShowSchedule((s) => !s)}
            title="Schedule"
          >
            <Clock size={10} />
          </button>
          {latestRun && (
            <button
              className="ide-btn"
              onClick={() => setActiveRunId(latestRun.id)}
              title="View logs"
              style={{ color: activeRunId === latestRun.id ? "#00FF87" : undefined }}
            >
              <ChevronRight size={10} />
            </button>
          )}
          <button
            className="ide-btn"
            onClick={() => { removeScript(script.id); toast.success(`Removed ${script.name}`); }}
            title="Remove from PyRunner"
            style={{ color: "#FF4444" }}
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {/* Schedule editor */}
      {showSchedule && (
        <div style={{ padding: "8px 12px 10px", borderTop: "1px solid #1E1E1E", background: "#111" }}>
          <div className="ide-label" style={{ marginBottom: 6 }}>Cron Schedule (UTC)</div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="ide-input"
              placeholder="0 8 * * * (daily at 08:00)"
              value={cronInput}
              onChange={(e) => setCronInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScheduleSave()}
              style={{ flex: 1 }}
            />
            <button className="ide-btn primary" onClick={handleScheduleSave}>
              <Calendar size={10} /> Save
            </button>
          </div>
          <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>
            Examples: <span style={{ color: "#555" }}>0 8 * * *</span> (daily 8am) · <span style={{ color: "#555" }}>*/30 * * * *</span> (every 30m) · <span style={{ color: "#555" }}>0 2 * * 0</span> (weekly Sun 2am)
          </div>
        </div>
      )}
    </div>
  );
}

function LogViewer({ run }: { run: RunRecord }) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [run.logs.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Run header */}
      <div style={{ padding: "8px 12px", borderBottom: "1px solid #1E1E1E", background: "#111", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          {run.status === "running" ? (
            <RefreshCw size={11} style={{ color: "#00FF87", animation: "spin 1s linear infinite" }} />
          ) : run.status === "success" ? (
            <CheckCircle size={11} style={{ color: "#00FF87" }} />
          ) : (
            <AlertCircle size={11} style={{ color: "#FF4444" }} />
          )}
          <span style={{ fontSize: 12, fontWeight: 700, color: "#E8E8E8" }}>{run.scriptName}</span>
          <StatusBadge status={run.status} />
        </div>
        <div style={{ fontSize: 10, color: "#555", display: "flex", gap: 12 }}>
          <span>Started: {formatTime(run.startedAt)}</span>
          {run.finishedAt && <span>Finished: {formatTime(run.finishedAt)}</span>}
          {run.duration && <span>Duration: {formatDuration(run.duration)}</span>}
          {run.exitCode !== undefined && (
            <span style={{ color: run.exitCode === 0 ? "#00FF87" : "#FF4444" }}>
              Exit: {run.exitCode}
            </span>
          )}
        </div>
      </div>

      {/* Log output */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px", background: "#0A0A0A" }}>
        {run.logs.map((line, i) => (
          <div
            key={line.id}
            className={`log-line ${line.type}`}
            style={{ animationDelay: `${i * 20}ms` }}
          >
            <span style={{ color: "#333", marginRight: 8, userSelect: "none" }}>{line.timestamp}</span>
            {line.text}
          </div>
        ))}
        {run.status === "running" && (
          <div className="log-line system">
            <span className="cursor-blink" />
          </div>
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

export default function RunnerPanel() {
  const { scripts, runs, activeRunId, setActiveRunId, addScript, files, openTabs, activeFileId } = useIDE();
  const [view, setView] = useState<"scripts" | "history">("scripts");

  const activeRun = runs.find((r) => r.id === activeRunId);

  // Can register active file as script
  const activeFile = openTabs.find((t) => t.fileId === activeFileId);
  const canRegister = activeFile?.language === "python" && !scripts.find((s) => s.fileId === activeFileId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div className="ide-panel-header" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setView("scripts")}
            style={{
              background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              color: view === "scripts" ? "#00FF87" : "#555",
              borderBottom: view === "scripts" ? "1px solid #00FF87" : "1px solid transparent",
              paddingBottom: 2,
            }}
          >
            Scripts ({scripts.length})
          </button>
          <button
            onClick={() => setView("history")}
            style={{
              background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              color: view === "history" ? "#00FF87" : "#555",
              borderBottom: view === "history" ? "1px solid #00FF87" : "1px solid transparent",
              paddingBottom: 2,
            }}
          >
            History ({runs.length})
          </button>
        </div>
        {canRegister && (
          <button
            className="ide-btn primary"
            onClick={() => { addScript(activeFileId!); toast.success(`Registered ${activeFile?.fileName}`); }}
            title="Register active file in PyRunner"
          >
            <Plus size={10} /> Register
          </button>
        )}
      </div>

      {view === "scripts" ? (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {scripts.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#444", marginBottom: 8 }}>No scripts registered</div>
              <div style={{ fontSize: 10, color: "#333" }}>
                Right-click a .py file or use the Register button
              </div>
            </div>
          ) : (
            scripts.map((script) => <ScriptRow key={script.id} script={script} />)
          )}
        </div>
      ) : (
        /* History view — split: list + log viewer */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Run list */}
          <div style={{ maxHeight: 140, overflowY: "auto", borderBottom: "1px solid #2A2A2A", flexShrink: 0 }}>
            {runs.length === 0 ? (
              <div style={{ padding: 16, fontSize: 11, color: "#444", textAlign: "center" }}>No runs yet</div>
            ) : (
              runs.map((run) => (
                <div
                  key={run.id}
                  onClick={() => setActiveRunId(run.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 12px",
                    gap: 8,
                    cursor: "pointer",
                    background: activeRunId === run.id ? "rgba(0,255,135,0.06)" : "transparent",
                    borderBottom: "1px solid #1A1A1A",
                  }}
                >
                  <span className={`ide-status-dot ${run.status}`} />
                  <span style={{ fontSize: 11, color: "#C8C8C8", flex: 1 }}>{run.scriptName}</span>
                  <span style={{ fontSize: 10, color: "#555" }}>{formatTime(run.startedAt)}</span>
                  <span style={{ fontSize: 10, color: "#444" }}>{formatDuration(run.duration)}</span>
                </div>
              ))
            )}
          </div>

          {/* Log viewer */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {activeRun ? (
              <LogViewer run={activeRun} />
            ) : (
              <div style={{ padding: 24, textAlign: "center", fontSize: 11, color: "#444" }}>
                Select a run to view logs
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active run quick-view (when on scripts tab) */}
      {view === "scripts" && activeRun && (
        <div style={{ borderTop: "1px solid #2A2A2A", maxHeight: 200, overflow: "hidden", flexShrink: 0 }}>
          <div className="ide-panel-header" style={{ justifyContent: "space-between" }}>
            <span>Latest Run: {activeRun.scriptName}</span>
            <StatusBadge status={activeRun.status} />
          </div>
          <div style={{ height: 150, overflow: "hidden" }}>
            <LogViewer run={activeRun} />
          </div>
        </div>
      )}
    </div>
  );
}
