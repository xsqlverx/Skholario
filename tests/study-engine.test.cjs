/* eslint-disable @typescript-eslint/no-require-imports -- Node's test runner loads TypeScript via transpileModule */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  module._compile(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    filename,
  );
};

const {
  getQuestionsForTopic,
  getWarmupQuestions,
  getRecallQuestions,
  getPracticeQuestions,
} = require("../lib/question-bank.ts");
const { getLearningContent } = require("../lib/learning-content.ts");
const {
  evaluateAnswer,
  detectWeaknesses,
  calculateTopicMastery,
} = require("../lib/study-attempts.ts");
const {
  emptyProgress,
  recordAttempts,
  decodeProgress,
} = require("../lib/study-progress.ts");
const {
  initSessionState,
} = require("../lib/study-session-state.ts");

test("question bank provides warmup, recall, and practice questions for curated topics", () => {
  const mathQuestions = getQuestionsForTopic("math-1-1");
  assert.ok(mathQuestions.length >= 5, "math-1-1 should have multiple questions");

  const warmup = getWarmupQuestions("math-1-1");
  const recall = getRecallQuestions("math-1-1");
  const practice = getPracticeQuestions("math-1-1");

  assert.ok(warmup.length >= 1, "Should have at least 1 warm up question");
  assert.ok(recall.length >= 1, "Should have at least 1 recall question");
  assert.ok(practice.length >= 2, "Should have at least 2 practice questions");

  for (const q of mathQuestions) {
    assert.ok(q.id, "Question must have an ID");
    assert.ok(q.prompt, "Question must have a prompt");
    assert.ok(q.explanation, "Question must have an explanation");
    assert.ok(["easy", "medium", "hard"].includes(q.difficulty));
  }
});

test("question bank synthesizes questions for uncurated curriculum topics", () => {
  const questions = getQuestionsForTopic("math-5-2");
  assert.ok(questions.length >= 3, "Synthesizes structured questions");
  assert.ok(questions.some((q) => q.stage === "warmup"));
  assert.ok(questions.some((q) => q.stage === "recall"));
  assert.ok(questions.some((q) => q.stage === "practice"));
});

test("learning content returns progressive sections for curated and uncurated topics", () => {
  const curated = getLearningContent("math-1-1");
  assert.equal(curated.topicId, "math-1-1");
  assert.ok(curated.sections.length >= 2);
  assert.ok(curated.sections[0].title.includes("01"));
  assert.ok(curated.sections[0].keyPoints.length > 0);

  const fallback = getLearningContent("math-5-1");
  assert.equal(fallback.topicId, "math-5-1");
  assert.ok(fallback.sections.length >= 2);
});

test("answer evaluation handles MCQ and True/False with case-insensitivity", () => {
  const mcq = {
    id: "test-mcq",
    topicId: "test",
    type: "mcq",
    prompt: "Pick A",
    options: ["Option A", "Option B"],
    answer: "Option A",
    explanation: "Because A.",
    difficulty: "easy",
    stage: "warmup",
  };

  assert.equal(evaluateAnswer(mcq, "Option A").correct, true);
  assert.equal(evaluateAnswer(mcq, "option a").correct, true);
  assert.equal(evaluateAnswer(mcq, "Option B").correct, false);
});

test("answer evaluation handles numeric questions with floating point tolerance", () => {
  const numQ = {
    id: "test-num",
    topicId: "test",
    type: "numeric",
    prompt: "What is 8?",
    answer: 8,
    explanation: "8.",
    difficulty: "easy",
    stage: "practice",
  };

  assert.equal(evaluateAnswer(numQ, 8).correct, true);
  assert.equal(evaluateAnswer(numQ, "8.00").correct, true);
  assert.equal(evaluateAnswer(numQ, "8.02").correct, true);
  assert.equal(evaluateAnswer(numQ, "8.2").correct, false);
});

test("answer evaluation handles fill in blank and short answer text normalization", () => {
  const fillQ = {
    id: "test-fill",
    topicId: "test",
    type: "fill_blank",
    prompt: "Enter displacement",
    answer: "displacement",
    explanation: "displacement.",
    difficulty: "medium",
    stage: "recall",
  };

  assert.equal(evaluateAnswer(fillQ, "displacement").correct, true);
  assert.equal(evaluateAnswer(fillQ, "Displacement ").correct, true);
  assert.equal(evaluateAnswer(fillQ, "position").correct, true);
  assert.equal(evaluateAnswer(fillQ, "velocity").correct, false);
});

test("recordAttempts adds attempts to progress and respects bounding cap", () => {
  let progress = emptyProgress();
  const attempt = {
    id: "att-1",
    questionId: "q-1",
    topicId: "math-1-1",
    mode: "practice",
    prompt: "Prompt",
    userAnswer: "Ans",
    correctAnswer: "Ans",
    correct: true,
    timestamp: new Date().toISOString(),
  };

  progress = recordAttempts(progress, [attempt]);
  assert.equal(progress.attempts.length, 1);
  assert.equal(progress.attempts[0].id, "att-1");

  // Verify decoded progress retains attempts
  const decoded = decodeProgress(JSON.stringify(progress)).progress;
  assert.equal(decoded.attempts.length, 1);
  assert.equal(decoded.attempts[0].id, "att-1");
});

test("detectWeaknesses identifies questions answered incorrectly and ranks them", () => {
  const attempts = [
    {
      id: "1",
      questionId: "q-1",
      topicId: "math-1-1",
      mode: "practice",
      prompt: "Q1 prompt",
      userAnswer: "wrong1",
      correctAnswer: "right1",
      correct: false,
      timestamp: "2026-09-23T10:00:00Z",
    },
    {
      id: "2",
      questionId: "q-1",
      topicId: "math-1-1",
      mode: "practice",
      prompt: "Q1 prompt",
      userAnswer: "wrong2",
      correctAnswer: "right1",
      correct: false,
      timestamp: "2026-09-23T10:05:00Z",
    },
    {
      id: "3",
      questionId: "q-2",
      topicId: "math-1-1",
      mode: "practice",
      prompt: "Q2 prompt",
      userAnswer: "right2",
      correctAnswer: "right2",
      correct: true,
      timestamp: "2026-09-23T10:06:00Z",
    },
  ];

  const weaknesses = detectWeaknesses(attempts);
  assert.equal(weaknesses.length, 1);
  assert.equal(weaknesses[0].questionId, "q-1");
  assert.equal(weaknesses[0].incorrectCount, 2);
});

test("calculateTopicMastery maps progress through cognitive mastery states", () => {
  assert.equal(calculateTopicMastery("math-1-1", false, []), "not_started");
  assert.equal(calculateTopicMastery("math-1-1", true, []), "exposed");

  const lowAttempts = [
    { topicId: "math-1-1", correct: false },
    { topicId: "math-1-1", correct: true },
  ];
  assert.equal(calculateTopicMastery("math-1-1", false, lowAttempts), "practicing");

  const goodAttempts = [
    { topicId: "math-1-1", correct: true },
    { topicId: "math-1-1", correct: true },
  ];
  assert.equal(calculateTopicMastery("math-1-1", false, goodAttempts), "familiar");

  const strongAttempts = [
    { topicId: "math-1-1", correct: true },
    { topicId: "math-1-1", correct: true },
    { topicId: "math-1-1", correct: true },
    { topicId: "math-1-1", correct: true },
  ];
  assert.equal(calculateTopicMastery("math-1-1", true, strongAttempts), "strong");
});

test("initSessionState initializes guided and practice-only sessions cleanly", () => {
  const guided = initSessionState("math-1-1", "mathematics", "guided");
  assert.equal(guided.topicId, "math-1-1");
  assert.equal(guided.mode, "guided");
  assert.equal(guided.stage, "intro");

  const practice = initSessionState("math-1-1", "mathematics", "practice_only");
  assert.equal(practice.mode, "practice_only");
  assert.equal(practice.stage, "practice");
});
