import React from "react";
import {
    AlertCircle,
    FileText,
    Building2,
    MessageSquare,
    Bot,
} from "lucide-react";


const tabs = [
    { id: "issues", label: "Issues", icon: AlertCircle },
    { id: "bills", label: "Bills", icon: FileText },
    { id: "booths", label: "Booths", icon: Building2 },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "ministers", label: "Ministers", icon: Building2 },
    { id: "chatbot", label: "Chatbot", icon: Bot },
];


export default function TopTabs({ activeTab, setActiveTab }) {
    return (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
            {tabs.map((t) => (
                <button
                key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-all
                    ${activeTab === t.id ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_14px_32px_rgba(245,158,11,0.22)]" : "border border-slate-200 bg-white/90 text-slate-600 hover:border-amber-200 hover:text-slate-900 hover:shadow-sm"}`}>
                    <t.icon className="w-5 h-5" />
                    {t.label}
                </button>
            ))}
        </div>
    );
}
