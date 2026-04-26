import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import {
  getFirestore,
  doc,
  runTransaction,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";

import { app } from "../services/firebase_";
import { bytesToBase64 } from "../utils/bytesToImage";

const db = getFirestore(app);

export default function InitiativeModal({ item, onClose }) {
  const session =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("Pratinidhi_user") || "null")
      : null;

  const username = session?.username || null;

  const [score, setScore] = useState(item.votes || 0);
  const [userVote, setUserVote] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "initiatives", item.id, "comments"),
      orderBy("created_at", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [item.id]);

  useEffect(() => {
    if (!username) return;

    const voteRef = doc(db, "initiatives", item.id, "votes", username);

    (async () => {
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(voteRef);
          setUserVote(snap.exists() ? snap.data().vote : 0);
        });
      } catch {}
    })();
  }, [item.id, username]);

  const handleVote = async (value) => {
    if (!username) return alert("Login to vote.");

    setLoading(true);

    const initiativeRef = doc(db, "initiatives", item.id);
    const voteRef = doc(db, "initiatives", item.id, "votes", username);

    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(initiativeRef);
        if (!snap.exists()) throw new Error("Missing post");

        const voteSnap = await tx.get(voteRef);
        const oldVote = voteSnap.exists() ? voteSnap.data().vote : 0;

        let newVote = value;
        if (oldVote === value) newVote = 0;

        const delta = newVote - oldVote;
        const newTotal = (snap.data().votes || 0) + delta;

        tx.set(voteRef, { vote: newVote });
        tx.update(initiativeRef, { votes: newTotal });

        setScore(newTotal);
        setUserVote(newVote);
      });
    } catch (err) {
      console.error(err);
      alert("Vote error");
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    if (!username) return alert("Login to comment.");

    await addDoc(collection(db, "initiatives", item.id, "comments"), {
      text: newComment.trim(),
      author: username,
      created_at: serverTimestamp()
    });

    setNewComment("");
  };

  const img = item.image_blob ? bytesToBase64(item.image_blob) : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-2 backdrop-blur-sm sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white bg-white p-4 text-slate-900 sm:rounded-3xl sm:p-6"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="mb-4 flex justify-between">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">{item.title}</h2>
            <p className="text-sm text-slate-500">By {item.author}</p>
          </div>

          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100">
            <X />
          </button>
        </div>

        {img && <img src={img} alt={item.title} className="mb-4 h-48 w-full rounded-xl object-cover sm:h-64" />}

        <p className="mb-4 text-slate-600">{item.description}</p>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            disabled={loading}
            onClick={() => handleVote(1)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
              userVote === 1 ? "bg-emerald-600 text-white" : "border border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <ThumbsUp /> Upvote
          </button>

          <button
            disabled={loading}
            onClick={() => handleVote(-1)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
              userVote === -1 ? "bg-rose-600 text-white" : "border border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <ThumbsDown /> Downvote
          </button>

          <div className="w-full font-bold text-amber-600 sm:ml-auto sm:w-auto">Score: {score}</div>
        </div>

        <h3 className="mb-2 text-lg font-bold">Comments</h3>

        <div className="mb-3 max-h-60 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-white p-3">
              <div className="text-sm text-amber-600">{c.author}</div>
              <div>{c.text}</div>
              <div className="mt-1 text-xs text-slate-400">
                {c.created_at?.toDate?.() &&
                  c.created_at.toDate().toLocaleTimeString()}
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center text-slate-500">No comments yet.</div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-amber-300"
          />
          <button
            onClick={handleComment}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white sm:py-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
