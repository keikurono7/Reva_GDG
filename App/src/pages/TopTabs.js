import React from "react";
import {
    LayoutDashboard,
    FileText,
    Building2,
    MessageSquare,
    Bot,
} from "lucide-react";


const tabs = [
    { id: "initiatives", label: "Initiatives", icon: LayoutDashboard },
    { id: "bills", label: "Bills", icon: FileText },
    { id: "booths", label: "Booths", icon: Building2 },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "ministers", label: "Ministers", icon: Building2 },
    { id: "chatbot", label: "Chatbot", icon: Bot },
];


export default function TopTabs({ activeTab, setActiveTab }) {
    return (
        <div className="flex items-center justify-center gap-6 mb-6">
            {tabs.map((t) => (
                <button
                key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-6 py-3 rounded-full flex items-center gap-2 font-semibold transition-all
                    ${activeTab === t.id ? "bg-gradient-to-r from-yellow-500 to-red-500 shadow-lg" : "bg-white/10 border border-white/10 hover:bg-white/20"}`}>
                    <t.icon className="w-5 h-5" />
                    {t.label}
                </button>
            ))}
        </div>
    );
}