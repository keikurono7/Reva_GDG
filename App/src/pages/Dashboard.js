import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { User } from "lucide-react";

import TopTabs from "./TopTabs";
import Initiatives from "./Initiatives";
import Bills from "./Bills";
import Booths from "./Booths";
import Discussions from "./Discussions";
import Ministers from "./Ministers";
import Chatbot from "./Chatbot";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("initiatives");

  // read user from localStorage
  const session =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("Pratinidhi_user") || "null")
      : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#fbf5ec_100%)] p-6 text-slate-900">

      {/* ---------- HEADER WITH USER ---------- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/90 px-4 py-2 shadow-sm">
          <User className="w-5 h-5 text-amber-500" />
          <span className="font-semibold">{session?.username || "Guest"}</span>
        </div>
      </div>

      {/* ---------- TABS ---------- */}
      <TopTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ---------- CONTENT ---------- */}
      <div className="container mx-auto mt-6">
        <AnimatePresence mode="wait">
          {activeTab === "initiatives" && <Initiatives key="initiatives" />}
          {activeTab === "bills" && <Bills key="bills" />}
          {activeTab === "booths" && <Booths key="booths" />}
          {activeTab === "discussions" && <Discussions key="discussions" />}
          {activeTab === "ministers" && <Ministers key="ministers" />}
          {activeTab === "chatbot" && <Chatbot key="chatbot" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
