"use client";

import { useState } from "react";
import type { Question } from "@/lib/question-bank";
import type { EvaluationResult } from "@/lib/study-attempts";
import { evaluateAnswer } from "@/lib/study-attempts";
import { Eyebrow } from "../Primitives";
import { QuestionRenderer } from "./QuestionRenderer";

export function WarmUpStage({
  questions,
  currentIndex,
  onRecordAttempt,
  onNextQuestion,
  onCompleteStage,
}: {
  questions: Question[];
  currentIndex: number;
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
        <p>No warm-up questions for this topic.</p>
        <button type="button" className="action" onClick={onCompleteStage}>
          Continue to Learn
        </button>
      </div>
    );
  }

  return (
    <div className="warmup-stage">
      <div className="stage-header">
        <Eyebrow>STAGE 01 / WARM UP</Eyebrow>
        <h2>Activate your memory.</h2>
        <p className="stage-caption">
          A quick recall check to prime your brain before we dive into the material.
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
        nextLabel={isLast ? "Continue to Learn" : "Next Prompt"}
      />
    </div>
  );
}
