import React, { useEffect, useRef, useState } from "react";
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
    try {
      uint8 = image_blob.toUint8Array();
    } catch {}
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

export default function Discussions() {
  const [search, setSearch] = useState("");
  const [topics, setTopics] = useState([]);
  const [messageCounts, setMessageCounts] = useState({});
  const [topicHasMinister, setTopicHasMinister] = useState({});
  const [selected, setSelected] = useState(null);
  const [session, setSession] = useState(null);
  const [ministerList, setMinisterList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [msgFile, setMsgFile] = useState(null);
  const [msgPreviewUrl, setMsgPreviewUrl] = useState(null);
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

  useEffect(() => {
    const raw = localStorage.getItem("Pratinidhi_user");
    if (raw) {
      try {
        setSession(JSON.parse(raw));
      } catch {}
    }
  }, []);

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

  useEffect(() => {
    if (topicFile) {
      const url = URL.createObjectURL(topicFile);
      setTopicPreviewUrl(url);
      createdUrlsRef.current.push(url);
    } else {
      setTopicPreviewUrl(null);
    }
  }, [topicFile]);

  useEffect(() => {
    if (msgFile) {
      const url = URL.createObjectURL(msgFile);
      setMsgPreviewUrl(url);
      createdUrlsRef.current.push(url);
    } else {
      setMsgPreviewUrl(null);
    }
  }, [msgFile]);

  if (!selected) {
    const filtered = topics.filter((t) =>
      t.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <motion.div {...fadeAnim} key="list">
        <h2 className="mb-6 text-3xl font-bold">Discussions</h2>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-3 text-slate-400" />
          <input
            placeholder="Search discussions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white p-3 pl-12 text-slate-900 shadow-sm outline-none transition focus:border-amber-300"
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
                className="group cursor-pointer rounded-3xl border border-white bg-white/92 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-start gap-4">
                  {img ? (
                    <img
                      src={img}
                      alt={topic.title}
                      className="h-14 w-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-slate-100">
                      <ImageIcon className="text-slate-400" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="text-amber-500" />
                      <span className="text-xl font-semibold">{topic.title}</span>
                    </div>

                    <p className="text-sm text-slate-600">{topic.description}</p>

                    {ministerTag && (
                      <p className="mt-1 text-sm text-amber-600">
                        Minister participated
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      <MessageCircle className="mr-1 inline h-4 w-4 text-amber-500" />
                      {count} comments
                    </p>
                  </div>

                  <ChevronRight className="ml-auto text-slate-400 group-hover:text-amber-500" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-8 right-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-4 shadow-[0_16px_40px_rgba(245,158,11,0.24)]"
        >
          <Plus className="text-white" />
        </button>

        {showCreate && (
          <motion.div className="fixed inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="mx-auto mt-24 w-full max-w-lg rounded-3xl border border-white bg-white p-6 text-slate-900">
              <div className="flex justify-between">
                <h2 className="text-xl font-bold">Create Discussion</h2>
                <button onClick={() => setShowCreate(false)}>
                  <X />
                </button>
              </div>

              <input
                className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-amber-300"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              <textarea
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-amber-300"
                rows={3}
                placeholder="Description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />

              <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-500">
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
                  alt="Topic preview"
                  className="mt-3 h-40 w-full rounded-xl border border-slate-200 object-cover"
                />
              )}

              <div className="mt-4 flex gap-3">
                <button
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-white"
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
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-slate-700"
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
      <div className="mb-6 flex items-center gap-4">
        <button
          className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
          onClick={() => setSelected(null)}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-2xl font-bold">{selected.title}</h2>
          <p className="text-sm text-slate-500">{selected.description}</p>
        </div>
      </div>

      <div className="mb-4 h-[60vh] space-y-3 overflow-y-auto rounded-3xl border border-white bg-white/90 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
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
              className={`mb-3 rounded-xl p-4 transition-all ${
                isMinister
                  ? "border border-amber-200 bg-gradient-to-r from-amber-100 to-orange-100 shadow-sm"
                  : "border border-slate-200 bg-slate-50"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <p className="font-bold text-slate-900">{msg.author}</p>

                {isMinister && (
                  <span className="rounded-lg bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                    Verified Minister
                  </span>
                )}
              </div>

              {msg.text && (
                <p className="whitespace-pre-wrap text-slate-700">{msg.text}</p>
              )}

              {msgImgUrl && (
                <img
                  src={msgImgUrl}
                  alt="attachment"
                  className="mt-2 h-32 w-40 rounded-lg border border-slate-200 object-cover"
                />
              )}

              {createdAt && (
                <p className="mt-2 text-xs text-slate-400">
                  {createdAt.toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a message..."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-amber-300"
            rows={2}
          />
          <div className="mt-2 flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
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
                  className="h-14 w-20 rounded-md object-cover"
                />
                <button
                  onClick={() => {
                    setMsgFile(null);
                    setMsgPreviewUrl(null);
                  }}
                  className="text-sm text-red-500"
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
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-white"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
