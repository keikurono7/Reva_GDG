import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ChevronRight,
  Search,
  MessageCircle,
  Plus,
  Send,
  ArrowLeft,
  X,
  Image as ImageIcon
} from "lucide-react";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Bytes,
  getDocs
} from "firebase/firestore";

import { app } from "../services/firebase_";

const db = getFirestore(app);

const fadeAnim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/* ------------------- Helpers ------------------- */

async function fileToUint8Array(file) {
  const ab = await file.arrayBuffer();
  return new Uint8Array(ab);
}

function detectMime(uint8) {
  if (!uint8 || uint8.length < 4) return "application/octet-stream";
  if (uint8[0] === 0x89 && uint8[1] === 0x50) return "image/png";
  if (uint8[0] === 0xff && uint8[1] === 0xd8) return "image/jpeg";
  if (uint8[0] === 0x47 && uint8[1] === 0x49) return "image/gif";
  return "application/octet-stream";
}

function bytesToObjectUrl(image_blob) {
  if (!image_blob) return null;

  let uint8 = null;

  if (typeof image_blob?.toUint8Array === "function") {
    try { uint8 = image_blob.toUint8Array(); } catch {}
  }

  if (!uint8 && image_blob instanceof Uint8Array) uint8 = image_blob;

  if (!uint8 && image_blob?._byteString?.binaryString) {
    const bs = image_blob._byteString.binaryString;
    const arr = new Uint8Array(bs.length);
    for (let i = 0; i < bs.length; i++) arr[i] = bs.charCodeAt(i);
    uint8 = arr;
  }

  if (!uint8) return null;

  const blob = new Blob([uint8], { type: detectMime(uint8) });
  return URL.createObjectURL(blob);
}

/* ------------------------------------------------ */

export default function Discussions() {
  const [search, setSearch] = useState("");
  const [topics, setTopics] = useState([]);
  const [messageCounts, setMessageCounts] = useState({});
  const [topicHasMinister, setTopicHasMinister] = useState({});
  const [selected, setSelected] = useState(null);

  // session user
  const [session, setSession] = useState(null);

  // ministers list
  const [ministerList, setMinisterList] = useState([]);

  // messages
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [msgFile, setMsgFile] = useState(null);
  const [msgPreviewUrl, setMsgPreviewUrl] = useState(null);

  // topic creation
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [topicFile, setTopicFile] = useState(null);
  const [topicPreviewUrl, setTopicPreviewUrl] = useState(null);

  const createdUrlsRef = useRef([]);

  useEffect(() => {
    return () => {
      createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      createdUrlsRef.current = [];
    };
  }, []);

  /* ---------------- Load User ---------------- */
  useEffect(() => {
    const raw = localStorage.getItem("belaku_user");
    if (raw) try {
      setSession(JSON.parse(raw));
    } catch {}
  }, []);

  /* ---------------- Load Ministers ---------------- */
  useEffect(() => {
    const loadMinisters = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const ministers = snap.docs
          .map((d) => d.data())
          .filter((u) => u.post && String(u.post).trim() !== "")
          .map((u) => u.username)
          .filter(Boolean);

        setMinisterList(ministers);
      } catch (err) {
        console.error("Failed loading ministers", err);
      }
    };

    loadMinisters();
  }, []);

  /* ---------------- Load Discussion Topics ---------------- */
  useEffect(() => {
    const q = query(collection(db, "discussionTopics"), orderBy("created_at", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTopics(arr);

      arr.forEach((topic) => {
        const msgQ = query(collection(db, "discussionTopics", topic.id, "messages"));

        onSnapshot(msgQ, (msgSnap) => {
          const msgs = msgSnap.docs.map((d) => d.data());
          setMessageCounts((p) => ({ ...p, [topic.id]: msgSnap.size }));

          const hasMinister = msgs.some((m) => ministerList.includes(m.author));
          setTopicHasMinister((p) => ({ ...p, [topic.id]: hasMinister }));
        });
      });
    });

    return () => unsub();
  }, [ministerList]);

  /* ---------------- Load Messages for Selected ---------------- */
  useEffect(() => {
    if (!selected?.id) return setMessages([]);

    const q = query(
      collection(db, "discussionTopics", selected.id, "messages"),
      orderBy("created_at", "asc")
    );

    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [selected]);

  /* ---------------- Image Preview ---------------- */
  useEffect(() => {
    if (topicFile) {
      const url = URL.createObjectURL(topicFile);
      setTopicPreviewUrl(url);
      createdUrlsRef.current.push(url);
    } else setTopicPreviewUrl(null);
  }, [topicFile]);

  useEffect(() => {
    if (msgFile) {
      const url = URL.createObjectURL(msgFile);
      setMsgPreviewUrl(url);
      createdUrlsRef.current.push(url);
    } else setMsgPreviewUrl(null);
  }, [msgFile]);

  /* ---------------- List View ---------------- */
  if (!selected) {
    const filtered = topics.filter((t) =>
      t.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <motion.div {...fadeAnim} key="list">
        <h2 className="text-3xl font-bold mb-6">Discussions</h2>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-3 text-gray-400" />
          <input
            placeholder="Search discussions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 pl-12 bg-white/10 rounded-xl border border-white/10"
          />
        </div>

        <div className="space-y-4">
          {filtered.map((topic) => {
            const img = topic.image_blob ? bytesToObjectUrl(topic.image_blob) : null;
            const count = messageCounts[topic.id] || 0;
            const ministerTag = topicHasMinister[topic.id];

            return (
              <motion.div
                key={topic.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelected(topic)}
                className="p-5 bg-white/10 rounded-xl border border-white/10 cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {img ? (
                    <img
                      src={img}
                      className="w-20 h-14 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-20 h-14 bg-white/5 rounded-md flex items-center justify-center">
                      <ImageIcon className="text-gray-300" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="text-yellow-400" />
                      <span className="font-semibold text-xl">{topic.title}</span>
                    </div>

                    <p className="text-gray-300 text-sm">{topic.description}</p>

                    {ministerTag && (
                      <p className="text-yellow-400 text-sm mt-1">
                        ⭐ Minister participated
                      </p>
                    )}

                    <p className="text-gray-400 text-xs mt-2">
                      <MessageCircle className="inline w-4 h-4 mr-1 text-blue-400" />
                      {count} comments
                    </p>
                  </div>

                  <ChevronRight className="ml-auto text-gray-400 group-hover:text-yellow-400" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAB create */}
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-yellow-500 to-red-500 p-4 rounded-full"
        >
          <Plus className="text-black" />
        </button>

        {/* CREATE MODAL */}
        {showCreate && (
          <motion.div className="fixed inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="bg-gray-900 max-w-lg w-full p-6 rounded-2xl mx-auto mt-24">
              <div className="flex justify-between">
                <h2 className="text-xl font-bold">Create Discussion</h2>
                <button onClick={() => setShowCreate(false)}>
                  <X />
                </button>
              </div>

              <input
                className="w-full p-3 bg-white/10 rounded-xl mt-4"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              <textarea
                className="w-full p-3 bg-white/10 rounded-xl mt-3"
                rows={3}
                placeholder="Description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              ></textarea>

              <label className="mt-4 flex gap-2 items-center text-sm text-gray-300 cursor-pointer">
                <ImageIcon />
                <span>Upload Topic Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTopicFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              {topicPreviewUrl && (
                <img
                  src={topicPreviewUrl}
                  className="w-full h-40 object-cover rounded-xl mt-3 border border-white/10"
                />
              )}

              <div className="flex gap-3 mt-4">
                <button
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl"
                  onClick={async () => {
                    if (!newTitle.trim()) return alert("Title required");

                    let blob = null;
                    if (topicFile) {
                      const uint8 = await fileToUint8Array(topicFile);
                      blob = Bytes.fromUint8Array(uint8);
                    }

                    await addDoc(collection(db, "discussionTopics"), {
                      title: newTitle.trim(),
                      description: newDesc.trim() || null,
                      image_blob: blob,
                      created_at: serverTimestamp(),
                    });

                    setShowCreate(false);
                    setNewDesc("");
                    setNewTitle("");
                    setTopicFile(null);
                  }}
                >
                  Create
                </button>

                <button
                  className="px-4 py-2 bg-white/10 rounded-xl"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    );
  }
  /* ---------------- CHAT VIEW (when a topic is selected) ---------------- */

  // send message with optional image
  const sendMessage = async () => {
    if (!newMsg.trim() && !msgFile) return;
    if (!session?.username) {
      alert("You must be logged in to send messages.");
      return;
    }
    if (!selected?.id) return;

    try {
      let image_blob = null;
      if (msgFile) {
        const uint8 = await fileToUint8Array(msgFile);
        image_blob = Bytes.fromUint8Array
          ? Bytes.fromUint8Array(uint8)
          : Bytes(uint8);
      }

      await addDoc(
        collection(db, "discussionTopics", selected.id, "messages"),
        {
          text: newMsg.trim() || null,
          author: session.username,
          image_blob: image_blob || null,
          created_at: serverTimestamp(),
        }
      );

      setNewMsg("");
      setMsgFile(null);
      setMsgPreviewUrl(null);
    } catch (err) {
      console.error("sendMessage error:", err);
      alert("Failed to send message");
    }
  };

  return (
    <motion.div {...fadeAnim} key="chat-screen" className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
          onClick={() => setSelected(null)}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-2xl font-bold">{selected.title}</h2>
          <p className="text-gray-400 text-sm">{selected.description}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[60vh] overflow-y-auto space-y-3 p-4 bg-white/5 rounded-xl border border-white/10 mb-4">
        {messages.map((msg) => {
          const isMinister = ministerList.includes(msg.author);

          const createdAt =
            msg.created_at?.toDate && typeof msg.created_at.toDate === "function"
              ? msg.created_at.toDate()
              : null;

          const msgImgUrl = msg.image_blob ? bytesToObjectUrl(msg.image_blob) : null;

          return (
            <div
              key={msg.id}
              className={`p-4 rounded-xl mb-3 transition-all ${
                isMinister
                  ? "bg-gradient-to-r from-red-700 to-yellow-600 border border-yellow-400 shadow-xl"
                  : "bg-white/10 border border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-white">{msg.author}</p>

                {isMinister && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-yellow-400 text-black">
                    Verified Minister
                  </span>
                )}
              </div>

              {msg.text && (
                <p className="text-gray-50 whitespace-pre-wrap">{msg.text}</p>
              )}

              {msgImgUrl && (
                <img
                  src={msgImgUrl}
                  alt="attachment"
                  className="w-40 h-32 object-cover rounded-lg mt-2 border border-white/20"
                />
              )}

              {createdAt && (
                <p className="text-gray-300 text-xs mt-2">
                  {createdAt.toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-3 bg-white/10 rounded-xl border border-white/10 resize-none"
            rows={2}
          />
          {/* image attach */}
          <div className="flex items-center gap-2 mt-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <ImageIcon />
              <span>Attach image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setMsgFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            {msgPreviewUrl && (
              <div className="ml-auto flex items-center gap-2">
                <img
                  src={msgPreviewUrl}
                  alt="preview"
                  className="w-20 h-14 object-cover rounded-md"
                />
                <button
                  onClick={() => {
                    setMsgFile(null);
                    setMsgPreviewUrl(null);
                  }}
                  className="text-sm text-red-400"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl"
          >
            <Send className="text-black w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
