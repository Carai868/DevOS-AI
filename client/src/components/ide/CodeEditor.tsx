/**
 * CodeEditor — Monaco Editor wrapper
 * Design: Brutalist Terminal — dark theme, neon green cursor, hard borders
 */

import { useRef, useCallback, useEffect } from "react";
import Editor, { OnMount, BeforeMount } from "@monaco-editor/react";
import { X, Circle } from "lucide-react";
import { useIDE, FileNode, Language } from "@/contexts/IDEContext";

const LANG_MAP: Record<Language, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  json: "json",
  yaml: "yaml",
  markdown: "markdown",
  text: "plaintext",
  bash: "shell",
};

const EMPTY_STATE_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663751959707/XTfHfVAsJLB23ujxxVF8Jp/ide-empty-state-VwRsMaJMmwJooiEHn4mqDX.webp";

function findFileById(nodes: FileNode[], id: string): FileNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const f = findFileById(n.children, id);
      if (f) return f;
    }
  }
  return null;
}

export default function CodeEditor() {
  const { files, activeFileId, openTabs, closeTab, setActiveFileId, updateFileContent, setCmdkOpen } = useIDE();
  const editorRef = useRef<any>(null);

  const activeFile = activeFileId ? findFileById(files, activeFileId) : null;

  const handleBeforeMount: BeforeMount = (monaco) => {
    // Define PyRunner dark theme
    monaco.editor.defineTheme("pyrunner-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "444444", fontStyle: "italic" },
        { token: "keyword", foreground: "00FF87", fontStyle: "bold" },
        { token: "keyword.control", foreground: "00FF87" },
        { token: "string", foreground: "FFAA44" },
        { token: "number", foreground: "FF8844" },
        { token: "type", foreground: "4488FF" },
        { token: "function", foreground: "88CCFF" },
        { token: "variable", foreground: "E8E8E8" },
        { token: "operator", foreground: "00CC6A" },
        { token: "delimiter", foreground: "555555" },
        { token: "identifier", foreground: "C8C8C8" },
      ],
      colors: {
        "editor.background": "#0D0D0D",
        "editor.foreground": "#E8E8E8",
        "editorLineNumber.foreground": "#333333",
        "editorLineNumber.activeForeground": "#00FF87",
        "editor.lineHighlightBackground": "#141414",
        "editor.selectionBackground": "#00FF8733",
        "editor.inactiveSelectionBackground": "#00FF8711",
        "editorCursor.foreground": "#00FF87",
        "editorWhitespace.foreground": "#222222",
        "editorIndentGuide.background1": "#1E1E1E",
        "editorIndentGuide.activeBackground1": "#2A2A2A",
        "editor.findMatchBackground": "#00FF8744",
        "editor.findMatchHighlightBackground": "#00FF8722",
        "editorWidget.background": "#141414",
        "editorWidget.border": "#2A2A2A",
        "input.background": "#1A1A1A",
        "input.border": "#2A2A2A",
        "input.foreground": "#E8E8E8",
        "list.hoverBackground": "#1A1A1A",
        "list.activeSelectionBackground": "#00FF8722",
        "list.activeSelectionForeground": "#00FF87",
        "dropdown.background": "#141414",
        "dropdown.border": "#2A2A2A",
        "scrollbarSlider.background": "#2A2A2A88",
        "scrollbarSlider.hoverBackground": "#3A3A3A88",
        "minimap.background": "#0D0D0D",
      },
    });
  };

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.setTheme("pyrunner-dark");

    // CMD+K to open command palette
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      setCmdkOpen(true);
    });

    // CMD+S to save (mark clean)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // In a real app, this would save to filesystem
    });
  };

  const handleChange = useCallback((value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  }, [activeFileId, updateFileContent]);

  // Update editor content when active file changes
  useEffect(() => {
    if (editorRef.current && activeFile?.content !== undefined) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== activeFile.content) {
        editorRef.current.setValue(activeFile.content);
      }
    }
  }, [activeFileId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          borderBottom: "1px solid #2A2A2A",
          background: "#141414",
          flexShrink: 0,
          scrollbarWidth: "none",
        }}
      >
        {openTabs.length === 0 ? (
          <div style={{ height: 32, display: "flex", alignItems: "center", padding: "0 12px", color: "#444", fontSize: 11 }}>
            No files open
          </div>
        ) : (
          openTabs.map((tab) => (
            <div
              key={tab.fileId}
              className={`ide-tab ${activeFileId === tab.fileId ? "active" : ""}`}
              onClick={() => setActiveFileId(tab.fileId)}
              style={{ minWidth: 0, maxWidth: 180 }}
            >
              {tab.isDirty && (
                <Circle size={6} style={{ color: "#00FF87", fill: "#00FF87", flexShrink: 0 }} />
              )}
              <span className="truncate" style={{ maxWidth: 120 }}>{tab.fileName}</span>
              <button
                onClick={(e) => { e.stopPropagation(); closeTab(tab.fileId); }}
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: "0 2px", display: "flex", alignItems: "center", flexShrink: 0, opacity: 0.6 }}
              >
                <X size={10} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Editor area */}
      {activeFile ? (
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Editor
            height="100%"
            language={LANG_MAP[activeFile.language || "text"]}
            value={activeFile.content || ""}
            onChange={handleChange}
            beforeMount={handleBeforeMount}
            onMount={handleMount}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              lineHeight: 20,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 4,
              insertSpaces: true,
              renderLineHighlight: "line",
              cursorBlinking: "phase",
              cursorStyle: "block",
              smoothScrolling: true,
              padding: { top: 12, bottom: 12 },
              renderWhitespace: "none",
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
              suggest: { showKeywords: true },
              quickSuggestions: true,
              scrollbar: {
                verticalScrollbarSize: 6,
                horizontalScrollbarSize: 6,
              },
            }}
          />
        </div>
      ) : (
        /* Empty state */
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `url(${EMPTY_STATE_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(13,13,13,0.75)" }} />
          <div style={{ position: "relative", textAlign: "center", zIndex: 1 }}>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
              PyRunner IDE
            </div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
              Select a file to start editing
            </div>
            <div style={{ fontSize: 11, color: "#444" }}>
              Press <kbd style={{ border: "1px solid #333", padding: "1px 5px", fontSize: 10, color: "#555" }}>Ctrl+K</kbd> to open command palette
            </div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div
        style={{
          height: 22,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          borderTop: "1px solid #2A2A2A",
          background: "#141414",
          gap: 16,
          flexShrink: 0,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {activeFile ? (
          <>
            <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {activeFile.language || "text"}
            </span>
            <span style={{ fontSize: 10, color: "#444", whiteSpace: "nowrap" }}>
              {activeFile.name}
            </span>
          </>
        ) : (
          <span style={{ fontSize: 10, color: "#333" }}>No file open</span>
        )}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#333", whiteSpace: "nowrap" }}>
          UTF-8 · LF
        </span>
      </div>
    </div>
  );
}
