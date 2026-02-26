"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

function AuthModal({ onClose, onAuth }: { onClose: () => void; onAuth: (u: any) => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isSignUp ? "signup" : "signin",
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      localStorage.setItem("uae_legal_user", JSON.stringify(data.user));
      onAuth(data.user);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111d35",
          padding: "40px 36px",
          borderRadius: "20px",
          width: "420px",
          maxWidth: "90vw",
          border: "1px solid rgba(201,162,39,0.15)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "#8899aa",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          X
        </button>

        <h2 style={{ fontSize: "26px", marginBottom: "6px", color: "white" }}>
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <p style={{ color: "#8899aa", fontSize: "14px", marginBottom: "28px" }}>
          {isSignUp ? "Sign up to save your conversations" : "Sign in to continue"}
        </p>

        {error && (
          <div
            style={{
              background: "rgba(231,76,60,0.1)",
              border: "1px solid rgba(231,76,60,0.3)",
              color: "#e74c3c",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#8899aa", marginBottom: "6px" }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "#0a1628",
                  border: "1.5px solid rgba(136,153,170,0.2)",
                  color: "white",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box" as const,
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "#8899aa", marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "#0a1628",
                border: "1.5px solid rgba(136,153,170,0.2)",
                color: "white",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box" as const,
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "#8899aa", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "#0a1628",
                border: "1.5px solid rgba(136,153,170,0.2)",
                color: "white",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box" as const,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: "#c9a227",
              color: "#0a1628",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#8899aa" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#c9a227",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [screen, setScreen] = useState("landing");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [typing, setTyping] = useState(false);
  const msgEnd = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    const saved = localStorage.getItem("uae_legal_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const result = await supabase
        .from("conversations")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (result.data) {
        setConversations(
          result.data.map((c: any) => ({
            id: c.id,
            title: c.title,
            date: new Date(c.updated_at).toLocaleDateString(),
          }))
        );
      }
    };
    load();
  }, [user]);

  const handleAuth = (userData: any) => {
    setUser(userData);
    setShowAuth(false);
    setScreen("chat");
  };

  const handleLogout = () => {
    setUser(null);
    setConversations([]);
    setActiveConvId(null);
    setMessages([]);
    setScreen("landing");
    localStorage.removeItem("uae_legal_user");
  };

  const openChat = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setScreen("chat");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.type === "application/pdf" || f.type.startsWith("image/"));
    setAttachedFiles((prev) => [
      ...prev,
      ...valid.map((f) => ({
        name: f.name,
        type: f.type.startsWith("image/") ? "image" : "pdf",
      })),
    ]);
    e.target.value = "";
  };

  const selectConversation = async (convId: string) => {
    setActiveConvId(convId);
    const result = await supabase
      .from("messages")
      .select("role, content, files")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (result.data) {
      setMessages(
        result.data.map((m: any) => ({
          role: m.role,
          text: m.content,
          files: m.files && m.files.length > 0 ? m.files : undefined,
        }))
      );
    }
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && attachedFiles.length === 0) return;
    if (!user) return;

    const userMsg = {
      role: "user",
      text,
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachedFiles([]);
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          conversationId: activeConvId,
          message: text,
          files: attachedFiles,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "ai", text: data.error || "Something went wrong." }]);
      } else {
        if (data.conversationId) setActiveConvId(data.conversationId);
        setMessages((prev) => [...prev, { role: "ai", text: data.message }]);
        setUser((prev: any) => (prev ? { ...prev, credits: data.creditsRemaining } : null));
        const stored = localStorage.getItem("uae_legal_user");
        if (stored) {
          const p = JSON.parse(stored);
          p.credits = data.creditsRemaining;
          localStorage.setItem("uae_legal_user", JSON.stringify(p));
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Network error. Please try again." }]);
    }
    setTyping(false);
  };

  if (screen === "landing") {
    return (
      <div
        style={{
          background: "#0a1628",
          color: "white",
          minHeight: "100vh",
          fontFamily: "'DM Sans', sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            marginBottom: "24px",
            padding: "8px 20px",
            background: "rgba(201,162,39,0.15)",
            border: "1px solid rgba(201,162,39,0.25)",
            borderRadius: "100px",
            color: "#c9a227",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          AI-Powered Legal Assistance
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: "20px",
            maxWidth: "700px",
          }}
        >
          Professional Legal Guidance for{" "}
          <span style={{ color: "#c9a227" }}>UAE Laws & Regulations</span>
        </h1>

        <p
          style={{
            color: "#8899aa",
            fontSize: "18px",
            maxWidth: "500px",
            lineHeight: 1.7,
            marginBottom: "40px",
          }}
        >
          Get instant, confidential AI-powered legal guidance tailored to UAE federal laws,
          DIFC regulations, and local legislation.
        </p>

        <button
          onClick={openChat}
          style={{
            padding: "16px 40px",
            background: "#c9a227",
            color: "#0a1628",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(201,162,39,0.3)",
          }}
        >
          Start a Consultation
        </button>

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#0d1b2e",
        color: "white",
        height: "100vh",
        display: "flex",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          width: sidebarOpen ? "280px" : "0",
          overflow: "hidden",
          background: "#0a1628",
          borderRight: "1px solid rgba(201,162,39,0.1)",
          transition: "width 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid rgba(201,162,39,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>Conversations</span>
          <button
            onClick={() => {
              setActiveConvId(null);
              setMessages([]);
            }}
            style={{
              padding: "6px 12px",
              background: "rgba(201,162,39,0.15)",
              border: "1px solid rgba(201,162,39,0.2)",
              color: "#c9a227",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              whiteSpace: "nowrap",
            }}
          >
            + New
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {conversations.length === 0 && (
            <div style={{ color: "#8899aa", fontSize: "13px", textAlign: "center", padding: "20px" }}>
              No conversations yet.
            </div>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => selectConversation(c.id)}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                marginBottom: "4px",
                background: activeConvId === c.id ? "rgba(201,162,39,0.15)" : "transparent",
                border: activeConvId === c.id ? "1px solid rgba(201,162,39,0.15)" : "1px solid transparent",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {c.title}
              </div>
              <div style={{ fontSize: "12px", color: "#8899aa", marginTop: "4px" }}>{c.date}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(201,162,39,0.1)",
            background: "rgba(10,22,40,0.5)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: "40px",
              height: "40px",
              background: "#111d35",
              border: "1px solid rgba(201,162,39,0.1)",
              color: "#8899aa",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            &#9776;
          </button>
          <div style={{ flex: 1, fontWeight: 500, fontSize: "17px" }}>
            {activeConvId ? "Consultation" : "New Consultation"}
          </div>
          {user && (
            <span
              style={{
                background: "rgba(201,162,39,0.15)",
                color: "#c9a227",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
              }}
            >
              {user.credits} credits
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(231,76,60,0.1)",
              border: "1px solid rgba(231,76,60,0.2)",
              color: "#e74c3c",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            X
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.length === 0 && !typing && (
            <div style={{ margin: "auto", textAlign: "center", padding: "40px" }}>
              <h2 style={{ fontSize: "24px", marginBottom: "10px", fontFamily: "'Playfair Display', serif" }}>
                How can I help you today?
              </h2>
              <p style={{ color: "#8899aa" }}>
                Ask me about UAE laws or upload documents for review.
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "10px",
                  maxWidth: "80%",
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  flexDirection: isUser ? "row-reverse" : "row",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 600,
                    flexShrink: 0,
                    background: isUser ? "#c9a227" : "#162544",
                    color: isUser ? "#0a1628" : "#c9a227",
                    border: isUser ? "none" : "1px solid rgba(201,162,39,0.2)",
                  }}
                >
                  {isUser ? (user?.name?.[0]?.toUpperCase() || "U") : "AI"}
                </div>
                <div>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "16px",
                      fontSize: "14.5px",
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                      background: isUser ? "rgba(201,162,39,0.12)" : "#111d35",
                      border: isUser
                        ? "1px solid rgba(201,162,39,0.15)"
                        : "1px solid rgba(136,153,170,0.08)",
                    }}
                  >
                    {msg.text}
                  </div>
                  {msg.files && (
                    <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                      {msg.files.map((f: any, fi: number) => (
                        <span
                          key={fi}
                          style={{
                            padding: "4px 10px",
                            background: "rgba(201,162,39,0.08)",
                            border: "1px solid rgba(201,162,39,0.12)",
                            borderRadius: "6px",
                            fontSize: "12px",
                            color: "#c9a227",
                          }}
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {typing && (
            <div style={{ display: "flex", gap: "10px", alignSelf: "flex-start" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "#162544",
                  color: "#c9a227",
                  border: "1px solid rgba(201,162,39,0.2)",
                }}
              >
                AI
              </div>
              <div
                style={{
                  padding: "16px",
                  background: "#111d35",
                  borderRadius: "16px",
                  border: "1px solid rgba(136,153,170,0.08)",
                  color: "#c9a227",
                }}
              >
                Thinking...
              </div>
            </div>
          )}
          <div ref={msgEnd} />
        </div>

        <div
          style={{
            padding: "16px 20px 20px",
            borderTop: "1px solid rgba(201,162,39,0.1)",
            background: "rgba(10,22,40,0.5)",
          }}
        >
          {attachedFiles.length > 0 && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
              {attachedFiles.map((f, i) => (
                <span
                  key={i}
                  style={{
                    padding: "6px 10px",
                    background: "rgba(201,162,39,0.15)",
                    border: "1px solid rgba(201,162,39,0.2)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#c9a227",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {f.name}
                  <button
                    onClick={() => setAttachedFiles((p) => p.filter((_, idx) => idx !== i))}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#c9a227",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <input
              type="file"
              ref={fileRef}
              hidden
              multiple
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: "44px",
                height: "44px",
                background: "#111d35",
                border: "1px solid rgba(201,162,39,0.1)",
                color: "#8899aa",
                borderRadius: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                flexShrink: 0,
              }}
            >
              +
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Describe your legal question..."
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "#111d35",
                border: "1.5px solid rgba(136,153,170,0.12)",
                color: "white",
                fontSize: "15px",
                outline: "none",
                minHeight: "44px",
                maxHeight: "120px",
                lineHeight: 1.5,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() && attachedFiles.length === 0}
              style={{
                width: "44px",
                height: "44px",
                background: "#c9a227",
                border: "none",
                color: "#0a1628",
                borderRadius: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
                opacity: !input.trim() && attachedFiles.length === 0 ? 0.4 : 1,
              }}
            >
              &#10148;
            </button>
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}
    </div>
  );
}
