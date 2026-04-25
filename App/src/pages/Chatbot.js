import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, AlertCircle } from "lucide-react";

const API_BASE = "http://localhost:5000"; // your Flask backend

function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! Ask me anything about Pratinidhi ✨" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

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
      if (!res.ok) throw new Error(data.error || "Chat request failed.");

      const botText = data.answer || data.reply || "No answer returned.";
      setMessages((prev) => [...prev, { role: "bot", text: botText }]);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Oops! Something went wrong. Please try again." },
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col"
      style={{ height: "calc(80vh - 2rem)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Assistant</h2>
          <p className="text-xs text-gray-400">
            Powered by RAG · Ask anything about governance & policies
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Online</span>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-4 space-y-3 mb-3">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-end gap-2 ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-yellow-400 to-red-500"
                    : "bg-white/10 border border-white/20"
                }`}
              >
                {m.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-yellow-400" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-yellow-500 to-red-500 text-white rounded-br-sm"
                    : "bg-white/10 border border-white/10 text-gray-100 rounded-bl-sm"
                }`}
              >
                {m.role === "bot" ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ) : (
                  <span style={{ whiteSpace: "pre-wrap" }}>{m.text}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
              <span className="text-gray-400 text-sm">Thinking…</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Input row */}
      <div className="flex gap-2 items-end">
        <textarea
          rows={2}
          value={input}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something… (Enter to send)"
          className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-5 h-5 text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default Chatbot;
