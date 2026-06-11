/**
 * Home — Main IDE layout
 * Design: Brutalist Terminal Aesthetic
 * Layout:
 *   Desktop: [Sidebar Icon Rail | File Tree | Editor | Right Panel (Runner/AI)]
 *   Mobile:  [Full-screen panel] + [Bottom Nav]
 *
 * Panels: Files, Editor, Runner, AI
 */

import { useEffect, useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useIDE, type PanelId } from "@/contexts/IDEContext";
import FileTree from "@/components/ide/FileTree";
import CodeEditor from "@/components/ide/CodeEditor";
import RunnerPanel from "@/components/ide/RunnerPanel";
import AIPanel from "@/components/ide/AIPanel";
import CommandPalette from "@/components/ide/CommandPalette";
import {
  Files,
  Code2,
  Play,
  Bot,
  Settings,
  GitBranch,
  Search,
  Terminal,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663751959707/XTfHfVAsJLB23ujxxVF8Jp/ide-logo-mark-58TkyHSpQBymRqq3Xy6DeT.webp";

// ─── Activity Bar (left icon rail) ───────────────────────────────────────────

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  panel?: "files" | "editor" | "runner" | "ai";
  action?: () => void;
}

function ActivityBar({ onSelect, activeSidebar }: { onSelect: (id: string) => void; activeSidebar: string | null }) {
  const { setCmdkOpen, scripts } = useIDE();
  const runningCount = scripts.filter((s) => s.status === "running").length;

  const items: ActivityItem[] = [
    { id: "files", icon: <Files size={18} />, label: "Explorer" },
    { id: "search", icon: <Search size={18} />, label: "Search", action: () => { setCmdkOpen(true); } },
    { id: "git", icon: <GitBranch size={18} />, label: "Source Control", action: () => toast.info("Git integration coming soon") },
    { id: "runner", icon: <Play size={18} />, label: "PyRunner" },
    { id: "ai", icon: <Bot size={18} />, label: "AI Assistant" },
  ];

  const bottomItems: ActivityItem[] = [
    { id: "settings", icon: <Settings size={18} />, label: "Settings", action: () => toast.info("Settings coming soon") },
  ];

  return (
    <div
      style={{
        width: 48,
        background: "#0D0D0D",
        borderRight: "1px solid #2A2A2A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 8,
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ width: 32, height: 32, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={LOGO_URL} alt="DevOS AI" style={{ width: 24, height: 24, objectFit: "contain" }} />
      </div>

      {/* Top items */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        {items.map((item) => (
          <button
            key={item.id}
            title={item.label}
            onClick={() => item.action ? item.action() : onSelect(item.id)}
            style={{
              width: "100%",
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              borderLeft: activeSidebar === item.id ? "2px solid #00FF87" : "2px solid transparent",
              color: activeSidebar === item.id ? "#00FF87" : "#555",
              cursor: "pointer",
              position: "relative",
              transition: "color 100ms",
            }}
            onMouseEnter={(e) => { if (activeSidebar !== item.id) (e.currentTarget as HTMLElement).style.color = "#E8E8E8"; }}
            onMouseLeave={(e) => { if (activeSidebar !== item.id) (e.currentTarget as HTMLElement).style.color = "#555"; }}
          >
            {item.icon}
            {/* Running badge */}
            {item.id === "runner" && runningCount > 0 && (
              <span style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                background: "#00FF87",
                borderRadius: "50%",
                animation: "pulse-dot 1.5s ease-in-out infinite",
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Bottom items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingBottom: 8, width: "100%" }}>
        {bottomItems.map((item) => (
          <button
            key={item.id}
            title={item.label}
            onClick={() => item.action ? item.action() : onSelect(item.id)}
            style={{
              width: "100%",
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              borderLeft: "2px solid transparent",
              color: "#555",
              cursor: "pointer",
              transition: "color 100ms",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#E8E8E8"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#555"; }}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Status Bar ───────────────────────────────────────────────────────────────

function StatusBar() {
  const { scripts, runs } = useIDE();
  const running = scripts.filter((s) => s.status === "running");
  const errors = scripts.filter((s) => s.status === "error");
  const scheduled = scripts.filter((s) => s.status === "scheduled");
  const latestRun = runs[0];

  return (
    <div
      style={{
        height: 22,
        background: "#0D0D0D",
        borderTop: "1px solid #2A2A2A",
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        gap: 16,
        flexShrink: 0,
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {/* Left: PyRunner status */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Zap size={10} style={{ color: "#00FF87" }} />
        <span style={{ fontSize: 10, color: "#00FF87", fontWeight: 700, letterSpacing: "0.06em" }}>DEVOS AI</span>
        <span style={{ fontSize: 10, color: "#333" }}>connected</span>
      </div>

      <div style={{ width: 1, height: 12, background: "#2A2A2A" }} />

      {running.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className="ide-status-dot running" />
          <span style={{ fontSize: 10, color: "#00FF87", whiteSpace: "nowrap" }}>{running.length} running</span>
        </div>
      )}

      {errors.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className="ide-status-dot error" />
          <span style={{ fontSize: 10, color: "#FF4444", whiteSpace: "nowrap" }}>{errors.length} error</span>
        </div>
      )}

      {scheduled.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className="ide-status-dot scheduled" />
          <span style={{ fontSize: 10, color: "#FFAA00", whiteSpace: "nowrap" }}>{scheduled.length} scheduled</span>
        </div>
      )}

      {/* Right: misc info */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        {latestRun && (
          <span style={{ fontSize: 10, color: "#444", whiteSpace: "nowrap" }}>
            Last run: {latestRun.scriptName} · {latestRun.status}
          </span>
        )}
        <span style={{ fontSize: 10, color: "#333", whiteSpace: "nowrap" }}>
          {scripts.length} scripts · {runs.length} runs
        </span>
      </div>
    </div>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────

function MobileNav() {
  const { activePanel, setActivePanel, scripts, setCmdkOpen } = useIDE();
  const runningCount = scripts.filter((s) => s.status === "running").length;

  const items: { id: PanelId; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: "files", icon: <Files size={18} />, label: "Files" },
    { id: "editor", icon: <Code2 size={18} />, label: "Editor" },
    { id: "runner", icon: <Play size={18} />, label: "Runner", badge: runningCount },
    { id: "ai", icon: <Bot size={18} />, label: "AI" },
  ];

  return (
    <div
      style={{
        height: 56,
        background: "#141414",
        borderTop: "1px solid #2A2A2A",
        display: "flex",
        flexShrink: 0,
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          className={`mobile-nav-item ${activePanel === item.id ? "active" : ""}`}
          onClick={() => setActivePanel(item.id)}
          style={{ position: "relative" }}
        >
          {item.icon}
          <span>{item.label}</span>
          {item.badge ? (
            <span style={{
              position: "absolute",
              top: 6,
              right: "calc(50% - 18px)",
              width: 8,
              height: 8,
              background: "#00FF87",
              borderRadius: "50%",
              animation: "pulse-dot 1.5s ease-in-out infinite",
            }} />
          ) : null}
        </button>
      ))}
      <button
        className="mobile-nav-item"
        onClick={() => setCmdkOpen(true)}
        style={{ position: "relative" }}
      >
        <Terminal size={18} />
        <span>CMD+K</span>
      </button>
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function Home() {
  const { activePanel, setActivePanel, rightPanelTab, setRightPanelTab } = useIDE();
  const [activeSidebar, setActiveSidebar] = useState<string | null>("files");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleActivitySelect = (id: string) => {
    if (id === "runner" || id === "ai") {
      setActiveSidebar(id);
      setRightPanelTab(id === "runner" ? "runner" : "ai");
      return;
    }
    if (activeSidebar === id) {
      setActiveSidebar(null);
    } else {
      setActiveSidebar(id);
    }
  };

  // ─── Mobile Layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0D0D0D" }}>
        {/* Mobile header */}
        <div style={{
          height: 44,
          background: "#141414",
          borderBottom: "1px solid #2A2A2A",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 10,
          flexShrink: 0,
        }}>
          <img src={LOGO_URL} alt="DevOS AI" style={{ width: 20, height: 20, objectFit: "contain" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#E8E8E8" }}>DevOS AI</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "#00FF87" }}>● connected</span>
        </div>

        {/* Panel content */}
        <div style={{ flex: 1, overflow: "hidden" }} className="ide-panel">
          {activePanel === "files" && <FileTree />}
          {activePanel === "editor" && <CodeEditor />}
          {(activePanel === "runner" || activePanel === "ai") && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {/* Sub-tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #2A2A2A", background: "#141414", flexShrink: 0 }}>
                <button
                  className={`ide-tab ${(activePanel === "runner" && rightPanelTab === "runner") || (activePanel !== "ai") ? "active" : ""}`}
                  onClick={() => { setRightPanelTab("runner"); setActivePanel("runner"); }}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <Play size={11} /> Runner
                </button>
                <button
                  className={`ide-tab ${activePanel === "ai" || rightPanelTab === "ai" ? "active" : ""}`}
                  onClick={() => { setRightPanelTab("ai"); setActivePanel("ai"); }}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <Bot size={11} /> AI
                </button>
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                {activePanel === "ai" ? <AIPanel /> : <RunnerPanel />}
              </div>
            </div>
          )}
        </div>

        {/* Status bar */}
        <StatusBar />

        {/* Bottom nav */}
        <MobileNav />

        {/* CMD+K */}
        <CommandPalette />
      </div>
    );
  }

  // ─── Desktop Layout ─────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0D0D0D" }}>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Activity bar */}
        <ActivityBar onSelect={handleActivitySelect} activeSidebar={activeSidebar} />

        {/* Main content */}
        <ResizablePanelGroup direction="horizontal" style={{ flex: 1 }}>
          {/* Left sidebar */}
          {activeSidebar === "files" && (
            <>
              <ResizablePanel defaultSize={18} minSize={12} maxSize={35} style={{ background: "#141414", borderRight: "1px solid #2A2A2A" }}>
                <FileTree />
              </ResizablePanel>
              <ResizableHandle style={{ width: 4, background: "#2A2A2A" }} />
            </>
          )}

          {/* Editor */}
          <ResizablePanel defaultSize={activeSidebar === "files" ? 55 : 70} minSize={30}>
            <div style={{ height: "100%", background: "#0D0D0D" }}>
              <CodeEditor />
            </div>
          </ResizablePanel>

          {/* Right panel — Runner + AI */}
          <ResizableHandle style={{ width: 4, background: "#2A2A2A" }} />
          <ResizablePanel defaultSize={27} minSize={20} maxSize={45} style={{ background: "#141414", borderLeft: "1px solid #2A2A2A" }}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {/* Tab switcher */}
              <div style={{ display: "flex", borderBottom: "1px solid #2A2A2A", background: "#141414", flexShrink: 0 }}>
                <button
                  className={`ide-tab ${rightPanelTab === "runner" ? "active" : ""}`}
                  onClick={() => setRightPanelTab("runner")}
                >
                  <Play size={11} /> Runner
                </button>
                <button
                  className={`ide-tab ${rightPanelTab === "ai" ? "active" : ""}`}
                  onClick={() => setRightPanelTab("ai")}
                >
                  <Bot size={11} /> AI
                </button>
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                {rightPanelTab === "runner" ? <RunnerPanel /> : <AIPanel />}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* CMD+K */}
      <CommandPalette />
    </div>
  );
}
