import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  Image as ImageIcon,
  FileText,
  LayoutDashboard,
  MessageSquare
} from "lucide-react";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  Bytes
} from "firebase/firestore";

import { app } from "../services/firebase_";
import { fileToBytes } from "../utils/fileToBytes";

const db = getFirestore(app);

export default function TrialPage() {
  const [type, setType] = useState("initiative");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [uploader, setUploader] = useState("");
  const [party, setParty] = useState("");            // MATCH PYTHON SCHEMA
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !uploader.trim()) {
      setMessage("Title & author required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let image_blob = null;

      if (file) {
        const rawBytes = await fileToBytes(file);
        image_blob = Bytes.fromUint8Array(rawBytes);
      }

      const collectionMap = {
        initiative: "initiatives",
        bill: "bills",
        topic: "discussionTopics"
      };

      await addDoc(collection(db, collectionMap[type]), {
        title,
        description: desc,
        author: uploader,
        party: party || null,               // ⭐ NOW MATCHING PYTHON
        image_blob,
        created_at: serverTimestamp()
      });

      setMessage("Uploaded ✔");
      setFile(null);
      setTitle(""); 
      setDesc(""); 
      setUploader("");
      setParty("");

    } catch (err) {
      console.error(err);
      setMessage("Upload failed.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white">
      <div className="max-w-3xl mx-auto">

        <motion.h1 className="text-4xl font-bold mb-6">Admin Upload</motion.h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4"
        >
          {/* Type selector */}
          <div className="flex gap-3">
            <button type="button" onClick={() => setType("initiative")}
              className={`px-4 py-2 rounded-xl ${
                type === "initiative" ? "bg-gradient-to-r from-yellow-500 to-red-500 text-black" : "bg-white/10"
              }`}
            >
              <LayoutDashboard /> Initiative
            </button>

            <button type="button" onClick={() => setType("bill")}
              className={`px-4 py-2 rounded-xl ${
                type === "bill" ? "bg-gradient-to-r from-yellow-500 to-red-500 text-black" : "bg-white/10"
              }`}
            >
              <FileText /> Bill
            </button>

            <button type="button" onClick={() => setType("topic")}
              className={`px-4 py-2 rounded-xl ${
                type === "topic" ? "bg-gradient-to-r from-yellow-500 to-red-500 text-black" : "bg-white/10"
              }`}
            >
              <MessageSquare /> Topic
            </button>
          </div>

          {/* Inputs */}
          <input
            placeholder="Title"
            className="p-3 bg-white/10 rounded-xl w-full"
            value={title} onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Description"
            className="p-3 bg-white/10 rounded-xl w-full"
            rows="4"
            value={desc} onChange={(e) => setDesc(e.target.value)}
          />

          <input
            placeholder="Author"
            className="p-3 bg-white/10 rounded-xl w-full"
            value={uploader} onChange={(e) => setUploader(e.target.value)}
          />

          <input
            placeholder="Party (optional)"
            className="p-3 bg-white/10 rounded-xl w-full"
            value={party} onChange={(e) => setParty(e.target.value)}
          />

          <div>
            <label className="flex items-center gap-2 text-gray-300">
              <ImageIcon /> Image (optional)
            </label>
            <input 
              type="file" 
              accept="image/*"
              className="mt-2"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && <p className="text-sm text-gray-400">{file.name}</p>}
          </div>

          <button
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-red-500 font-bold w-full"
          >
            {loading ? "Uploading..." : <><UploadCloud /> Upload</>}
          </button>

          <p className="text-center">{message}</p>
        </form>
      </div>
    </div>
  );
}
