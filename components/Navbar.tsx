"use client";

import React from "react";
import { useStudyHub } from "@/lib/store";
import { Search, Flame, Bell, Headphones, Sparkles, Command } from "lucide-react";

export function Navbar({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const { buddies, setActiveTab, userStudyMinutes } = useStudyHub();
  const focusingCount = buddies.filter((b) => b.status === "focusing").length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 md:px-8 backdrop-blur-md">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 shadow-lg shadow-indigo-500/25">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-lg text-white">StudySphere</span>
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-indigo-400 border border-indigo-500/20">
              CAMPUS HUB
            </span>
          </div>
          <p className="hidden text-xs text-slate-400 sm:block">Centralised College Resource & Study Lounge</p>
        </div>
      </div>

      {/* Center Search / Command Trigger */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-400 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-4 w-4 text-slate-500" />
            <span>Search courses, past papers, notes...</span>
          </div>
          <kbd className="hidden sm:flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[11px] font-mono text-slate-400 border border-slate-700">
            <Command className="h-3 w-3" /> K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Friends Studying Live Indicator */}
        <button
          onClick={() => setActiveTab("lounge")}
          className="hidden md:flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>{focusingCount} Friends Studying</span>
        </button>

        {/* Study Lounge Quick Link */}
        <button
          onClick={() => setActiveTab("lounge")}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer"
        >
          <Headphones className="h-4 w-4" />
          <span className="hidden sm:inline">Study Lounge</span>
        </button>

        {/* User Stats Pill */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
          <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>{Math.floor(userStudyMinutes / 60)}h {userStudyMinutes % 60}m</span>
          </div>

          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-xs font-bold text-white ring-2 ring-indigo-500/30">
            AR
          </div>
        </div>
      </div>
    </header>
  );
}
