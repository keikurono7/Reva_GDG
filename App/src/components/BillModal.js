// src/components/BillModal.js
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

/**
 * Props:
 *  - item: Firestore doc data object (must include id, votes, image_blob, created_at, author, description, title)
 *  - onClose: function
 */
export default function BillModal({ item, onClose }) {
  const session =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("belaku_user") || "null")
      : null;
  const username = session?.username || null;

  const [score, setScore] = useState(item.votes || 0);
  const [userVote, setUserVote] = useState(0); // -1 | 0 | 1
  const [loading, setLoading] = useState(false);

  // comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // load comments live
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

  // fetch user's vote
  useEffect(() => {
    if (!username) return;

    const voteRef = doc(db, "bills", item.id, "votes", username);
    (async () => {
      try {
        await runTransaction(db, async (tx) => {
          const vSnap = await tx.get(voteRef);
          setUserVote(vSnap.exists() ? vSnap.data().vote : 0);
        });
      } catch (err) {
        // ignore read errors
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  // vote transaction (reddit behavior)
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
        if (oldVote === value) newVote = 0; // unvote

        const delta = newVote - oldVote;
        const currentTotal = billSnap.data().votes || 0;
        const newTotal = currentTotal + delta;

        tx.set(voteRef, { vote: newVote });
        tx.update(billRef, { votes: newTotal });

        // reflect locally
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

  // add comment
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-gray-900 p-6 rounded-2xl max-w-2xl w-full border border-white/10"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        {/* header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <div className="text-sm text-gray-400">By {item.author || "—"}</div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* image */}
        {imgSrc && (
          <img
            src={imgSrc}
            className="w-full h-64 object-cover rounded-xl mb-4"
            alt="bill"
          />
        )}

        {/* description */}
        <p className="text-gray-300 mb-4">{item.description}</p>

        {/* voting */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => handleVote(1)}
            disabled={loading}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
              userVote === 1 ? "bg-green-600" : "bg-white/10"
            }`}
          >
            <ThumbsUp className="w-5 h-5" /> Upvote
          </button>

          <button
            onClick={() => handleVote(-1)}
            disabled={loading}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
              userVote === -1 ? "bg-red-600" : "bg-white/10"
            }`}
          >
            <ThumbsDown className="w-5 h-5" /> Downvote
          </button>

          <div className="ml-auto text-yellow-300 font-bold">Score: {score}</div>
        </div>

        {/* comments */}
        <h3 className="text-lg font-bold mb-2">Comments</h3>

        <div className="max-h-60 overflow-y-auto mb-3 space-y-2 p-2 bg-white/5 rounded-xl border border-white/10">
          {comments.length === 0 && (
            <div className="text-gray-400 text-center">No comments yet.</div>
          )}
          {comments.map((c) => (
            <div key={c.id} className="p-3 bg-white/10 rounded-xl">
              <div className="text-yellow-400 text-sm">{c.author}</div>
              <div>{c.text}</div>
              <div className="text-gray-500 text-xs mt-1">
                {c.created_at?.toDate && c.created_at.toDate().toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* comment input */}
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment…"
            className="flex-1 p-3 bg-white/10 rounded-xl border border-white/10"
          />
          <button
            onClick={handleComment}
            className="px-4 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* posted at */}
        {item.created_at?.toDate && (
          <div className="text-xs text-gray-500 mt-4">
            Posted on {new Date(item.created_at.toDate()).toLocaleString()}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
