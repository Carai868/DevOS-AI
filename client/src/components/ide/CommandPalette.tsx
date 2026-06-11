/**
 * CommandPalette — CMD+K command palette
 * Design: Brutalist Terminal — full-screen overlay, monospace, instant response
 */

import { useEffect, useRef, useState } from "react";
import { useIDE } from "@/contexts/IDEContext";
import { Play, File, Bot, Clock, Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  keywords?: string[];
}

export default function CommandPalette() {
  const { cmdkOpen, setCmdkOpen, scripts, runScript, openTabs, setActiveFileId, setActivePanel, setRightPanelTab, sendChatMessage } = useIDE();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Build command list
  const commands: Command[] = [
    ...scripts.map((s) => ({
      id: `run-${s.id}`,
      label: `Run: ${s.name}`,
      description: s.schedule ? `Scheduled: ${s.schedule}` : "Run immediately",
      icon: <Play size={12} style={{ color: "#00FF87" }} />,
      category: "PyRunner",
      keywords: ["run", "execute", s.name],
      action: () => { runScript(s.id); toast.success(`Running ${s.name}...`); setCmdkOpen(false); },
    })),
    ...openTabs.map((t) => ({
      id: `open-${t.fileId}`,
      label: `Open: ${t.fileName}`,
      description: t.language,
      icon: <File size={12} style={{ color: "#888" }} />,
      category: "Files",
      keywords: ["open", "file", t.fileName],
      action: () => { setActiveFileId(t.fileId); setActivePanel("editor"); setCmdkOpen(false); },
    })),
    {
      id: "ai-panel",
      label: "Open AI Assistant",
      description: "Ask AI to generate or modify scripts",
      icon: <Bot size={12} style={{ color: "#00FF87" }} />,
      category: "Navigation",
      keywords: ["ai", "chat", "assistant", "generate"],
      action: () => { setActivePanel("runner"); setRightPanelTab("ai"); setCmdkOpen(false); },
    },
    {
      id: "runner-panel",
      label: "Open Runner Panel",
      description: "View scripts and run history",
      icon: <Clock size={12} style={{ color: "#FFAA00" }} />,
      category: "Navigation",
      keywords: ["runner", "scripts", "history"],
      action: () => { setActivePanel("runner"); setRightPanelTab("runner"); setCmdkOpen(false); },
    },
    {
      id: "ai-fetch",
      label: "AI: Write a data fetching script",
      description: "Generate with AI",
      icon: <Bot size={12} style={{ color: "#00FF87" }} />,
      category: "AI Prompts",
      keywords: ["ai", "fetch", "data", "generate"],
      action: () => { sendChatMessage("Write a Python script that fetches data from a REST API and saves it to a JSON file"); setActivePanel("runner"); setRightPanelTab("ai"); setCmdkOpen(false); },
    },
    {
      id: "ai-schedule",
      label: "AI: Add scheduling to a script",
      description: "Generate with AI",
      icon: <Bot size={12} style={{ color: "#00FF87" }} />,
      category: "AI Prompts",
      keywords: ["ai", "schedule", "cron", "generate"],
      action: () => { sendChatMessage("How do I schedule my Python script to run daily at 8am UTC using PyRunner?"); setActivePanel("runner"); setRightPanelTab("ai"); setCmdkOpen(false); },
    },
    {
      id: "ai-retry",
      label: "AI: Add retry logic",
      description: "Generate with AI",
      icon: <Bot size={12} style={{ color: "#00FF87" }} />,
      category: "AI Prompts",
      keywords: ["ai", "retry", "error", "generate"],
      action: () => { sendChatMessage("Add retry logic with exponential backoff to handle network errors in my Python script"); setActivePanel("runner"); setRightPanelTab("ai"); setCmdkOpen(false); },
    },
  ];

  const filtered = query.trim()
    ? commands.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.keywords?.some((k) => k.toLowerCase().includes(q))
        );
      })
    : commands;

  // Group by category
  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (cmdkOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [cmdkOpen]);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdkOpen(true);
      }
      if (e.key === "Escape") setCmdkOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCmdkOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    } else if (e.key === "Escape") {
      setCmdkOpen(false);
    }
  };

  if (!cmdkOpen) return null;

  let globalIdx = 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "15vh",
      }}
      onClick={() => setCmdkOpen(false)}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#141414",
          border: "1px solid #2A2A2A",
          boxShadow: "0 0 40px rgba(0,0,0,0.8)",
          margin: "0 16px",
          animation: "fade-in 100ms ease-out both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #2A2A2A", gap: 10 }}>
          <Search size={14} style={{ color: "#555", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#E8E8E8",
              fontSize: 13,
              fontFamily: "inherit",
            }}
          />
          <kbd style={{ fontSize: 10, color: "#444", border: "1px solid #2A2A2A", padding: "1px 5px" }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category}>
              <div style={{ padding: "6px 14px 4px", fontSize: 10, color: "#444", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {category}
              </div>
              {cmds.map((cmd) => {
                const isSelected = globalIdx++ === selectedIndex;
                return (
                  <div
                    key={cmd.id}
                    onClick={cmd.action}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 14px",
                      gap: 10,
                      cursor: "pointer",
                      background: isSelected ? "rgba(0,255,135,0.07)" : "transparent",
                      borderLeft: isSelected ? "2px solid #00FF87" : "2px solid transparent",
                      transition: "background 80ms",
                    }}
                    onMouseEnter={() => setSelectedIndex(commands.indexOf(cmd))}
                  >
                    <span style={{ flexShrink: 0 }}>{cmd.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: isSelected ? "#E8E8E8" : "#C8C8C8" }}>{cmd.label}</div>
                      {cmd.description && (
                        <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>{cmd.description}</div>
                      )}
                    </div>
                    {isSelected && <ChevronRight size={10} style={{ color: "#00FF87", flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: "#444" }}>
              No commands found for "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "6px 14px", borderTop: "1px solid #1A1A1A", display: "flex", gap: 12 }}>
          {[["↑↓", "navigate"], ["↵", "select"], ["esc", "close"]].map(([key, label]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <kbd style={{ fontSize: 10, color: "#444", border: "1px solid #2A2A2A", padding: "1px 5px" }}>{key}</kbd>
              <span style={{ fontSize: 10, color: "#333" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
