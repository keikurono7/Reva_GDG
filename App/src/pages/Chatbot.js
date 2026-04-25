import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

const API_BASE = "http://localhost:5000"; // your Flask backend

function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! Ask me anything ✨" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1️⃣ Send Chat Message
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, top_k: 5 }),
      });

      const data = await res.json();
      console.log("Ask response from backend:", data);

      if (!res.ok) throw new Error(data.error || "Chat request failed.");

      const botText = data.answer || data.reply || "No answer returned.";

      setMessages((prev) => [...prev, { role: "bot", text: botText }]);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Oops! Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        minHeight: "86vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#e5e7eb",
        fontFamily: "system-ui",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "1rem",
          padding: "1rem",
          background: "#020617",
          border: "1px solid #1f2937",
          boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
        }}
      >
        <h2>🤖 Chatbot</h2>
        <p style={{ color: "#9ca3af" }}>
          Ask anything → The system will answer using Firestore-based RAG.
        </p>

        {/* Chat window */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.75rem",
            borderRadius: "0.75rem",
            background: "#020617",
            border: "1px solid #1f2937",
            marginBottom: "0.75rem",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "0.6rem 0.9rem",
                  borderRadius: "0.75rem",
                  background: m.role === "user" ? "#2563eb" : "#111827",
                  fontSize: "0.9rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.role === "bot" ? (
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                ) : (
                  m.text
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ color: "#9ca3af" }}>Thinking…</div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ color: "#fca5a5", marginBottom: "0.5rem" }}>
            {error}
          </div>
        )}

        {/* Input */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <textarea
            rows={2}
            value={input}
            onKeyDown={handleKeyDown}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "0.6rem",
              background: "#020617",
              border: "1px solid #1f2937",
              color: "#e5e7eb",
              resize: "none",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "0.6rem",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
