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

export default function BillModal({ item, onClose }) {
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
      collection(db, "bills", item.id, "comments"),
      orderBy("created_at", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [item.id]);

  useEffect(() => {
    if (!username) return;

    const voteRef = doc(db, "bills", item.id, "votes", username);
    (async () => {
      try {
        await runTransaction(db, async (tx) => {
          const vSnap = await tx.get(voteRef);
          setUserVote(vSnap.exists() ? vSnap.data().vote : 0);
        });
      } catch {}
    })();
  }, [item.id, username]);

  const handleVote = async (value) => {
    if (!username) {
      alert("Please login to vote");
      return;
    }
    if (![1, -1].includes(value)) return;

    setLoading(true);

    const billRef = doc(db, "bills", item.id);
    const voteRef = doc(db, "bills", item.id, "votes", username);

    try {
      await runTransaction(db, async (tx) => {
        const billSnap = await tx.get(billRef);
        if (!billSnap.exists()) throw new Error("Bill missing");

        const vSnap = await tx.get(voteRef);
        const oldVote = vSnap.exists() ? (vSnap.data().vote || 0) : 0;

        let newVote = value;
        if (oldVote === value) newVote = 0;

        const delta = newVote - oldVote;
        const currentTotal = billSnap.data().votes || 0;
        const newTotal = currentTotal + delta;

        tx.set(voteRef, { vote: newVote });
        tx.update(billRef, { votes: newTotal });

        setUserVote(newVote);
        setScore(newTotal);
      });
    } catch (err) {
      console.error("Vote transaction failed:", err);
      alert("Vote failed, try again");
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    if (!username) return alert("Please login to comment");

    try {
      await addDoc(collection(db, "bills", item.id, "comments"), {
        text: newComment.trim(),
        author: username,
        created_at: serverTimestamp()
      });
      setNewComment("");
    } catch (err) {
      console.error("Comment failed", err);
      alert("Failed to post comment");
    }
  };

  const imgSrc = item.image_blob ? bytesToBase64(item.image_blob) : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-2xl rounded-3xl border border-white bg-white p-6 text-slate-900"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <div className="text-sm text-slate-500">By {item.author || "—"}</div>
          </div>

          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {imgSrc && (
          <img
            src={imgSrc}
            className="mb-4 h-64 w-full rounded-xl object-cover"
            alt="bill"
          />
        )}

        <p className="mb-4 text-slate-600">{item.description}</p>

        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => handleVote(1)}
            disabled={loading}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
              userVote === 1 ? "bg-emerald-600 text-white" : "border border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <ThumbsUp className="h-5 w-5" /> Upvote
          </button>

          <button
            onClick={() => handleVote(-1)}
            disabled={loading}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
              userVote === -1 ? "bg-rose-600 text-white" : "border border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <ThumbsDown className="h-5 w-5" /> Downvote
          </button>

          <div className="ml-auto font-bold text-amber-600">Score: {score}</div>
        </div>

        <h3 className="mb-2 text-lg font-bold">Comments</h3>

        <div className="mb-3 max-h-60 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
          {comments.length === 0 && (
            <div className="text-center text-slate-500">No comments yet.</div>
          )}
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-white p-3">
              <div className="text-sm text-amber-600">{c.author}</div>
              <div>{c.text}</div>
              <div className="mt-1 text-xs text-slate-400">
                {c.created_at?.toDate && c.created_at.toDate().toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-amber-300"
          />
          <button
            onClick={handleComment}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 text-white"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {item.created_at?.toDate && (
          <div className="mt-4 text-xs text-slate-400">
            Posted on {new Date(item.created_at.toDate()).toLocaleString()}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
