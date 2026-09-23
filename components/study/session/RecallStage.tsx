"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import type { Question } from "@/lib/question-bank";
import type { EvaluationResult } from "@/lib/study-attempts";
import { evaluateAnswer } from "@/lib/study-attempts";
import { Eyebrow } from "../Primitives";
import { QuestionRenderer } from "./QuestionRenderer";

export function RecallStage({
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
        <p>No recall questions for this topic.</p>
        <button type="button" className="action" onClick={onCompleteStage}>
          Continue to Practice
        </button>
      </div>
    );
  }

  return (
    <div className="recall-stage">
      <div className="stage-header">
        <div className="closed-notes-banner">
          <Lock size={15} aria-hidden="true" />
          <span>NOTES CLOSED · RETRIEVAL PRACTICE</span>
        </div>
        <Eyebrow>STAGE 03 / RECALL</Eyebrow>
        <h2>Retrieve what you just learned.</h2>
        <p className="stage-caption">
          Retrieval from memory builds strong neural pathways. Test what stuck.
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
        nextLabel={isLast ? "Proceed to Practice" : "Next Retrieval Question"}
      />
    </div>
  );
}
