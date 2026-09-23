"use client";

import React, { useState, useEffect } from "react";
import { useStudyHub } from "@/lib/store";
import { Search, BookOpen, FolderDown, Clock, Headphones, Layers, MessageSquare, X, ArrowRight } from "lucide-react";

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const { courses, resources, deadlines, decks, setActiveTab } = useStudyHub();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
          // Handled in parent
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCourses = courses.filter(
    (c) => c.code.toLowerCase().includes(query.toLowerCase()) || c.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredResources = resources.filter(
    (r) => r.title.toLowerCase().includes(query.toLowerCase()) || r.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredDeadlines = deadlines.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase()) || d.courseCode.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDecks = decks.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase()) || d.courseCode.toLowerCase().includes(query.toLowerCase())
  );

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center border-b border-slate-800 px-4 py-3.5 gap-3">
          <Search className="h-5 w-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a subject, deadline, deck, or feature..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Nav Section */}
          {!query && (
            <div>
              <div className="px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Navigation</div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                <button
                  onClick={() => navigateTo("dashboard")}
                  className="flex items-center gap-2 rounded-xl p-2.5 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => navigateTo("lounge")}
                  className="flex items-center gap-2 rounded-xl p-2.5 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all cursor-pointer"
                >
                  <Headphones className="h-4 w-4 text-emerald-400" />
                  <span>Study Lounge</span>
                </button>
                <button
                  onClick={() => navigateTo("flashcards")}
                  className="flex items-center gap-2 rounded-xl p-2.5 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all cursor-pointer"
                >
                  <Layers className="h-4 w-4 text-purple-400" />
                  <span>Flashcards Deck</span>
                </button>
                <button
                  onClick={() => navigateTo("deadlines")}
                  className="flex items-center gap-2 rounded-xl p-2.5 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all cursor-pointer"
                >
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span>Exam War Room</span>
                </button>
                <button
                  onClick={() => navigateTo("resources")}
                  className="flex items-center gap-2 rounded-xl p-2.5 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all cursor-pointer"
                >
                  <FolderDown className="h-4 w-4 text-blue-400" />
                  <span>Notes & Papers</span>
                </button>
                <button
                  onClick={() => navigateTo("discussion")}
                  className="flex items-center gap-2 rounded-xl p-2.5 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 text-pink-400" />
                  <span>Peer Forum</span>
                </button>
              </div>
            </div>
          )}

          {/* Courses */}
          {filteredCourses.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Courses</div>
              <div className="space-y-1">
                {filteredCourses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigateTo("courses")}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-indigo-400">{c.code}</span>
                      <span className="text-slate-200">{c.name}</span>
                    </div>
                    <span className="text-slate-400">{c.instructor}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {filteredResources.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Notes & Cheatsheets</div>
              <div className="space-y-1">
                {filteredResources.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigateTo("resources")}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderDown className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="font-medium text-slate-200 truncate">{r.title}</span>
                    </div>
                    <span className="text-slate-400 shrink-0 pl-2">+{r.upvotes} upvotes</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deadlines */}
          {filteredDeadlines.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Deadlines</div>
              <div className="space-y-1">
                {filteredDeadlines.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigateTo("deadlines")}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-200 truncate">{d.title}</span>
                    </div>
                    <span className="text-amber-400 shrink-0 pl-2">{d.courseCode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flashcards */}
          {filteredDecks.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Flashcard Decks</div>
              <div className="space-y-1">
                {filteredDecks.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => navigateTo("flashcards")}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Layers className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span className="text-slate-200 truncate">{deck.title}</span>
                    </div>
                    <span className="text-slate-400 shrink-0 pl-2">{deck.cards.length} cards</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/50 px-4 py-2 text-[11px] text-slate-400">
          <span>Press ESC or click outside to dismiss</span>
          <span>Tip: Use Cmd+K anytime</span>
        </div>
      </div>
    </div>
  );
}
