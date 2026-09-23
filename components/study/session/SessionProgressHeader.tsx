"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Subject } from "@/lib/curriculum";
import type { SessionStage, SessionMode } from "@/lib/study-session-state";

const STAGES: { id: SessionStage; label: string }[] = [
  { id: "intro", label: "Intro" },
  { id: "warmup", label: "Warm Up" },
  { id: "learn", label: "Learn" },
  { id: "recall", label: "Recall" },
  { id: "practice", label: "Practice" },
  { id: "review", label: "Review" },
];

export function SessionProgressHeader({
  subject,
  currentStage,
  mode,
  onExit,
}: {
  subject: Subject;
  currentStage: SessionStage;
  mode: SessionMode;
  onExit?: () => void;
}) {
  const visibleStages =
    mode === "practice_only"
      ? STAGES.filter((s) => s.id === "practice" || s.id === "review")
      : STAGES;

  const currentIndex = visibleStages.findIndex((s) => s.id === currentStage);

  return (
    <header className="session-progress-header">
      <Link
        className="back-link"
        href={`/subjects/${subject.id}`}
        onClick={(e) => {
          if (onExit && currentStage !== "intro" && currentStage !== "review") {
            const confirmed = window.confirm(
              "Leave session? Your progress in this session has been saved.",
            );
            if (!confirmed) {
              e.preventDefault();
              return;
            }
            onExit();
          }
        }}
      >
        <ArrowLeft size={18} />
        Back to {subject.short}
      </Link>

      <nav
        className="stage-stepper"
        aria-label="Study session progress"
        role="tablist"
      >
        {visibleStages.map((stage, idx) => {
          const isCurrent = stage.id === currentStage;
          const isPassed = idx < currentIndex;

          return (
            <span
              key={stage.id}
              className={`stage-pill ${isCurrent ? "current" : ""} ${isPassed ? "passed" : ""}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="stage-num">0{idx + 1}</span>
              <span className="stage-text">{stage.label}</span>
            </span>
          );
        })}
      </nav>
    </header>
  );
}
