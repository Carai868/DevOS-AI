/**
 * FileTree — IDE file explorer panel
 * Design: Brutalist Terminal — hard borders, monospace, neon green active state
 */

import { useState, useCallback } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, Play, PencilLine } from "lucide-react";
import { useIDE, FileNode } from "@/contexts/IDEContext";
import { toast } from "sonner";

const LANG_COLORS: Record<string, string> = {
  python: "#00FF87",
  javascript: "#FFAA00",
  typescript: "#4488FF",
  json: "#FF8844",
  yaml: "#AA88FF",
  markdown: "#888888",
  bash: "#88FFAA",
  text: "#666666",
};

function getFileColor(language?: string) {
  return language ? (LANG_COLORS[language] || "#666666") : "#666666";
}

function FileIcon({ name, language }: { name: string; language?: string }) {
  const color = getFileColor(language);
  return <File size={12} style={{ color, flexShrink: 0 }} />;
}

interface FileNodeProps {
  node: FileNode;
  depth: number;
}

function FileTreeNode({ node, depth }: FileNodeProps) {
  const { activeFileId, openFile, deleteFile, addScript, scripts, runScript, renameFile } = useIDE();
  const [expanded, setExpanded] = useState(depth < 2);
  const [showActions, setShowActions] = useState(false);

  const isActive = activeFileId === node.id;
  const registeredScript = scripts.find((s) => s.fileId === node.id);
  const isPython = node.language === "python";

  const handleClick = useCallback(() => {
    if (node.type === "folder") {
      setExpanded((e) => !e);
    } else {
      openFile(node);
    }
  }, [node, openFile]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteFile(node.id);
    toast.success(`Deleted ${node.name}`);
  }, [node, deleteFile]);

  const handleRename = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const nextName = window.prompt("Rename file", node.name);
    if (!nextName || !nextName.trim()) return;
    renameFile(node.id, nextName.trim());
    toast.success(`Renamed ${node.name} to ${nextName.trim()}`);
  }, [node, renameFile]);

  const handleRegisterRun = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (registeredScript) {
      runScript(registeredScript.id);
    } else {
      addScript(node.id);
      toast.success(`Registered ${node.name} in PyRunner`);
    }
  }, [node, registeredScript, addScript, runScript]);

  return (
    <div>
      <div
        className={`ide-file-item ${isActive ? "active" : ""}`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={handleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Expand/collapse for folders */}
        {node.type === "folder" ? (
          <span style={{ color: "#555", flexShrink: 0 }}>
            {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </span>
        ) : (
          <span style={{ width: 10, flexShrink: 0 }} />
        )}

        {/* Icon */}
        {node.type === "folder" ? (
          expanded
            ? <FolderOpen size={12} style={{ color: "#FFAA00", flexShrink: 0 }} />
            : <Folder size={12} style={{ color: "#FFAA00", flexShrink: 0 }} />
        ) : (
          <FileIcon name={node.name} language={node.language} />
        )}

        {/* Name */}
        <span
          className="truncate flex-1"
          style={{ fontSize: 12, color: isActive ? "#00FF87" : node.type === "folder" ? "#C8C8C8" : "#A8A8A8" }}
        >
          {node.name}
        </span>

        {/* Running indicator */}
        {registeredScript?.status === "running" && (
          <span className="ide-status-dot running" style={{ flexShrink: 0 }} />
        )}

        {/* Action buttons */}
        {showActions && node.type === "file" && (
          <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
            {isPython && (
              <button
                onClick={handleRegisterRun}
                title={registeredScript ? "Run now" : "Register in PyRunner"}
                style={{
                  background: "none",
                  border: "none",
                  padding: "1px 3px",
                  color: registeredScript ? "#00FF87" : "#555",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Play size={10} />
              </button>
            )}
            <button
              onClick={handleRename}
              title="Rename"
              style={{
                background: "none",
                border: "none",
                padding: "1px 3px",
                color: "#555",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <PencilLine size={10} />
            </button>
            <button
              onClick={handleDelete}
              title="Delete"
              style={{
                background: "none",
                border: "none",
                padding: "1px 3px",
                color: "#555",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Trash2 size={10} />
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {node.type === "folder" && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree() {
  const { files, createFile } = useIDE();
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = useCallback(() => {
    if (!newName.trim()) {
      setShowNewInput(false);
      return;
    }
    createFile("root", newName.trim(), "file");
    setNewName("");
    setShowNewInput(false);
  }, [newName, createFile]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div className="ide-panel-header" style={{ justifyContent: "space-between" }}>
        <span>Explorer</span>
        <button
          onClick={() => setShowNewInput(true)}
          title="New file"
          style={{ background: "none", border: "none", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", padding: "2px" }}
        >
          <Plus size={12} />
        </button>
      </div>

      {/* New file input */}
      {showNewInput && (
        <div style={{ padding: "6px 8px", borderBottom: "1px solid #2A2A2A" }}>
          <input
            autoFocus
            className="ide-input"
            placeholder="filename.py"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") { setShowNewInput(false); setNewName(""); }
            }}
            onBlur={handleCreate}
          />
        </div>
      )}

      {/* Tree */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {files.map((node) => (
          <FileTreeNode key={node.id} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
}
