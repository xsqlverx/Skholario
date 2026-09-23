"use client";

import { Check, X, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function AnswerFeedback({
  correct,
  explanation,
  correctAnswer,
  onNext,
  nextLabel = "Next Question",
}: {
  correct: boolean;
  explanation: string;
  correctAnswer?: string | number;
  onNext: () => void;
  nextLabel?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`answer-feedback ${correct ? "feedback-correct" : "feedback-incorrect"}`}
      role="status"
      aria-live="polite"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 450, damping: 28 }}
    >
      <div className="feedback-header">
        <span className="feedback-icon" aria-hidden="true">
          {correct ? <Check size={20} strokeWidth={2.5} /> : <X size={20} strokeWidth={2.5} />}
        </span>
        <strong>{correct ? "Correct!" : "Not quite."}</strong>
      </div>

      {!correct && correctAnswer !== undefined && (
        <p className="correct-answer-line">
          Expected answer: <strong>{String(correctAnswer)}</strong>
        </p>
      )}

      <p className="feedback-explanation">{explanation}</p>

      <div className="feedback-actions">
        <button
          type="button"
          className="action feedback-next-btn"
          onClick={onNext}
          autoFocus
        >
          {nextLabel}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}
