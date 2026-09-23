"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  RotateCcw,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";
import type { Subject, Topic, Unit } from "@/lib/curriculum";
import type { Question } from "@/lib/question-bank";
import type { QuestionAttempt, WeaknessRecord } from "@/lib/study-attempts";
import {
  detectWeaknesses,
  calculateTopicMastery,
} from "@/lib/study-attempts";
import type { Recommendation } from "@/lib/study-progress";
import { formatExamDate } from "@/lib/study-progress";
import { Eyebrow } from "../Primitives";

function fireCelebration() {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.6 },
    colors: ["#ee482f", "#24251f", "#d7e2c8", "#b7ae75", "#f5f3eb"],
    ticks: 120,
    scalar: 0.85,
  });
}

export function SessionReview({
  subject,
  unit,
  topic,
  unitNumber,
  sessionAttempts,
  allAttempts,
  questions,
  isComplete,
  onMarkComplete,
  onRetest,
  nextRecommendation,
}: {
  subject: Subject;
  unit?: Unit;
  topic: Topic;
  unitNumber: string;
  sessionAttempts: QuestionAttempt[];
  allAttempts: QuestionAttempt[];
  questions: Question[];
  isComplete: boolean;
  onMarkComplete: () => void;
  onRetest: (missedQuestionIds: string[]) => void;
  nextRecommendation?: Recommendation | null;
}) {
  const celebratedRef = useRef(false);

  useEffect(() => {
    if (!celebratedRef.current) {
      celebratedRef.current = true;
      fireCelebration();
      if (!isComplete) {
        onMarkComplete();
      }
    }
  }, [isComplete, onMarkComplete]);

  // Aggregate real session statistics
  const total = sessionAttempts.length;
  const correct = sessionAttempts.filter((a) => a.correct).length;
  const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : 100;

  const recallAttempts = sessionAttempts.filter((a) => a.mode === "recall");
  const recallCorrect = recallAttempts.filter((a) => a.correct).length;
  const recallPct =
    recallAttempts.length > 0
      ? Math.round((recallCorrect / recallAttempts.length) * 100)
      : 100;

  const practiceAttempts = sessionAttempts.filter((a) => a.mode === "practice");
  const practiceCorrect = practiceAttempts.filter((a) => a.correct).length;
  const practicePct =
    practiceAttempts.length > 0
      ? Math.round((practiceCorrect / practiceAttempts.length) * 100)
      : 100;

  // Real weakness detection based on actual mistakes
  const weaknesses: WeaknessRecord[] = detectWeaknesses(sessionAttempts, questions);
  const mastery = calculateTopicMastery(topic.id, true, allAttempts);

  return (
    <div className="session-review">
      <div className="review-header">
        <Eyebrow>SESSION COMPLETE / {subject.short.toUpperCase()}</Eyebrow>
        <h2>{topic.title}</h2>
        {unit && (
          <p className="session-unit-tag">
            UNIT {unitNumber} · {unit.title}
          </p>
        )}
      </div>

      {/* Main Score Card */}
      <div className="review-scorecard">
        <div className="scorecard-top">
          <div className="overall-score">
            <span className="score-num">
              {correct} / {total}
            </span>
            <span className="score-label">QUESTIONS CORRECT ({accuracyPct}%)</span>
          </div>
          <div className="mastery-status-box">
            <span className="mono">NEW MASTERY</span>
            <strong className="mastery-level-tag">
              <Award size={16} aria-hidden="true" />
              {mastery.toUpperCase()}
            </strong>
          </div>
        </div>

        {/* Section Breakdown Meters */}
        <div className="breakdown-meters">
          {recallAttempts.length > 0 && (
            <div className="meter-row">
              <div className="meter-label">
                <span>RECALL</span>
                <strong>
                  {recallCorrect}/{recallAttempts.length} ({recallPct}%)
                </strong>
              </div>
              <div className="meter-bar">
                <div
                  className="meter-fill"
                  style={{ width: `${recallPct}%` }}
                />
              </div>
            </div>
          )}

          {practiceAttempts.length > 0 && (
            <div className="meter-row">
              <div className="meter-label">
                <span>PRACTICE</span>
                <strong>
                  {practiceCorrect}/{practiceAttempts.length} ({practicePct}%)
                </strong>
              </div>
              <div className="meter-bar">
                <div
                  className="meter-fill"
                  style={{ width: `${practicePct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weakness Detection: Needs Another Look */}
      <div className="weakness-section">
        {weaknesses.length > 0 ? (
          <div className="weakness-card">
            <div className="weakness-title">
              <AlertTriangle size={20} aria-hidden="true" />
              <div>
                <h3>Needs another look</h3>
                <p>
                  You missed {weaknesses.length} question
                  {weaknesses.length > 1 ? "s" : ""} during this session.
                  Reviewing them now locks in retention.
                </p>
              </div>
            </div>

            <ul className="weakness-list">
              {weaknesses.map((w) => (
                <li key={w.questionId} className="weakness-item">
                  <p className="weakness-prompt">
                    <strong>Q:</strong> {w.prompt}
                  </p>
                  {w.userAnswer && (
                    <p className="weakness-answer">
                      <span>Your answer:</span>{" "}
                      <span className="strike">{w.userAnswer}</span>
                    </p>
                  )}
                  <p className="weakness-expected">
                    <span>Correct:</span> <strong>{w.correctAnswer}</strong>
                  </p>
                  <p className="weakness-explanation">{w.explanation}</p>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="action retest-btn"
              onClick={() => onRetest(weaknesses.map((w) => w.questionId))}
            >
              <RotateCcw size={18} aria-hidden="true" />
              RETEST WEAK AREAS ({weaknesses.length})
            </button>
          </div>
        ) : (
          <div className="clean-mastery-card">
            <CheckCircle size={24} aria-hidden="true" />
            <div>
              <h3>Strong grasp demonstrated</h3>
              <p>
                Zero missed questions in this session. You have firmly
                established the core concepts of this topic.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Next Step / Recommendation */}
      <div className="review-next-section">
        <Eyebrow>WHAT COMES NEXT</Eyebrow>
        {nextRecommendation ? (
          <div className="next-card">
            <div>
              <span className="mono">
                NEXT UP / {nextRecommendation.subject.short}
              </span>
              <h3>{nextRecommendation.topic.title}</h3>
              <p>
                {nextRecommendation.unit.title} · {nextRecommendation.topic.minutes} min
                {nextRecommendation.examDate
                  ? ` · Exam ${formatExamDate(nextRecommendation.examDate)}`
                  : ""}
              </p>
            </div>
            <Link
              href={`/study/${nextRecommendation.subject.id}?topic=${nextRecommendation.topic.id}`}
              className="action next-topic-btn"
            >
              STUDY NEXT TOPIC
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="next-card">
            <div>
              <h3>All topics complete!</h3>
              <p>
                You’ve worked through every topic in the syllabus. Return to the
                subjects catalog to review whenever you like.
              </p>
            </div>
            <Link href="/subjects" className="action next-topic-btn">
              EXPLORE ALL SUBJECTS
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
