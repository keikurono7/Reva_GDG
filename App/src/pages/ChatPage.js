import React, { useEffect, useState, useRef } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { app } from "../services/firebase_";
import { compressToWebP } from "../utils/compressImage";
import { ChevronLeft, Send, Image as ImageIcon } from "lucide-react";

const db = getFirestore(app);

export default function ChatPage({ topic, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sender, setSender] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  // Load chat messages
  useEffect(() => {
    if (!topic?.id) return;

    const messagesRef = collection(db, "chats", topic.id, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(arr);
    });

    return () => unsub();
  }, [topic]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !file) return;
    if (!sender.trim()) {
      alert("Enter sender name");
      return;
    }

    setSending(true);

    try {
      let imageBase64 = null;
      if (file) {
        imageBase64 = await compressToWebP(file, 800, 0.6);
      }

      const messagesRef = collection(db, "chats", topic.id, "messages");
      await addDoc(messagesRef, {
        text: text.trim(),
        imageBase64,
        sender: sender.trim(),
        timestamp: serverTimestamp(),
      });

      setText("");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    }

    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 p-6 text-white">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onClose} className="px-3 py-2 bg-white/10 rounded-xl">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="text-2xl font-bold">{topic.title}</div>
            <div className="text-sm text-gray-400">Chatroom</div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 max-h-[60vh] overflow-y-auto mb-4">
          {messages.map((m) => (
            <div key={m.id} className="mb-4">
              <div className="text-xs text-gray-300">
                {m.sender} •{" "}
                {m.timestamp?.toDate
                  ? new Date(m.timestamp.toDate()).toLocaleString()
                  : ""}
              </div>

              {/* Text */}
              {m.text && (
                <div className="mt-1 bg-white/10 p-3 rounded-lg inline-block">
                  {m.text}
                </div>
              )}

              {/* Image */}
              {m.imageBase64 && (
                <img
                  src={m.imageBase64}
                  alt="sent"
                  className="mt-2 w-60 rounded-xl border border-white/10"
                />
              )}
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* Message input */}
        <form
          onSubmit={handleSend}
          className="bg-white/5 p-4 rounded-xl border border-white/10"
        >
          <div className="flex gap-3 mb-3">
            <input
              placeholder="Your name"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="w-40 p-2 rounded-xl bg-white/5 border border-white/10"
            />

            <input
              placeholder="Write a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 p-2 rounded-xl bg-white/5 border border-white/10"
            />

            <label className="p-2 bg-white/5 rounded-xl cursor-pointer">
              <ImageIcon className="w-5 h-5 text-gray-300" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-red-500 font-bold"
            >
              <Send className="inline mr-1" />
              {sending ? "Sending..." : "Send"}
            </button>
          </div>

          {file && <div className="text-sm text-gray-300">Image: {file.name}</div>}
        </form>
      </div>
    </div>
  );
}
