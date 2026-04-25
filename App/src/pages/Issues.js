import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";

import { app } from "../services/firebase_";
import { bytesToBase64 } from "../utils/bytesToImage";
import IssueModal from "../components/IssueModal";
import IssueUploadModal from "../components/IssueUploadModal";

const db = getFirestore(app);

export default function Issues() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const session =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("Pratinidhi_user") || "null")
      : null;

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "issues"), orderBy("created_at", "desc")),
      (snap) => {
        const issuesList = snap.docs.map((d) => ({ 
          id: d.id, 
          ...d.data() 
        }));
        console.log("Issues fetched from Firestore:", issuesList);
        setItems(issuesList);
      },
      (error) => {
        console.error("Error fetching issues:", error);
      }
    );
    return () => unsub();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Issues</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-6 py-3 font-semibold shadow-[0_14px_32px_rgba(245,158,11,0.22)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.3)] transition"
        >
          <Plus className="w-5 h-5" />
          Report Issue
        </motion.button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No issues reported yet. Be the first to report one!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            let img = null;
            try {
              img = bytesToBase64(item.image_blob);
            } catch (err) {
              console.error("Error converting image for item:", item.id, err);
            }

            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.03, y: -4 }}
                className="cursor-pointer rounded-3xl border border-white bg-white/92 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition"
                onClick={() => setSelected(item)}
              >
                {img && (
                  <img
                    src={img}
                    alt={item.title}
                    className="mb-4 h-40 w-full rounded-2xl object-cover"
                    onError={(e) => {
                      console.error("Image failed to load for item:", item.id);
                      e.target.style.display = "none";
                    }}
                  />
                )}

                <h3 className="text-xl font-bold">
                  {item.title}
                </h3>

                <p className="truncate text-slate-600">
                  {item.description}
                </p>

                <div className="mt-2 text-sm text-slate-500">
                  Reported by: {item.author}
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  📍 {item.location?.address || "Location not specified"}
                </div>

                <span className="mt-3 block font-bold text-amber-600">
                  Status: {item.status || "Open"}
                </span>

                <p className="mt-1 text-xs text-slate-400">
                  Click to view details
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {selected && (
        <IssueModal item={selected} onClose={() => setSelected(null)} />
      )}

      {showUploadModal && (
        <IssueUploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </motion.div>
  );
}
