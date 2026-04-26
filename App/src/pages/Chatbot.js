import React, { useEffect, useReducer, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Plus,
  Loader2,
  AlertCircle,
  MapPin,
  Workflow,
} from "lucide-react";
import { loadAgentContext, runAgentTurn } from "../services/chatAgent";

const CHAT_STORAGE_KEY = "pratinidhi_chatbot_state_v1";

function createMessage(role, text, meta = {}) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    meta,
  };
}

function createDefaultMemory() {
  return {
    pendingAction: null,
    lastResults: [],
    lastResultType: null,
    lastArea: null,
    selectedEntity: null,
  };
}

function createDefaultMessages() {
  return [createMessage("bot", "Hi! What can I help you with?")];
}

function createInitialState() {
  const base = {
    messages: createDefaultMessages(),
    input: "",
    loading: false,
    error: "",
    contextLoading: true,
    context: null,
    memory: createDefaultMemory(),
  };

  if (typeof window === "undefined") return base;

  try {
    const parsed = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || "null");
    if (!parsed) return base;

    return {
      ...base,
      messages: Array.isArray(parsed.messages) && parsed.messages.length
        ? parsed.messages
        : base.messages,
      memory: {
        ...base.memory,
        ...(parsed.memory || {}),
      },
    };
  } catch {
    return base;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "set_input":
      return { ...state, input: action.value };
    case "send_start":
      return {
        ...state,
        loading: true,
        error: "",
        input: "",
        messages: [...state.messages, createMessage("user", action.text)],
      };
    case "send_success":
      return {
        ...state,
        loading: false,
        error: "",
        memory: action.memory,
        messages: [...state.messages, createMessage("bot", action.reply, action.meta)],
      };
    case "send_error":
      return {
        ...state,
        loading: false,
        error: action.error,
        messages: [
          ...state.messages,
          createMessage(
            "bot",
            "I hit a problem while trying to complete that action. Please try again."
          ),
        ],
      };
    case "context_loaded":
      return {
        ...state,
        contextLoading: false,
        context: action.context,
      };
    case "context_failed":
      return {
        ...state,
        contextLoading: false,
        context: null,
      };
    case "reset_chat":
      return {
        ...state,
        input: "",
        loading: false,
        error: "",
        messages: createDefaultMessages(),
        memory: createDefaultMemory(),
      };
    default:
      return state;
  }
}

function AreaPill({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-600">
      <MapPin className="h-3.5 w-3.5 text-yellow-400" />
      <span>{label}: {value}</span>
    </div>
  );
}

function Chatbot() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const bottomRef = useRef(null);

  useEffect(() => {
    let alive = true;

    async function bootstrapContext() {
      try {
        const context = await loadAgentContext();
        if (alive) {
          dispatch({ type: "context_loaded", context });
        }
      } catch {
        if (alive) {
          dispatch({ type: "context_failed" });
        }
      }
    }

    bootstrapContext();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.loading]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify({
        messages: state.messages,
        memory: state.memory,
      })
    );
  }, [state.messages, state.memory]);

  const sendMessage = async () => {
    const text = state.input.trim();
    if (!text || state.loading) return;

    dispatch({ type: "send_start", text });

    try {
      const result = await runAgentTurn({
        text,
        context: state.context,
        memory: state.memory,
        history: state.messages,
      });

      dispatch({
        type: "send_success",
        reply: result.reply,
        memory: result.memory,
        meta: result.meta,
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: "send_error",
        error: error?.message || "Assistant failed",
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const knownArea = state.context?.knownArea || {};
  const isWaitingForArea = state.memory?.pendingAction?.type === "needs_area";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col"
      style={{ height: "calc(80vh - 2rem)" }}
    >
      <div className="mb-4 flex items-start gap-3 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-red-500 shadow-lg shadow-yellow-500/30">
          <Bot className="h-5 w-5 text-white" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Civic Agent</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            <AreaPill label="Constituency" value={knownArea.constituency} />
            <AreaPill label="District" value={knownArea.district} />
            <AreaPill label="Booth" value={knownArea.booth} />
            {isWaitingForArea && (
              <div className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
                <Workflow className="h-3.5 w-3.5" />
                <span>Waiting for constituency name</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "reset_chat" })}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          aria-label="Start new conversation"
          title="New conversation"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-3 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur-xl">
        <AnimatePresence initial={false}>
          {state.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-end gap-2 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-yellow-400 to-red-500"
                    : "border border-slate-200 bg-white"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-yellow-400" />
                )}
              </div>

              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "rounded-br-sm bg-gradient-to-br from-yellow-500 to-red-500 text-white"
                    : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                }`}
              >
                {message.role === "bot" ? (
                  <div className="prose prose-sm max-w-none prose-p:text-slate-800 prose-li:text-slate-800 prose-strong:text-slate-900">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                ) : (
                  <span style={{ whiteSpace: "pre-wrap" }}>{message.text}</span>
                )}

                {message.role === "bot" && Array.isArray(message.meta?.toolTrace) && message.meta.toolTrace.length > 0 }
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {state.loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white">
              <Bot className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
              <span className="text-sm text-slate-600">Thinking…</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {state.error}
        </motion.div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          rows={2}
          value={state.input}
          onKeyDown={handleKeyDown}
          onChange={(event) =>
            dispatch({ type: "set_input", value: event.target.value })
          }
          placeholder="Ask an actionable question… (Enter to send)"
          className="flex-1 resize-none rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-yellow-500/50 focus:bg-white focus:outline-none"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage}
          disabled={state.loading || !state.input.trim()}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-red-500 shadow-lg shadow-yellow-500/30 transition-all disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-5 w-5 text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default Chatbot;
