import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";

import { app } from "../services/firebase_";
import { bytesToBase64 } from "../utils/bytesToImage";
import InitiativeModal from "../components/InitiativeModal";

const db = getFirestore(app);

export default function Initiatives() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "initiatives"), orderBy("created_at", "desc")),
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );
    return () => unsub();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-3xl font-bold mb-6">Initiatives</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const img = bytesToBase64(item.image_blob);

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
                />
              )}

              <h3 className="text-xl font-bold">
                {item.title}
              </h3>

              <p className="truncate text-slate-600">
                {item.description}
              </p>

              <div className="mt-2 text-sm text-slate-500">
                Uploaded by: {item.author}
              </div>

              <span className="mt-3 block font-bold text-amber-600">
                Score: {item.votes || 0}
              </span>

              <p className="mt-1 text-xs text-slate-400">
                Click to vote
              </p>
            </motion.div>
          );
        })}
      </div>

      {selected && (
        <InitiativeModal item={selected} onClose={() => setSelected(null)} />
      )}
    </motion.div>
  );
}
