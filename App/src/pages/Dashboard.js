import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import TopTabs from "./TopTabs";
import Issues from "./Issues";
import Bills from "./Bills";
import Booths from "./Booths";
import Discussions from "./Discussions";
import Ministers from "./Ministers";
import Chatbot from "./Chatbot";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("issues");

  // read user from localStorage into state so UI updates on logout
  const [session, setSession] = useState(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("Pratinidhi_user") || "null")
      : null
  );

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("Pratinidhi_user");
      setSession(null);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#fbf5ec_100%)] p-6 text-slate-900">

      {/* ---------- TABS ---------- */}
      <TopTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        username={session?.username}
        onLogout={handleLogout}
      />

      {/* ---------- CONTENT ---------- */}
      <div className="container mx-auto mt-6">
        <AnimatePresence mode="wait">
          {activeTab === "issues" && <Issues key="issues" />}
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
