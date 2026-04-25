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
      ? JSON.parse(localStorage.getItem("belaku_user") || "null")
      : null;

  const username = session?.username || null;

  const [score, setScore] = useState(item.votes || 0);
  const [userVote, setUserVote] = useState(0);
  const [loading, setLoading] = useState(false);

  // comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  /* Load comments live */
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

  /* Load user's previous vote */
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
  }, [item.id]);

  /* Handle Voting */
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

  /* Add comment */
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-gray-900 p-6 rounded-2xl w-full max-w-2xl border border-white/10"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <p className="text-gray-400 text-sm">By {item.author}</p>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl">
            <X />
          </button>
        </div>

        {/* IMAGE */}
        {img && <img src={img} className="w-full h-64 object-cover rounded-xl mb-4" />}

        {/* DESCRIPTION */}
        <p className="text-gray-300 mb-4">{item.description}</p>

        {/* VOTING */}
        <div className="flex items-center gap-3 mb-4">
          <button
            disabled={loading}
            onClick={() => handleVote(1)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
              userVote === 1 ? "bg-green-600" : "bg-white/10"
            }`}
          >
            <ThumbsUp /> Upvote
          </button>

          <button
            disabled={loading}
            onClick={() => handleVote(-1)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
              userVote === -1 ? "bg-red-600" : "bg-white/10"
            }`}
          >
            <ThumbsDown /> Downvote
          </button>

          <div className="ml-auto font-bold text-yellow-300">Score: {score}</div>
        </div>

        {/* COMMENTS */}
        <h3 className="text-lg font-bold mb-2">Comments</h3>

        <div className="max-h-60 overflow-y-auto mb-3 space-y-2 p-2 bg-white/5 rounded-xl border border-white/10">
          {comments.map((c) => (
            <div key={c.id} className="p-3 bg-white/10 rounded-xl">
              <div className="text-yellow-400 text-sm">{c.author}</div>
              <div>{c.text}</div>
              <div className="text-gray-500 text-xs mt-1">
                {c.created_at?.toDate?.() &&
                  c.created_at.toDate().toLocaleTimeString()}
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-gray-400 text-center">No comments yet.</div>
          )}
        </div>

        {/* COMMENT INPUT */}
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
      </motion.div>
    </motion.div>
  );
}
