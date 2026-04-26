import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, MapPin, Calendar, User } from "lucide-react";
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
import { bytesToBase64 } from "../utils/bytesToImage";

const db = getFirestore(app);

export default function IssueModal({ item, onClose }) {
  const session =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("Pratinidhi_user") || "null")
      : null;

  const username = session?.username || null;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const placeLabel =
    item.politician?.constituency ||
    item.location?.address ||
    "Place not specified";
  const mlaLabel = item.politician?.mla || "MLA not assigned";
  const mpLabel = item.politician?.mp || "MP not assigned";

  useEffect(() => {
    const q = query(
      collection(db, "issues", item.id, "comments"),
      orderBy("created_at", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [item.id]);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    if (!username) return alert("Login to comment.");

    setLoading(true);

    try {
      await addDoc(
        collection(db, "issues", item.id, "comments"),
        {
          author: username,
          text: newComment,
          created_at: serverTimestamp()
        }
      );

      setNewComment("");
    } catch (err) {
      console.error(err);
      alert("Error posting comment");
    } finally {
      setLoading(false);
    }
  };

  const img = bytesToBase64(item.image_blob);
  const mapUrl = item.location?.lat && item.location?.lng
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.5${ Math.random()}!2d${item.location.lng}!3d${item.location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zIssue!5e0!3m2!1sen!2sin!4v${Date.now()}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-2 sm:items-center sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4 sm:p-6">
          <h3 className="pr-2 text-xl font-bold sm:text-2xl">{item.title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
          {/* Image */}
          {img && (
            <img
              src={img}
              alt={item.title}
              className="h-56 w-full rounded-2xl object-cover sm:h-80"
              onError={(e) => {
                console.error("Image failed to load in modal");
                e.target.style.display = "none";
              }}
            />
          )}

          {/* Description */}
          <div>
            <h4 className="font-semibold text-lg mb-2">Description</h4>
            <p className="text-slate-600">{item.description}</p>
          </div>

          {/* Issue Metadata */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl">
              <User className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-semibold">REPORTED BY</p>
                <p className="text-slate-900 font-semibold">{item.author}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
              <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-semibold">STATUS</p>
                <p className="text-slate-900 font-semibold">{item.status || "Open"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl">
              <MapPin className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-semibold">PLACE</p>
                <p className="text-slate-900 font-semibold">{placeLabel}</p>
              </div>
            </div>

            <div className="col-span-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs text-slate-500 font-semibold">ASSOCIATED REPRESENTATIVES</p>
              <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-700 md:grid-cols-2">
                <p><strong>MLA:</strong> {mlaLabel}</p>
                <p><strong>MP:</strong> {mpLabel}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          {item.location && (
            <div>
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                Issue Location
              </h4>

              {mapUrl ? (
                <iframe
                  className="h-56 w-full rounded-2xl sm:h-72"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={mapUrl}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              ) : (
                <div className="bg-slate-100 rounded-2xl p-4 text-center text-slate-500">
                  Location coordinates: {item.location.lat?.toFixed(4)}, {item.location.lng?.toFixed(4)}
                </div>
              )}

              {item.location.address && (
                <p className="mt-3 text-sm text-slate-600">
                  <strong>Address:</strong> {item.location.address}
                </p>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Comments</h4>

            {/* Comment Input */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={loading || !newComment.trim()}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white transition hover:shadow-lg disabled:opacity-50 sm:w-auto"
              >
                Post
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-sm">{comment.author}</p>
                    <p className="text-slate-600 text-sm mt-1">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
