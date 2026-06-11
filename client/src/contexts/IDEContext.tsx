/**
 * IDEContext — Global state for PyRunner IDE
 * Design: Brutalist Terminal Aesthetic
 * Manages: files, open tabs, active panel, run history, AI chat, PyRunner scripts
 */

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FileType = "file" | "folder";
export type Language = "python" | "javascript" | "typescript" | "json" | "yaml" | "markdown" | "text" | "bash";
export type RunStatus = "idle" | "running" | "success" | "error" | "scheduled";
export type PanelId = "files" | "editor" | "runner" | "ai" | "terminal";

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  language?: Language;
  content?: string;
  children?: FileNode[];
  parentId?: string | null;
}

export interface EditorTab {
  fileId: string;
  fileName: string;
  language: Language;
  isDirty: boolean;
}

export interface RunRecord {
  id: string;
  scriptName: string;
  scriptId: string;
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  logs: LogLine[];
  exitCode?: number;
}

export interface LogLine {
  id: string;
  type: "stdout" | "stderr" | "info" | "success" | "system";
  text: string;
  timestamp: string;
}

export interface PyRunnerScript {
  id: string;
  name: string;
  fileId: string;
  status: RunStatus;
  schedule?: string;
  lastRun?: string;
  nextRun?: string;
  venv?: string;
  description?: string;
  runCount: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_FILES: FileNode[] = [
  {
    id: "root",
    name: "workspace",
    type: "folder",
    parentId: null,
    children: [
      {
        id: "f1",
        name: "scripts",
        type: "folder",
        parentId: "root",
        children: [
          {
            id: "f1-1",
            name: "fetch_data.py",
            type: "file",
            language: "python",
            parentId: "f1",
            content: `#!/usr/bin/env python3
"""
fetch_data.py — Fetch and process data from an API
Scheduled: daily at 08:00 UTC
"""

import requests
import json
from datetime import datetime


API_URL = "https://api.example.com/data"
OUTPUT_FILE = "output/data.json"


def fetch_data(url: str) -> dict:
    """Fetch JSON data from the given URL."""
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.json()


def process_data(raw: dict) -> dict:
    """Transform raw API response into clean format."""
    return {
        "fetched_at": datetime.utcnow().isoformat(),
        "count": len(raw.get("items", [])),
        "items": raw.get("items", [])[:100],
    }


def save_output(data: dict, path: str) -> None:
    """Persist processed data to disk."""
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"[OK] Saved {data['count']} items to {path}")


if __name__ == "__main__":
    print(f"[START] fetch_data.py @ {datetime.utcnow().isoformat()}")
    raw = fetch_data(API_URL)
    processed = process_data(raw)
    save_output(processed, OUTPUT_FILE)
    print("[DONE] fetch_data.py completed successfully")
`,
          },
          {
            id: "f1-2",
            name: "cleanup.py",
            type: "file",
            language: "python",
            parentId: "f1",
            content: `#!/usr/bin/env python3
"""
cleanup.py — Remove old output files older than 7 days
Scheduled: weekly on Sunday at 02:00 UTC
"""

import os
import time
from pathlib import Path


OUTPUT_DIR = Path("output")
MAX_AGE_DAYS = 7


def cleanup_old_files(directory: Path, max_age_days: int) -> int:
    """Delete files older than max_age_days. Returns count of deleted files."""
    cutoff = time.time() - (max_age_days * 86400)
    deleted = 0

    for file in directory.glob("**/*"):
        if file.is_file() and file.stat().st_mtime < cutoff:
            file.unlink()
            print(f"[DEL] {file}")
            deleted += 1

    return deleted


if __name__ == "__main__":
    print(f"[START] cleanup.py")
    count = cleanup_old_files(OUTPUT_DIR, MAX_AGE_DAYS)
    print(f"[DONE] Deleted {count} old files")
`,
          },
          {
            id: "f1-3",
            name: "notify.py",
            type: "file",
            language: "python",
            parentId: "f1",
            content: `#!/usr/bin/env python3
"""
notify.py — Send Slack notification with daily summary
"""

import os
import requests
from datetime import date


SLACK_WEBHOOK = os.environ.get("SLACK_WEBHOOK_URL", "")


def send_slack(message: str) -> bool:
    if not SLACK_WEBHOOK:
        print("[WARN] SLACK_WEBHOOK_URL not set")
        return False
    resp = requests.post(SLACK_WEBHOOK, json={"text": message})
    return resp.status_code == 200


if __name__ == "__main__":
    today = date.today().isoformat()
    msg = f":robot_face: *PyRunner Daily Summary* — {today}\\n> All scheduled jobs completed."
    ok = send_slack(msg)
    print("[OK]" if ok else "[FAIL]", "Slack notification sent" if ok else "Failed to send")
`,
          },
        ],
      },
      {
        id: "f2",
        name: "config",
        type: "folder",
        parentId: "root",
        children: [
          {
            id: "f2-1",
            name: "settings.json",
            type: "file",
            language: "json",
            parentId: "f2",
            content: `{
  "pyrunner": {
    "api_url": "http://pyrunner:8000/api",
    "workspace_root": "/app/workspace",
    "default_venv": "default",
    "max_concurrent_runs": 4,
    "log_retention_days": 30
  },
  "notifications": {
    "slack_enabled": true,
    "email_enabled": false
  },
  "scheduler": {
    "timezone": "UTC",
    "max_retries": 3
  }
}
`,
          },
          {
            id: "f2-2",
            name: "docker-compose.yml",
            type: "file",
            language: "yaml",
            parentId: "f2",
            content: `version: '3.8'

services:
  ide-backend:
    build: ./backend
    ports: ["3000:3000"]
    volumes:
      - workspace:/app/workspace
    depends_on:
      - pyrunner
    environment:
      - PYRUNNER_API=http://pyrunner:8000/api
      - WORKSPACE_ROOT=/app/workspace

  frontend:
    build: ./frontend
    ports: ["8080:80"]
    depends_on: [ide-backend]

  pyrunner:
    image: hasanaboulhasan/pyrunner:latest
    ports: ["8001:8000"]
    volumes:
      - workspace:/app/data/workspace
      - pyrunner_data:/app/data
    env_file: .env.pyrunner

volumes:
  workspace:
  pyrunner_data:
`,
          },
        ],
      },
      {
        id: "f3",
        name: "README.md",
        type: "file",
        language: "markdown",
        parentId: "root",
        content: `# PyRunner IDE Workspace

This workspace is shared between the Monaco IDE and PyRunner.

## Structure

\`\`\`
workspace/
├── scripts/          # Python automation scripts
│   ├── fetch_data.py
│   ├── cleanup.py
│   └── notify.py
├── config/           # Configuration files
│   ├── settings.json
│   └── docker-compose.yml
└── output/           # Script output (auto-created)
\`\`\`

## Quick Start

1. Edit scripts in the **Editor** panel
2. Register scripts in the **Runner** panel
3. Trigger runs or set schedules
4. Monitor logs in real-time

## AI Assistant

Use the **AI** panel or press \`Cmd+K\` to generate scripts.
Example prompts:
- "Write a script that fetches weather data and saves it to JSON"
- "Add error handling and retry logic to fetch_data.py"
- "Schedule cleanup.py to run every Sunday at 2am UTC"
`,
      },
    ],
  },
];

const INITIAL_SCRIPTS: PyRunnerScript[] = [
  {
    id: "s1",
    name: "fetch_data.py",
    fileId: "f1-1",
    status: "scheduled",
    schedule: "0 8 * * *",
    lastRun: "2026-06-11T08:00:02Z",
    nextRun: "2026-06-12T08:00:00Z",
    venv: "default",
    description: "Fetch and process data from API",
    runCount: 47,
  },
  {
    id: "s2",
    name: "cleanup.py",
    fileId: "f1-2",
    status: "idle",
    schedule: "0 2 * * 0",
    lastRun: "2026-06-08T02:00:01Z",
    nextRun: "2026-06-15T02:00:00Z",
    venv: "default",
    description: "Remove old output files",
    runCount: 12,
  },
  {
    id: "s3",
    name: "notify.py",
    fileId: "f1-3",
    status: "error",
    lastRun: "2026-06-11T08:01:00Z",
    venv: "default",
    description: "Send Slack daily summary",
    runCount: 46,
  },
];

const INITIAL_RUNS: RunRecord[] = [
  {
    id: "r1",
    scriptName: "fetch_data.py",
    scriptId: "s1",
    status: "success",
    startedAt: "2026-06-11T08:00:02Z",
    finishedAt: "2026-06-11T08:00:07Z",
    duration: 5200,
    exitCode: 0,
    logs: [
      { id: "l1", type: "system", text: "> Executing fetch_data.py in venv: default", timestamp: "08:00:02" },
      { id: "l2", type: "stdout", text: "[START] fetch_data.py @ 2026-06-11T08:00:02.341Z", timestamp: "08:00:02" },
      { id: "l3", type: "stdout", text: "[OK] Saved 87 items to output/data.json", timestamp: "08:00:07" },
      { id: "l4", type: "success", text: "[DONE] fetch_data.py completed successfully", timestamp: "08:00:07" },
      { id: "l5", type: "system", text: "> Exit code: 0 | Duration: 5.2s", timestamp: "08:00:07" },
    ],
  },
  {
    id: "r2",
    scriptName: "notify.py",
    scriptId: "s3",
    status: "error",
    startedAt: "2026-06-11T08:01:00Z",
    finishedAt: "2026-06-11T08:01:01Z",
    duration: 980,
    exitCode: 1,
    logs: [
      { id: "l6", type: "system", text: "> Executing notify.py in venv: default", timestamp: "08:01:00" },
      { id: "l7", type: "stdout", text: "[WARN] SLACK_WEBHOOK_URL not set", timestamp: "08:01:00" },
      { id: "l8", type: "stderr", text: "KeyError: 'SLACK_WEBHOOK_URL'", timestamp: "08:01:01" },
      { id: "l9", type: "stderr", text: "  File \"notify.py\", line 14, in send_slack", timestamp: "08:01:01" },
      { id: "l10", type: "system", text: "> Exit code: 1 | Duration: 0.98s", timestamp: "08:01:01" },
    ],
  },
];

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: "c0",
    role: "assistant",
    content: "PyRunner AI ready. I can help you write, refactor, and schedule Python automation scripts.\n\nTry:\n- `Write a script that monitors disk usage and alerts if > 90%`\n- `Add retry logic to fetch_data.py`\n- `Schedule cleanup.py to run every Sunday`",
    timestamp: new Date().toISOString(),
  },
];

// ─── Context ─────────────────────────────────────────────────────────────────

interface IDEContextValue {
  // File tree
  files: FileNode[];
  activeFileId: string | null;
  setActiveFileId: (id: string | null) => void;
  openTabs: EditorTab[];
  openFile: (file: FileNode) => void;
  closeTab: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  createFile: (parentId: string, name: string, type: FileType) => void;
  deleteFile: (fileId: string) => void;

  // Active panel (mobile)
  activePanel: PanelId;
  setActivePanel: (panel: PanelId) => void;

  // PyRunner
  scripts: PyRunnerScript[];
  runs: RunRecord[];
  activeRunId: string | null;
  setActiveRunId: (id: string | null) => void;
  runScript: (scriptId: string) => void;
  addScript: (fileId: string) => void;
  removeScript: (scriptId: string) => void;
  updateScriptSchedule: (scriptId: string, cron: string) => void;

  // AI Chat
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string) => void;
  isChatLoading: boolean;

  // CMD+K
  cmdkOpen: boolean;
  setCmdkOpen: (open: boolean) => void;

  // Right panel tab
  rightPanelTab: "runner" | "ai";
  setRightPanelTab: (tab: "runner" | "ai") => void;
}

const IDEContext = createContext<IDEContextValue | null>(null);

export function IDEProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string | null>("f1-1");
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([
    { fileId: "f1-1", fileName: "fetch_data.py", language: "python", isDirty: false },
    { fileId: "f3", fileName: "README.md", language: "markdown", isDirty: false },
  ]);
  const [activePanel, setActivePanel] = useState<PanelId>("editor");
  const [scripts, setScripts] = useState<PyRunnerScript[]>(INITIAL_SCRIPTS);
  const [runs, setRuns] = useState<RunRecord[]>(INITIAL_RUNS);
  const [activeRunId, setActiveRunId] = useState<string | null>("r1");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"runner" | "ai">("runner");

  const runCounterRef = useRef(3);
  const msgCounterRef = useRef(1);

  // Find file by ID (recursive)
  const findFile = useCallback((nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findFile(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const openFile = useCallback((file: FileNode) => {
    if (file.type !== "file") return;
    setActiveFileId(file.id);
    setActivePanel("editor");
    setOpenTabs((prev) => {
      if (prev.find((t) => t.fileId === file.id)) return prev;
      return [...prev, { fileId: file.id, fileName: file.name, language: file.language || "text", isDirty: false }];
    });
  }, []);

  const closeTab = useCallback((fileId: string) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t.fileId !== fileId);
      return next;
    });
    setActiveFileId((prev) => {
      if (prev !== fileId) return prev;
      const remaining = openTabs.filter((t) => t.fileId !== fileId);
      return remaining.length > 0 ? remaining[remaining.length - 1].fileId : null;
    });
  }, [openTabs]);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] =>
      nodes.map((n) => {
        if (n.id === fileId) return { ...n, content };
        if (n.children) return { ...n, children: updateNode(n.children) };
        return n;
      });
    setFiles((prev) => updateNode(prev));
    setOpenTabs((prev) => prev.map((t) => t.fileId === fileId ? { ...t, isDirty: true } : t));
  }, []);

  const createFile = useCallback((parentId: string, name: string, type: FileType) => {
    const id = `new-${Date.now()}`;
    const ext = name.split(".").pop() || "";
    const langMap: Record<string, Language> = { py: "python", js: "javascript", ts: "typescript", json: "json", yml: "yaml", yaml: "yaml", md: "markdown", sh: "bash" };
    const language = langMap[ext] || "text";
    const newNode: FileNode = { id, name, type, language, content: "", parentId, children: type === "folder" ? [] : undefined };

    const insertNode = (nodes: FileNode[]): FileNode[] =>
      nodes.map((n) => {
        if (n.id === parentId && n.children) return { ...n, children: [...n.children, newNode] };
        if (n.children) return { ...n, children: insertNode(n.children) };
        return n;
      });
    setFiles((prev) => insertNode(prev));
    if (type === "file") openFile(newNode);
  }, [openFile]);

  const deleteFile = useCallback((fileId: string) => {
    const removeNode = (nodes: FileNode[]): FileNode[] =>
      nodes.filter((n) => n.id !== fileId).map((n) => n.children ? { ...n, children: removeNode(n.children) } : n);
    setFiles((prev) => removeNode(prev));
    closeTab(fileId);
  }, [closeTab]);

  const runScript = useCallback((scriptId: string) => {
    const script = scripts.find((s) => s.id === scriptId);
    if (!script) return;

    runCounterRef.current += 1;
    const runId = `r${runCounterRef.current}`;
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);

    const newRun: RunRecord = {
      id: runId,
      scriptName: script.name,
      scriptId,
      status: "running",
      startedAt: now.toISOString(),
      logs: [
        { id: `${runId}-l1`, type: "system", text: `> Executing ${script.name} in venv: ${script.venv || "default"}`, timestamp: timeStr },
        { id: `${runId}-l2`, type: "info", text: `[START] ${script.name} @ ${now.toISOString()}`, timestamp: timeStr },
      ],
    };

    setRuns((prev) => [newRun, ...prev]);
    setActiveRunId(runId);
    setScripts((prev) => prev.map((s) => s.id === scriptId ? { ...s, status: "running" } : s));
    setActivePanel("runner");
    setRightPanelTab("runner");

    // Simulate run completion
    const duration = 1500 + Math.random() * 3000;
    setTimeout(() => {
      const success = Math.random() > 0.25;
      const doneTime = new Date().toTimeString().slice(0, 8);
      setRuns((prev) => prev.map((r) => {
        if (r.id !== runId) return r;
        return {
          ...r,
          status: success ? "success" : "error",
          finishedAt: new Date().toISOString(),
          duration: Math.round(duration),
          exitCode: success ? 0 : 1,
          logs: [
            ...r.logs,
            ...(success
              ? [
                  { id: `${runId}-l3`, type: "stdout" as const, text: `[INFO] Processing...`, timestamp: doneTime },
                  { id: `${runId}-l4`, type: "success" as const, text: `[DONE] ${script.name} completed successfully`, timestamp: doneTime },
                  { id: `${runId}-l5`, type: "system" as const, text: `> Exit code: 0 | Duration: ${(duration / 1000).toFixed(1)}s`, timestamp: doneTime },
                ]
              : [
                  { id: `${runId}-l3`, type: "stderr" as const, text: `RuntimeError: Unexpected error in ${script.name}`, timestamp: doneTime },
                  { id: `${runId}-l4`, type: "system" as const, text: `> Exit code: 1 | Duration: ${(duration / 1000).toFixed(1)}s`, timestamp: doneTime },
                ]),
          ],
        };
      }));
      setScripts((prev) => prev.map((s) => s.id === scriptId
        ? { ...s, status: success ? "idle" : "error", lastRun: new Date().toISOString(), runCount: s.runCount + 1 }
        : s
      ));
    }, duration);
  }, [scripts]);

  const addScript = useCallback((fileId: string) => {
    const file = findFile(files, fileId);
    if (!file || scripts.find((s) => s.fileId === fileId)) return;
    const newScript: PyRunnerScript = {
      id: `s${Date.now()}`,
      name: file.name,
      fileId,
      status: "idle",
      venv: "default",
      runCount: 0,
    };
    setScripts((prev) => [...prev, newScript]);
  }, [files, scripts, findFile]);

  const removeScript = useCallback((scriptId: string) => {
    setScripts((prev) => prev.filter((s) => s.id !== scriptId));
  }, []);

  const updateScriptSchedule = useCallback((scriptId: string, cron: string) => {
    setScripts((prev) => prev.map((s) => s.id === scriptId ? { ...s, schedule: cron, status: cron ? "scheduled" : "idle" } : s));
  }, []);

  const AI_RESPONSES: Record<string, string> = {
    default: `I can help with that. Here's a Python script:

\`\`\`python
#!/usr/bin/env python3
"""
Generated by PyRunner AI
"""

import os
import sys
from datetime import datetime


def main():
    print(f"[START] {datetime.utcnow().isoformat()}")
    # TODO: Implement your logic here
    print("[DONE] Script completed")


if __name__ == "__main__":
    main()
\`\`\`

Save this to \`scripts/\` and register it in the **Runner** panel to schedule or run it.`,
  };

  const sendChatMessage = useCallback((content: string) => {
    msgCounterRef.current += 1;
    const userMsg: ChatMessage = {
      id: `c${msgCounterRef.current}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    setTimeout(() => {
      msgCounterRef.current += 1;
      const aiMsg: ChatMessage = {
        id: `c${msgCounterRef.current}`,
        role: "assistant",
        content: AI_RESPONSES.default,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
      setIsChatLoading(false);
    }, 1200 + Math.random() * 800);
  }, []);

  const value: IDEContextValue = {
    files,
    activeFileId,
    setActiveFileId,
    openTabs,
    openFile,
    closeTab,
    updateFileContent,
    createFile,
    deleteFile,
    activePanel,
    setActivePanel,
    scripts,
    runs,
    activeRunId,
    setActiveRunId,
    runScript,
    addScript,
    removeScript,
    updateScriptSchedule,
    chatMessages,
    sendChatMessage,
    isChatLoading,
    cmdkOpen,
    setCmdkOpen,
    rightPanelTab,
    setRightPanelTab,
  };

  return <IDEContext.Provider value={value}>{children}</IDEContext.Provider>;
}

export function useIDE() {
  const ctx = useContext(IDEContext);
  if (!ctx) throw new Error("useIDE must be used within IDEProvider");
  return ctx;
}
