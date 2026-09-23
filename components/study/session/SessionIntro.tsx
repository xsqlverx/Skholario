"use client";

import { Play, Sparkles, Clock3, CheckCircle2 } from "lucide-react";
import type { Subject, Topic, Unit } from "@/lib/curriculum";
import type { TopicMastery } from "@/lib/study-attempts";
import { formatExamDate } from "@/lib/study-progress";
import { Eyebrow } from "../Primitives";

const MASTERY_LABELS: Record<TopicMastery, { label: string; class: string }> = {
  not_started: { label: "NOT STARTED", class: "mastery-none" },
  exposed: { label: "EXPOSED", class: "mastery-exposed" },
  practicing: { label: "PRACTICING", class: "mastery-practicing" },
  familiar: { label: "FAMILIAR", class: "mastery-familiar" },
  strong: { label: "STRONG", class: "mastery-strong" },
};

export function SessionIntro({
  subject,
  unit,
  topic,
  unitNumber,
  isComplete,
  examDate,
  mastery,
  onStart,
}: {
  subject: Subject;
  unit?: Unit;
  topic: Topic;
  unitNumber: string;
  isComplete: boolean;
  examDate?: string;
  mastery: TopicMastery;
  onStart: (mode: "guided" | "practice_only") => void;
}) {
  const masteryInfo = MASTERY_LABELS[mastery];

  return (
    <div className="session-intro">
      <div className="intro-header">
        <Eyebrow>{subject.code} / {subject.short.toUpperCase()}</Eyebrow>
        {unit && (
          <p className="session-unit-tag">
            UNIT {unitNumber} · {unit.title}
          </p>
        )}
        <h1 className="intro-title">{topic.title}</h1>
        <div className="intro-meta-row">
          <span className={`mastery-badge ${masteryInfo.class}`}>
            {masteryInfo.label}
          </span>
          <span className="session-duration">
            <Clock3 size={16} aria-hidden="true" />
            {topic.minutes} min estimated
          </span>
          {isComplete && (
            <span className="complete-indicator">
              <CheckCircle2 size={16} aria-hidden="true" />
              Completed
            </span>
          )}
        </div>
      </div>

      <div className="intro-card">
        <h3>Why this topic today</h3>
        <p>
          {examDate
            ? `Your ${subject.short} exam is scheduled for ${formatExamDate(examDate)}. Mastering this foundational concept builds essential exam confidence.`
            : `This is your next sequential topic in the curriculum. Taking it one topic at a time builds sustainable understanding.`}
        </p>
      </div>

      <div className="intro-actions-card">
        <div className="guided-flow-preview">
          <h4>Guided Session Flow</h4>
          <ol className="flow-steps">
            <li>
              <strong>Warm Up</strong>
              <span>Recall prior knowledge</span>
            </li>
            <li>
              <strong>Learn</strong>
              <span>Study key concepts</span>
            </li>
            <li>
              <strong>Recall</strong>
              <span>Test memory without notes</span>
            </li>
            <li>
              <strong>Practice</strong>
              <span>Solve application problems</span>
            </li>
            <li>
              <strong>Review</strong>
              <span>See weak spots & score</span>
            </li>
          </ol>
        </div>

        <div className="intro-buttons">
          <button
            type="button"
            className="action primary-start-btn"
            onClick={() => onStart("guided")}
          >
            <Play size={20} aria-hidden="true" />
            START GUIDED SESSION
          </button>

          <button
            type="button"
            className="text-link practice-only-btn"
            onClick={() => onStart("practice_only")}
          >
            <Sparkles size={18} aria-hidden="true" />
            PRACTICE THIS TOPIC (QUIZ ONLY)
          </button>
        </div>
      </div>
    </div>
  );
}
