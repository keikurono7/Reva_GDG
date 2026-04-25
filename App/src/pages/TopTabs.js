import React from "react";
import {
    LayoutDashboard,
    FileText,
    Building2,
    MessageSquare,
    Bot,
    Sparkles,
    User,
} from "lucide-react";


const tabs = [
    { id: "initiatives", label: "Initiatives", icon: LayoutDashboard },
    { id: "bills", label: "Bills", icon: FileText },
    { id: "booths", label: "Booths", icon: Building2 },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "ministers", label: "Ministers", icon: Building2 },
    { id: "chatbot", label: "Chatbot", icon: Bot },
];


export default function TopTabs({ activeTab, setActiveTab, username }) {
    return (
        <header className="sticky top-0 z-40 mb-6 border-b border-slate-200 bg-white/95 shadow-[0_2px_10px_rgba(15,23,42,0.05)] backdrop-blur-sm">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-2 px-4 py-2 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_8px_18px_rgba(245,158,11,0.2)]">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-slate-500">Citizen Dashboard</p>
                        <h1 className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-xl font-bold leading-none text-transparent">
                            Pratinidhi
                        </h1>
                    </div>
                </div>

                <nav className="w-full lg:w-[820px] lg:justify-self-center" aria-label="Dashboard sections">
                    <div className="mx-auto flex w-full items-center justify-start gap-1.5 overflow-x-auto rounded-full border border-slate-200 bg-white px-1.5 py-1.5 lg:justify-center">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-200 sm:px-4 ${
                                    activeTab === t.id
                                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_8px_18px_rgba(245,158,11,0.22)]"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                                aria-current={activeTab === t.id ? "page" : undefined}
                            >
                                <span className="flex items-center gap-2">
                                    <t.icon className="h-4 w-4" />
                                    {t.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </nav>

                <button
                    type="button"
                    className="ml-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-50 lg:justify-self-end"
                >
                    <User className="h-4 w-4 text-amber-500" />
                    <span className="max-w-36 truncate">{username || "Guest"}</span>
                </button>
            </div>
        </header>
    );
}
