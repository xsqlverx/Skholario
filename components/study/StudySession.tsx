"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Subject } from "@/lib/curriculum";
import { firstIncomplete } from "@/lib/study-progress";
import { getLearningContent } from "@/lib/learning-content";
import {
  getQuestionsForTopic,
  getWarmupQuestions,
  getRecallQuestions,
  getPracticeQuestions,
  type Question,
} from "@/lib/question-bank";
import {
  calculateTopicMastery,
  type EvaluationResult,
  type QuestionAttempt,
} from "@/lib/study-attempts";
import {
  initSessionState,
  loadActiveSession,
  saveActiveSession,
  clearActiveSession,
  type SessionMode,
  type SessionState,
} from "@/lib/study-session-state";
import { useCurriculum } from "@/lib/curriculum-store";
import { useProgress } from "./StudyState";
import { Eyebrow } from "./Primitives";
import { SessionProgressHeader } from "./session/SessionProgressHeader";
import { SessionIntro } from "./session/SessionIntro";
import { WarmUpStage } from "./session/WarmUpStage";
import { LearnStage } from "./session/LearnStage";
import { RecallStage } from "./session/RecallStage";
import { PracticeStage } from "./session/PracticeStage";
import { SessionReview } from "./session/SessionReview";

export function StudySession({
  subject: initialSubject,
  topicId,
}: {
  subject: Subject;
  topicId?: string;
}) {
  const { findSubject: findInCurriculum, ready: curriculumReady } = useCurriculum();
  const subject = curriculumReady
    ? findInCurriculum(initialSubject.id) || initialSubject
    : initialSubject;
  const {
    completed,
    complete,
    ready,
    recommendation,
    examDates,
    attempts: allAttempts,
    recordAttempts,
  } = useProgress();

  const topics = subject.units.flatMap((unit) => unit.topics);
  const requested = topics.find((t) => t.id === topicId);
  const topic = requested ?? firstIncomplete(subject, completed)?.topic;
  const unit = subject.units.find((u) =>
    u.topics.some((item) => item.id === topic?.id),
  );
  const unitNumber = unit
    ? String(subject.units.indexOf(unit) + 1).padStart(2, "0")
    : "";

  const [sessionState, setSessionState] = useState<SessionState>(() => {
    const initialId = topic?.id ?? "";
    if (typeof window !== "undefined" && initialId) {
      const saved = loadActiveSession(initialId);
      if (saved && saved.topicId === initialId) {
        return saved;
      }
    }
    return initSessionState(initialId, subject.id, "guided");
  });

  const [activeTopicId, setActiveTopicId] = useState<string | null>(topic?.id ?? null);

  if (topic && topic.id !== activeTopicId) {
    setActiveTopicId(topic.id);
    const saved = typeof window !== "undefined" ? loadActiveSession(topic.id) : null;
    setSessionState(
      saved && saved.topicId === topic.id
        ? saved
        : initSessionState(topic.id, subject.id, "guided"),
    );
  }

  // Persist session state changes to localStorage
  useEffect(() => {
    if (sessionState && sessionState.topicId) {
      saveActiveSession(sessionState);
    }
  }, [sessionState]);

  if (!ready || !topic) {
    return (
      <>
        <Link className="back-link" href={`/subjects/${subject.id}`}>
          <ArrowLeft size={18} />
          Back to {subject.short}
        </Link>
        <section className="session-stage" aria-busy="true">
          <Eyebrow>READING YOUR STUDY RECORD</Eyebrow>
          <div className="session-rule" />
          <p className="session-subject">{subject.short}</p>
          <h1>Finding your place.</h1>
          <p className="session-description">
            Reading your saved progress on this device…
          </p>
        </section>
      </>
    );
  }

  const isComplete = completed.includes(topic.id);
  const examDate = examDates[subject.id];
  const learningContent = getLearningContent(topic.id);
  const allTopicQuestions = getQuestionsForTopic(topic.id);
  const warmupQuestions = getWarmupQuestions(topic.id);
  const recallQuestions = getRecallQuestions(topic.id);
  const practiceQuestions = getPracticeQuestions(topic.id);

  const currentState = sessionState ?? initSessionState(topic.id, subject.id, "guided");
  const mastery = calculateTopicMastery(topic.id, isComplete, allAttempts);

  // Transition handlers
  const handleStart = (mode: SessionMode) => {
    if (mode === "practice_only") {
      setSessionState({
        ...currentState,
        mode: "practice_only",
        stage: "practice",
        practiceIndex: 0,
      });
    } else {
      // Guided mode: if warm-up questions exist, start with warm-up; otherwise go straight to learn
      const hasWarmup = warmupQuestions.length > 0;
      setSessionState({
        ...currentState,
        mode: "guided",
        stage: hasWarmup ? "warmup" : "learn",
        warmupIndex: 0,
      });
    }
  };

  const handleRecordAttempt = (
    question: Question,
    userAnswer: string | number,
    result: EvaluationResult,
  ) => {
    const attempt: QuestionAttempt = {
      id: `${question.id}-${Date.now()}`,
      questionId: question.id,
      topicId: topic.id,
      mode:
        currentState.stage === "warmup"
          ? "warmup"
          : currentState.stage === "recall"
            ? "recall"
            : "practice",
      prompt: question.prompt,
      userAnswer: String(userAnswer),
      correctAnswer: String(question.answer),
      correct: result.correct,
      timestamp: new Date().toISOString(),
    };

    setSessionState((prev) => {
      const current = prev ?? currentState;
      return {
        ...current,
        attempts: [...current.attempts, attempt],
      };
    });

    recordAttempts([attempt]);
  };

  const handleRetest = (missedQuestionIds: string[]) => {
    setSessionState((prev) => {
      const current = prev ?? currentState;
      return {
        ...current,
        stage: "practice",
        isRetesting: true,
        retestQuestionIds: missedQuestionIds,
        practiceIndex: 0,
      };
    });
  };

  const handleCompleteTopic = () => {
    complete(topic.id);
    clearActiveSession(topic.id);
  };

  // Determine questions for current practice stage (normal or retest)
  const activePracticeQuestions = currentState.isRetesting && currentState.retestQuestionIds
    ? allTopicQuestions.filter((q) =>
        currentState.retestQuestionIds?.includes(q.id),
      )
    : practiceQuestions;

  return (
    <div className="study-engine-shell">
      <SessionProgressHeader
        subject={subject}
        currentStage={currentState.stage}
        mode={currentState.mode}
        onExit={() => {
          clearActiveSession(topic.id);
        }}
      />

      <section
        className={`session-stage stage-${currentState.stage} ${currentState.stage === "review" ? "session-done" : ""}`}
      >
        {currentState.stage === "intro" && (
          <SessionIntro
            subject={subject}
            unit={unit}
            topic={topic}
            unitNumber={unitNumber}
            isComplete={isComplete}
            examDate={examDate}
            mastery={mastery}
            onStart={handleStart}
          />
        )}

        {currentState.stage === "warmup" && (
          <WarmUpStage
            questions={warmupQuestions}
            currentIndex={currentState.warmupIndex}
            onRecordAttempt={handleRecordAttempt}
            onNextQuestion={() => {
              setSessionState((prev) => ({
                ...(prev ?? currentState),
                warmupIndex: (prev?.warmupIndex ?? 0) + 1,
              }));
            }}
            onCompleteStage={() => {
              setSessionState((prev) => ({
                ...(prev ?? currentState),
                stage: "learn",
                learnIndex: 0,
              }));
            }}
          />
        )}

        {currentState.stage === "learn" && (
          <LearnStage
            content={learningContent}
            currentSectionIndex={currentState.learnIndex}
            onNextSection={() => {
              setSessionState((prev) => ({
                ...(prev ?? currentState),
                learnIndex: (prev?.learnIndex ?? 0) + 1,
              }));
            }}
            onCompleteLearn={() => {
              // If recall questions exist, go to recall; otherwise proceed to practice
              const hasRecall = recallQuestions.length > 0;
              setSessionState((prev) => ({
                ...(prev ?? currentState),
                stage: hasRecall ? "recall" : "practice",
                recallIndex: 0,
                practiceIndex: 0,
              }));
            }}
          />
        )}

        {currentState.stage === "recall" && (
          <RecallStage
            questions={recallQuestions}
            currentIndex={currentState.recallIndex}
            onRecordAttempt={handleRecordAttempt}
            onNextQuestion={() => {
              setSessionState((prev) => ({
                ...(prev ?? currentState),
                recallIndex: (prev?.recallIndex ?? 0) + 1,
              }));
            }}
            onCompleteStage={() => {
              setSessionState((prev) => ({
                ...(prev ?? currentState),
                stage: "practice",
                practiceIndex: 0,
              }));
            }}
          />
        )}

        {currentState.stage === "practice" && (
          <PracticeStage
            questions={activePracticeQuestions}
            currentIndex={currentState.practiceIndex}
            isRetesting={currentState.isRetesting}
            onRecordAttempt={handleRecordAttempt}
            onNextQuestion={() => {
              setSessionState((prev) => ({
                ...(prev ?? currentState),
                practiceIndex: (prev?.practiceIndex ?? 0) + 1,
              }));
            }}
            onCompleteStage={() => {
              setSessionState((prev) => ({
                ...(prev ?? currentState),
                stage: "review",
              }));
            }}
          />
        )}

        {currentState.stage === "review" && (
          <SessionReview
            subject={subject}
            unit={unit}
            topic={topic}
            unitNumber={unitNumber}
            sessionAttempts={currentState.attempts}
            allAttempts={allAttempts}
            questions={allTopicQuestions}
            isComplete={isComplete}
            onMarkComplete={handleCompleteTopic}
            onRetest={handleRetest}
            nextRecommendation={recommendation}
          />
        )}
      </section>

      <Link className="session-exit text-link" href="/">
        Back to today
        <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}
