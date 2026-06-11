/**
 * AIPanel — AI Chat assistant for script generation
 * Design: Brutalist Terminal — chat as terminal dialogue, neon green AI responses
 */

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useIDE, ChatMessage } from "@/contexts/IDEContext";
import { Streamdown } from "streamdown";

const QUICK_PROMPTS = [
  "Write a script to monitor disk usage",
  "Add retry logic to fetch_data.py",
  "Schedule cleanup.py weekly",
  "Create a webhook listener script",
];

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <div
      style={{
        padding: "10px 12px",
        borderBottom: "1px solid #1A1A1A",
        background: isUser ? "#111" : "transparent",
      }}
    >
      {/* Role header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        {isUser ? (
          <User size={11} style={{ color: "#555" }} />
        ) : (
          <Bot size={11} style={{ color: "#00FF87" }} />
        )}
        <span style={{ fontSize: 10, color: isUser ? "#555" : "#00FF87", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {isUser ? "You" : "PyRunner AI"}
        </span>
        <span style={{ fontSize: 10, color: "#333", marginLeft: "auto" }}>
          {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          fontSize: 12,
          lineHeight: 1.65,
          color: isUser ? "#C8C8C8" : "#E8E8E8",
        }}
        className="prose-terminal"
      >
        {isUser ? (
          <span>{msg.content}</span>
        ) : (
          <div className="streamdown-wrapper">
            <Streamdown>{msg.content}</Streamdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIPanel() {
  const { chatMessages, sendChatMessage, isChatLoading } = useIDE();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length, isChatLoading]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isChatLoading) return;
    sendChatMessage(trimmed);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div className="ide-panel-header">
        <Sparkles size={11} style={{ color: "#00FF87" }} />
        <span>AI Assistant</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#333" }}>Ctrl+K</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {chatMessages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Loading indicator */}
        {isChatLoading && (
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #1A1A1A" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Bot size={11} style={{ color: "#00FF87" }} />
              <span style={{ fontSize: 10, color: "#00FF87", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                PyRunner AI
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12, color: "#555" }}>Generating</span>
              <span className="cursor-blink" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ borderTop: "1px solid #2A2A2A", padding: "8px 12px", background: "#111", flexShrink: 0 }}>
        <div className="ide-label" style={{ marginBottom: 6 }}>Quick Prompts</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => { setInput(p); textareaRef.current?.focus(); }}
              style={{
                background: "none",
                border: "1px solid #2A2A2A",
                color: "#555",
                fontSize: 10,
                padding: "2px 7px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "color 100ms, border-color 100ms",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#E8E8E8"; (e.target as HTMLElement).style.borderColor = "#444"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#555"; (e.target as HTMLElement).style.borderColor = "#2A2A2A"; }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div style={{ borderTop: "1px solid #2A2A2A", padding: "8px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={textareaRef}
            className="ide-textarea"
            placeholder="Ask AI to write or modify a script..."
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={2}
            style={{ flex: 1, minHeight: 44, maxHeight: 120 }}
          />
          <button
            className="ide-btn primary"
            onClick={handleSend}
            disabled={!input.trim() || isChatLoading}
            style={{ height: 44, padding: "0 12px", opacity: (!input.trim() || isChatLoading) ? 0.4 : 1 }}
          >
            <Send size={12} />
          </button>
        </div>
        <div style={{ fontSize: 10, color: "#333", marginTop: 4 }}>
          Enter to send · Shift+Enter for newline
        </div>
      </div>
    </div>
  );
}
