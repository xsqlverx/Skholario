"use client";

import React, { useState } from "react";
import { useStudyHub } from "@/lib/store";
import { Layers, ChevronLeft, ChevronRight, CheckCircle2, RotateCw, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { fireCelebrationConfetti } from "@/lib/confetti";
import { playSuccessChime, playTickSound } from "@/lib/audio";

export function FlashcardsTab() {
  const { decks, toggleCardMastered } = useStudyHub();
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || "deck-os");
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const currentDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];
  const cards = currentDeck?.cards || [];
  const currentCard = cards[cardIndex] || cards[0];

  const masteredCount = cards.filter((c) => c.mastered).length;
  const progressPercent = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

  const handleNext = () => {
    setIsFlipped(false);
    playTickSound();
    setCardIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    playTickSound();
    setCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const toggleFlip = () => {
    playTickSound();
    setIsFlipped(!isFlipped);
  };

  const handleToggleMastered = () => {
    if (!currentCard) return;
    toggleCardMastered(currentDeck.id, currentCard.id);
    if (!currentCard.mastered) {
      playSuccessChime();
      fireCelebrationConfetti();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Quick Cram & Spaced Repetition</h1>
          <p className="text-xs text-slate-400 mt-1">
            Rapid-fire flashcards with instant flip & mastery tracking for exam cramming.
          </p>
        </div>

        {/* Deck Select Dropdown / Pills */}
        <div className="flex items-center gap-2">
          {decks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => {
                setSelectedDeckId(deck.id);
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className={cn(
                "rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                selectedDeckId === deck.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              )}
            >
              {deck.courseCode}: {deck.title.split("&")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-white">Deck Mastery</span>
          <span className="font-mono text-indigo-400">
            {masteredCount} of {cards.length} Mastered ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard Container */}
      {currentCard && (
        <div className="flex flex-col items-center">
          {/* Card Box */}
          <div
            onClick={toggleFlip}
            className={cn(
              "relative w-full max-w-2xl min-h-[320px] cursor-pointer rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 shadow-2xl backdrop-blur-md",
              isFlipped
                ? "border-indigo-500/50 bg-gradient-to-b from-indigo-950/60 to-slate-900"
                : "border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 hover:border-slate-700"
            )}
          >
            {/* Top Info */}
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                {currentCard.topic}
              </span>

              <span className="text-xs text-slate-400 font-mono">
                Card {cardIndex + 1} of {cards.length}
              </span>
            </div>

            {/* Card Content (Question / Answer) */}
            <div className="my-8 text-center px-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                {isFlipped ? "Answer" : "Question (Click to flip)"}
              </span>
              <p className="text-lg md:text-xl font-extrabold text-white leading-relaxed whitespace-pre-line">
                {isFlipped ? currentCard.answer : currentCard.question}
              </p>
            </div>

            {/* Bottom Card Controls */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <RotateCw className="h-3.5 w-3.5 text-indigo-400" />
                <span>Click card to reveal</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMastered();
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer",
                  currentCard.mastered
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{currentCard.mastered ? "Mastered ✨" : "Mark Mastered"}</span>
              </button>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={toggleFlip}
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
            >
              {isFlipped ? "Show Question" : "Show Answer"}
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
