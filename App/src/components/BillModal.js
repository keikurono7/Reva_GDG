import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ThumbsUp, ThumbsDown, Send, GitCompare, Save } from "lucide-react";
import {
  getFirestore,
  doc,
  runTransaction,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import { app } from "../services/firebase_";
import { bytesToBase64 } from "../utils/bytesToImage";

const db = getFirestore(app);

function formatTimestamp(value) {
  return value?.toDate ? value.toDate().toLocaleString() : "";
}

export default function BillModal({ item, onClose }) {
  const session =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("Pratinidhi_user") || "null")
      : null;
  const username = session?.username || null;
  const canEditBill = Boolean(username) && username === item.author;

  const [score, setScore] = useState(item.votes || 0);
  const [userVote, setUserVote] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [changes, setChanges] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [revisionTitle, setRevisionTitle] = useState(item.title || "");
  const [revisionDescription, setRevisionDescription] = useState(item.description || "");
  const [changeSummary, setChangeSummary] = useState("");
  const [savingRevision, setSavingRevision] = useState(false);
  const [currentBill, setCurrentBill] = useState(item);

  useEffect(() => {
    const billRef = doc(db, "bills", item.id);
    const unsub = onSnapshot(billRef, (snap) => {
      if (!snap.exists()) return;
      const nextBill = { id: snap.id, ...snap.data() };
      setCurrentBill(nextBill);
      setScore(nextBill.votes || 0);
      setRevisionTitle(nextBill.title || "");
      setRevisionDescription(nextBill.description || "");
    });
    return () => unsub();
  }, [item.id]);

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
    const q = query(
      collection(db, "bills", item.id, "changes"),
      orderBy("created_at", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setChanges(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
        const oldVote = vSnap.exists() ? vSnap.data().vote || 0 : 0;

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
        created_at: serverTimestamp(),
      });
      setNewComment("");
    } catch (err) {
      console.error("Comment failed", err);
      alert("Failed to post comment");
    }
  };

  const handleSaveRevision = async () => {
    if (!canEditBill) return;
    if (!revisionTitle.trim() || !revisionDescription.trim()) {
      alert("Title and description are required.");
      return;
    }

    const titleChanged = revisionTitle.trim() !== (currentBill.title || "");
    const descriptionChanged =
      revisionDescription.trim() !== (currentBill.description || "");

    if (!titleChanged && !descriptionChanged) {
      alert("Make a change before publishing a revision.");
      return;
    }

    if (!changeSummary.trim()) {
      alert("Add a short summary of what changed.");
      return;
    }

    setSavingRevision(true);

    try {
      const nextVersion = Number(currentBill.version || 1) + 1;

      await addDoc(collection(db, "bills", item.id, "changes"), {
        version: nextVersion,
        summary: changeSummary.trim(),
        changedBy: username,
        before: {
          title: currentBill.title || "",
          description: currentBill.description || "",
        },
        after: {
          title: revisionTitle.trim(),
          description: revisionDescription.trim(),
        },
        created_at: serverTimestamp(),
      });

      await updateDoc(doc(db, "bills", item.id), {
        title: revisionTitle.trim(),
        description: revisionDescription.trim(),
        version: nextVersion,
        changesCount: Number(currentBill.changesCount || 0) + 1,
        latestChangeSummary: changeSummary.trim(),
        updated_at: serverTimestamp(),
      });

      setChangeSummary("");
    } catch (err) {
      console.error("Revision save failed", err);
      alert("Failed to publish revision");
    } finally {
      setSavingRevision(false);
    }
  };

  const imgSrc = currentBill.image_blob ? bytesToBase64(currentBill.image_blob) : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white bg-white p-6 text-slate-900"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{currentBill.title}</h2>
            <div className="text-sm text-slate-500">
              By {currentBill.author || "-"} | Version {currentBill.version || 1}
            </div>
          </div>

          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            {imgSrc && (
              <img
                src={imgSrc}
                className="mb-4 h-64 w-full rounded-xl object-cover"
                alt="bill"
              />
            )}

            <p className="mb-4 text-slate-600">{currentBill.description}</p>

            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={() => handleVote(1)}
                disabled={loading}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
                  userVote === 1
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <ThumbsUp className="h-5 w-5" /> Upvote
              </button>

              <button
                onClick={() => handleVote(-1)}
                disabled={loading}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
                  userVote === -1
                    ? "bg-rose-600 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <ThumbsDown className="h-5 w-5" /> Downvote
              </button>

              <div className="ml-auto font-bold text-amber-600">Score: {score}</div>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-bold">Changes</h3>
              </div>

              {changes.length === 0 ? (
                <div className="text-sm text-slate-500">
                  No revisions yet. This bill is still on its original version.
                </div>
              ) : (
                <div className="space-y-4">
                  {changes.map((change) => (
                    <div key={change.id} className="rounded-xl bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">
                            Version {change.version || "-"} update
                          </div>
                          <div className="text-sm text-slate-500">
                            {change.summary || "No summary provided"}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 text-right">
                          <div>{change.changedBy || "Government"}</div>
                          <div>{formatTimestamp(change.created_at)}</div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
                            Before
                          </div>
                          <div className="font-semibold text-slate-800">
                            {change.before?.title || "-"}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {change.before?.description || "-"}
                          </div>
                        </div>

                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            After
                          </div>
                          <div className="font-semibold text-slate-800">
                            {change.after?.title || "-"}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {change.after?.description || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h3 className="mb-2 text-lg font-bold">Comments</h3>

            <div className="mb-3 max-h-60 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
              {comments.length === 0 && (
                <div className="text-center text-slate-500">No comments yet.</div>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-xl bg-white p-3">
                  <div className="text-sm text-amber-600">{comment.author}</div>
                  <div>{comment.text}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {formatTimestamp(comment.created_at)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment or ask for a change..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-amber-300"
              />
              <button
                onClick={handleComment}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 text-white"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>

            {currentBill.created_at?.toDate && (
              <div className="mt-4 text-xs text-slate-400">
                Posted on {new Date(currentBill.created_at.toDate()).toLocaleString()}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-lg font-bold">Government Revision Panel</h3>

            {canEditBill ? (
              <div className="space-y-3">
                <div className="text-sm text-slate-500">
                  Publish a revised version after reviewing citizen feedback. Each update will
                  be stored with before/after snapshots in the bill's change timeline.
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Updated Title</label>
                  <input
                    value={revisionTitle}
                    onChange={(e) => setRevisionTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-amber-300"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Updated Description</label>
                  <textarea
                    value={revisionDescription}
                    onChange={(e) => setRevisionDescription(e.target.value)}
                    rows={7}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-amber-300"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Change Summary</label>
                  <textarea
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    rows={3}
                    placeholder="Example: Clarified compensation clause after citizen feedback."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-amber-300"
                  />
                </div>

                <button
                  onClick={handleSaveRevision}
                  disabled={savingRevision}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  {savingRevision ? "Publishing..." : "Publish Revision"}
                </button>
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                Only the bill author can publish official revisions. Citizens can still use
                comments to suggest what should change.
              </div>
            )}

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Latest change</div>
              <div className="mt-1 font-semibold text-slate-800">
                {currentBill.latestChangeSummary || "Initial bill draft published"}
              </div>
              <div className="mt-2 text-sm text-slate-500">
                Version {currentBill.version || 1} | {currentBill.changesCount || 0} tracked
                revision{Number(currentBill.changesCount || 0) === 1 ? "" : "s"}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
