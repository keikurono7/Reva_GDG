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
import BillModal from "../components/BillModal"; // create like InitiativeModal

const db = getFirestore(app);

export default function Bills() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "bills"), orderBy("created_at", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(arr);
    });

    return () => unsub();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-3xl font-bold mb-6">Bills</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 && (
          <div className="col-span-full text-center text-slate-500">
            No bills uploaded yet.
          </div>
        )}

        {items.map((item) => {
          const img = bytesToBase64(item.image_blob);

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03, y: -4 }}
              className="cursor-pointer rounded-3xl border border-white bg-white/92 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] backdrop-blur-lg"
            >
              {img && (
                <img
                  src={img}
                  alt="bill"
                  className="mb-4 h-40 w-full rounded-2xl border border-slate-100 object-cover"
                  onClick={() => setSelected(item)}
                />
              )}

              <h3
                className="text-xl font-bold cursor-pointer"
                onClick={() => setSelected(item)}
              >
                {item.title}
              </h3>

              <p
                className="mb-2 cursor-pointer text-slate-600"
                onClick={() => setSelected(item)}
              >
                {item.description}
              </p>

              <div className="text-sm text-slate-500">
                Uploaded by: {item.author}
              </div>

              <span className="mt-3 block font-bold text-amber-600">
                Score: {item.votes || 0}
              </span>

              <p className="mt-1 text-xs text-slate-400">
                Click to vote
              </p>

              {item.created_at?.toDate && (
                <div className="mt-1 text-xs text-slate-400">
                  {new Date(item.created_at.toDate()).toLocaleString()}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {selected && (
        <BillModal item={selected} onClose={() => setSelected(null)} />
      )}
    </motion.div>
  );
}
