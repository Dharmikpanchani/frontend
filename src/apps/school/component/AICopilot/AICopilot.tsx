import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SmartToy as BotIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as FileIcon,
  Edit as EditIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import {
  getSessions,
  getMessages,
  deleteSession,
  renameSession,
  streamChat,
  type ChatSessionItem,
  type ChatMessageItem,
} from "@/api/services/copilot.service";
import "./AICopilot.css";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  time: string;
  streaming?: boolean;
  file?: { name: string; url: string; type: string };
}

// Group sessions by relative date label
function groupByDate(sessions: ChatSessionItem[]): { label: string; items: ChatSessionItem[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const week = today - 7 * 86400000;
  const month = today - 30 * 86400000;

  const groups: Record<string, ChatSessionItem[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    "Last 30 days": [],
    Older: [],
  };

  for (const s of sessions) {
    const t = new Date(s.updatedAt).getTime();
    if (t >= today) groups["Today"].push(s);
    else if (t >= yesterday) groups["Yesterday"].push(s);
    else if (t >= week) groups["Last 7 days"].push(s);
    else if (t >= month) groups["Last 30 days"].push(s);
    else groups["Older"].push(s);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const dialogueRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !dialogueRef.current) return;
      const dialogueRect = dialogueRef.current.getBoundingClientRect();
      const newWidth = e.clientX - dialogueRect.left;
      if (newWidth >= 160 && newWidth <= 380) {
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string; type: string } | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<(() => void) | null>(null);
  const streamingIdRef = useRef<string | null>(null);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // ── Load sessions when panel opens ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    loadSessions();
  }, [isOpen]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await getSessions();
      const list = res?.data?.sessions ?? [];
      setSessions(list);
      if (res?.data?.schoolLogo) setSchoolLogo(res.data.schoolLogo);
      if (list.length > 0 && !activeSessionId) {
        setActiveSessionId(list[0]._id);
        loadSessionMessages(list[0]._id);
      }
    } catch {
      // silent — will show empty state
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    setLoadingMessages(true);
    try {
      const res = await getMessages(sessionId);
      const dbMsgs: ChatMessageItem[] = res?.data?.messages ?? [];
      setMessages(
        dbMsgs.map((m) => ({
          id: m._id,
          role: m.role,
          text: m.content,
          time: formatTime(m.createdAt),
        }))
      );
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // ── Switch session ─────────────────────────────────────────────────────────
  const handleSelectSession = (sessionId: string) => {
    if (sessionId === activeSessionId) return;
    abortRef.current?.();
    setActiveSessionId(sessionId);
    loadSessionMessages(sessionId);
  };

  // ── New chat ───────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    abortRef.current?.();
    setActiveSessionId(null);
    setMessages([
      {
        id: "welcome",
        role: "model",
        text: "નમસ્તે! હું તમારી શાળાનો AI મદદનીશ છું. આજે હું તમને કઈ રીતે મદદ કરી શકું?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // ── Delete session ─────────────────────────────────────────────────────────
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      if (activeSessionId === sessionId) {
        const remaining = sessions.filter((s) => s._id !== sessionId);
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0]._id);
          loadSessionMessages(remaining[0]._id);
        } else {
          handleNewChat();
        }
      }
    } catch {
      // ignore
    }
  };

  // ── Rename session ─────────────────────────────────────────────────────────
  const handleStartRename = (session: ChatSessionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session._id);
    setEditingTitle(session.title);
  };

  const handleConfirmRename = async (sessionId: string) => {
    if (!editingTitle.trim()) { setEditingSessionId(null); return; }
    try {
      await renameSession(sessionId, editingTitle.trim());
      setSessions((prev) =>
        prev.map((s) => (s._id === sessionId ? { ...s, title: editingTitle.trim() } : s))
      );
    } catch {
      // ignore
    } finally {
      setEditingSessionId(null);
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    if ((!inputValue.trim() && !attachedFile) || isStreaming) return;

    const userText = inputValue.trim();
    const file = attachedFile;
    setInputValue("");
    setAttachedFile(null);
    setIsStreaming(true);

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const tempUserId = `u_${Date.now()}`;
    const tempAiId = `ai_${Date.now()}`;

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        id: tempUserId,
        role: "user",
        text: userText || (file ? `📎 ${file.name}` : ""),
        time: timestamp,
        file: file ?? undefined,
      },
    ]);

    // Add empty streaming AI message
    streamingIdRef.current = tempAiId;
    setMessages((prev) => [
      ...prev,
      { id: tempAiId, role: "model", text: "", time: timestamp, streaming: true },
    ]);

    let currentSessionId = activeSessionId;

    const abort = streamChat(
      { sessionId: currentSessionId ?? undefined, message: userText },
      (event) => {
        switch (event.type) {
          case "session":
            // New session was created
            currentSessionId = event.sessionId!;
            setActiveSessionId(event.sessionId!);
            break;

          case "token":
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingIdRef.current
                  ? { ...m, text: m.text + (event.content ?? "") }
                  : m
              )
            );
            break;

          case "aiMessageId":
            // Replace temp id with real DB id
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingIdRef.current
                  ? { ...m, id: event.messageId!, streaming: false }
                  : m
              )
            );
            streamingIdRef.current = null;
            break;

          case "title":
            // Update session title in sidebar
            setSessions((prev) => {
              const updated = prev.map((s) =>
                s._id === currentSessionId ? { ...s, title: event.title! } : s
              );
              // If session was brand new (not in list yet), add it
              if (!updated.find((s) => s._id === currentSessionId)) {
                updated.unshift({
                  _id: currentSessionId!,
                  title: event.title!,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              }
              return updated;
            });
            break;

          case "status":
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingIdRef.current
                  ? { ...m, text: `⏳ ${event.message ?? ""}` }
                  : m
              )
            );
            break;

          case "done":
            setIsStreaming(false);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingIdRef.current ? { ...m, streaming: false } : m
              )
            );
            break;

          case "error":
            setIsStreaming(false);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingIdRef.current
                  ? { ...m, text: `⚠️ ${event.message ?? "Something went wrong"}`, streaming: false }
                  : m
              )
            );
            break;
        }
      },
      () => {
        setIsStreaming(false);
        // Reload sessions to get updated list with new session
        loadSessions();
      },
      (err) => {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingIdRef.current
              ? { ...m, text: `⚠️ ${err}`, streaming: false }
              : m
          )
        );
      }
    );

    abortRef.current = abort;
  }, [inputValue, attachedFile, isStreaming, activeSessionId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile({
      name: file.name,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      type: file.type,
    });
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    if (attachedFile?.url) URL.revokeObjectURL(attachedFile.url);
    setAttachedFile(null);
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const groupedSessions = groupByDate(sessions);
  const activeSession = sessions.find((s) => s._id === activeSessionId);
  const displayMessages = messages.length > 0
    ? messages
    : [{ id: "welcome", role: "model" as const, text: "નમસ્તે! હું તમારી શાળાનો AI મદદનીશ છું. આજે હું તમને કઈ રીતે મદદ કરી શકું?", time: "" }];

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div
        className="ai-copilot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="AI Copilot"
      >
        {isOpen ? <CloseIcon /> : <BotIcon />}
      </div>

      {/* ChatGPT Style Dialogue Modal */}
      <div 
        ref={dialogueRef}
        className={`ai-copilot-dialog ${isOpen ? "open" : ""}`}
      >

        {/* Left Sidebar - Chat Sessions List */}
        <div 
          className="ai-copilot-sidebar"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="ai-copilot-sidebar-header">
            <button className="ai-copilot-new-chat-btn" onClick={handleNewChat}>
              + New Chat
            </button>
          </div>

          <div className="ai-copilot-sessions-list">
            {loadingSessions ? (
              <div style={{ padding: "12px", opacity: 0.5, fontSize: "12px" }}>Loading...</div>
            ) : sessions.length === 0 ? (
              <div style={{ padding: "12px", opacity: 0.5, fontSize: "12px" }}>No chats yet</div>
            ) : (
              groupedSessions.map(({ label, items }) => (
                <div key={label}>
                  <div style={{ padding: "8px 12px 4px", fontSize: "10px", opacity: 0.45, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {label}
                  </div>
                  {items.map((session) => (
                    <div
                      key={session._id}
                      className={`ai-copilot-session-item ${activeSessionId === session._id ? "active" : ""}`}
                      onClick={() => handleSelectSession(session._id)}
                    >
                      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                        <ChatIcon sx={{ fontSize: 14, opacity: 0.7, marginTop: "2px", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {editingSessionId === session._id ? (
                            <input
                              className="ai-copilot-rename-input"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleConfirmRename(session._id);
                                if (e.key === "Escape") setEditingSessionId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          ) : (
                            <span className="ai-copilot-session-title">{session.title}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        {editingSessionId === session._id ? (
                          <span
                            className="ai-copilot-session-delete"
                            onClick={(e) => { e.stopPropagation(); handleConfirmRename(session._id); }}
                          >
                            <CheckIcon sx={{ fontSize: 13 }} />
                          </span>
                        ) : (
                          <span
                            className="ai-copilot-session-delete"
                            onClick={(e) => handleStartRename(session, e)}
                          >
                            <EditIcon sx={{ fontSize: 13 }} />
                          </span>
                        )}
                        <span
                          className="ai-copilot-session-delete"
                          onClick={(e) => handleDeleteSession(session._id, e)}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className={`ai-copilot-resize-handle ${isResizing ? "active" : ""}`}
          onMouseDown={startResizing}
        />

        {/* Right Main Panel - Messages Viewport */}
        <div className="ai-copilot-main">

          {/* Header */}
          <div className="ai-copilot-header">
            <div className="ai-copilot-header-info">
              <div className="ai-copilot-header-icon">
                <BotIcon sx={{ fontSize: 20 }} />
              </div>
              <div>
                <div className="ai-copilot-title">
                  {activeSession?.title ?? "School AI Assistant"}
                </div>
                <div className="ai-copilot-subtitle">Powered by School ERP AI</div>
              </div>
            </div>
            <div className="ai-copilot-header-actions">
              <span style={{ cursor: "pointer", opacity: 0.6 }} onClick={() => setIsOpen(false)}>
                <CloseIcon />
              </span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="ai-copilot-messages">
            {loadingMessages ? (
              <div style={{ padding: "24px", textAlign: "center", opacity: 0.5 }}>Loading messages...</div>
            ) : (
              displayMessages.map((msg) => (
                <div key={msg.id} className={`ai-copilot-message-wrapper ${msg.role === "user" ? "user" : "ai"}`}>
                  <div className="ai-copilot-avatar">
                    {msg.role === "user"
                      ? schoolLogo
                        ? <img 
                            src={schoolLogo.startsWith("http") || schoolLogo.startsWith("blob") ? schoolLogo : `${import.meta.env.VITE_BASE_URL_IMAGE}/${schoolLogo}`} 
                            alt="School" 
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} 
                          />
                        : "AD"
                      : <BotIcon sx={{ fontSize: 18 }} />
                    }
                  </div>
                  <div>
                    <div
                      className={`ai-copilot-bubble${msg.streaming ? " streaming" : ""}`}
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {msg.text || (msg.streaming ? "" : "…")}
                      {msg.streaming && !msg.text && (
                        <div className="ai-copilot-typing-indicator">
                          <div className="ai-copilot-dot" />
                          <div className="ai-copilot-dot" />
                          <div className="ai-copilot-dot" />
                        </div>
                      )}
                      {msg.file && (
                        <div className="ai-copilot-message-attachment">
                          {msg.file.type.startsWith("image/") ? (
                            <img src={msg.file.url} alt="attached" />
                          ) : (
                            <div className="ai-copilot-message-attachment-file">
                              <FileIcon sx={{ fontSize: 16, color: "inherit" }} />
                              <span className="ai-copilot-preview-name">{msg.file.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {msg.time && (
                      <span className="ai-copilot-message-time">{msg.time}</span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachment Preview */}
          {attachedFile && (
            <div className="ai-copilot-attachment-preview">
              <div className="ai-copilot-preview-item">
                {attachedFile.type.startsWith("image/") ? (
                  <img src={attachedFile.url} className="ai-copilot-preview-image" alt="preview" />
                ) : (
                  <FileIcon sx={{ fontSize: 16, color: "var(--primary-color)" }} />
                )}
                <span className="ai-copilot-preview-name">{attachedFile.name}</span>
                <span className="ai-copilot-preview-remove" onClick={handleRemoveFile}>
                  <CloseIcon sx={{ fontSize: 12 }} />
                </span>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="ai-copilot-input-area">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              className="ai-copilot-attachment-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              title="Attach File"
            >
              <AttachFileIcon sx={{ fontSize: 18 }} />
            </button>

            <div className="ai-copilot-input-wrapper">
              <input
                type="text"
                className="ai-copilot-input"
                placeholder="AI મદદનીશને પૂછો..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isStreaming}
              />
            </div>
            <button
              className="ai-copilot-send-btn"
              onClick={handleSend}
              disabled={(!inputValue.trim() && !attachedFile) || isStreaming}
            >
              <SendIcon sx={{ fontSize: 16 }} />
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
