"use client";

import { useState } from "react";
import type { Question } from "@/lib/question-bank";
import type { EvaluationResult } from "@/lib/study-attempts";
import { evaluateAnswer } from "@/lib/study-attempts";
import { Eyebrow } from "../Primitives";
import { QuestionRenderer } from "./QuestionRenderer";

export function PracticeStage({
  questions,
  currentIndex,
  isRetesting = false,
  onRecordAttempt,
  onNextQuestion,
  onCompleteStage,
}: {
  questions: Question[];
  currentIndex: number;
  isRetesting?: boolean;
  onRecordAttempt: (question: Question, answer: string | number, result: EvaluationResult) => void;
  onNextQuestion: () => void;
  onCompleteStage: () => void;
}) {
  const [currentResult, setCurrentResult] = useState<EvaluationResult | null>(null);
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex >= questions.length - 1;

  const handleAnswer = (rawAnswer: string | number) => {
    if (!currentQuestion) return;
    const result = evaluateAnswer(currentQuestion, rawAnswer);
    setCurrentResult(result);
    onRecordAttempt(currentQuestion, rawAnswer, result);
  };

  const handleNext = () => {
    setCurrentResult(null);
    if (isLast) {
      onCompleteStage();
    } else {
      onNextQuestion();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="stage-empty">
        <p>No practice questions remaining.</p>
        <button type="button" className="action" onClick={onCompleteStage}>
          View Review
        </button>
      </div>
    );
  }

  return (
    <div className="practice-stage">
      <div className="stage-header">
        <Eyebrow>
          {isRetesting ? "RETEST / TARGETED PRACTICE" : "STAGE 04 / PRACTICE"}
        </Eyebrow>
        <h2>{isRetesting ? "Master what tripped you up." : "Apply the concept."}</h2>
        <p className="stage-caption">
          {isRetesting
            ? "Re-evaluating missed concepts solidifies long-term retention."
            : "Solve real exam problems step by step to build analytical fluency."}
        </p>
      </div>

      <QuestionRenderer
        key={currentQuestion.id}
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
        isAnswered={currentResult !== null}
        result={currentResult ?? undefined}
        onNext={handleNext}
        nextLabel={isLast ? "See Session Review" : "Next Problem"}
      />
    </div>
  );
}
