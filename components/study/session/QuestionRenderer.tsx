"use client";

import { useState } from "react";
import type { Question } from "@/lib/question-bank";
import type { EvaluationResult } from "@/lib/study-attempts";
import { AnswerFeedback } from "./AnswerFeedback";

export function QuestionRenderer({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  isAnswered,
  result,
  onNext,
  nextLabel,
}: {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string | number) => void;
  isAnswered: boolean;
  result?: EvaluationResult;
  onNext: () => void;
  nextLabel?: string;
}) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    onAnswer(opt);
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !textInput.trim()) return;
    onAnswer(textInput.trim());
  };

  return (
    <div className="question-card" data-question-id={question.id}>
      <div className="question-meta">
        <span className="mono">
          QUESTION {String(questionNumber).padStart(2, "0")} / {String(totalQuestions).padStart(2, "0")}
        </span>
        <span className={`difficulty-badge diff-${question.difficulty}`}>
          {question.difficulty.toUpperCase()}
        </span>
      </div>

      <h3 className="question-prompt">{question.prompt}</h3>

      {/* MCQ / True-False Rendering */}
      {(question.type === "mcq" || question.type === "true_false") && (
        <div
          className={`options-grid ${question.type === "true_false" ? "options-binary" : ""}`}
          role="radiogroup"
          aria-label="Answer options"
        >
          {question.options?.map((opt, i) => {
            const isSelected = selectedOption === opt;
            const letter = String.fromCharCode(65 + i);

            let statusClass = "";
            if (isAnswered) {
              if (opt.toLowerCase() === String(question.answer).toLowerCase()) {
                statusClass = "option-correct";
              } else if (isSelected) {
                statusClass = "option-incorrect";
              }
            } else if (isSelected) {
              statusClass = "option-selected";
            }

            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isAnswered}
                className={`question-option ${statusClass}`}
                onClick={() => handleSelectOption(opt)}
              >
                <span className="option-letter" aria-hidden="true">
                  {question.type === "true_false" ? (i === 0 ? "T" : "F") : letter}
                </span>
                <span className="option-text">{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Text / Numeric / Fill-in-Blank Rendering */}
      {(question.type === "fill_blank" ||
        question.type === "short_answer" ||
        question.type === "numeric") && (
        <form className="question-text-form" onSubmit={handleTextSubmit}>
          <label htmlFor={`input-${question.id}`} className="sr-only">
            Your answer
          </label>
          <div className="input-row">
            <input
              id={`input-${question.id}`}
              type={question.type === "numeric" ? "number" : "text"}
              step={question.type === "numeric" ? "any" : undefined}
              placeholder={
                question.type === "numeric"
                  ? "Enter numerical answer..."
                  : "Type your answer..."
              }
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isAnswered}
              className="text-input"
              autoComplete="off"
              autoFocus
            />
            {!isAnswered && (
              <button
                type="submit"
                className="action check-btn"
                disabled={!textInput.trim()}
              >
                CHECK
              </button>
            )}
          </div>
        </form>
      )}

      {/* Feedback banner */}
      {isAnswered && result && (
        <AnswerFeedback
          correct={result.correct}
          explanation={question.explanation}
          correctAnswer={question.answer}
          onNext={onNext}
          nextLabel={nextLabel}
        />
      )}
    </div>
  );
}
