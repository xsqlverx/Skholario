import type { Question } from "./question-bank";

export type AttemptMode = "warmup" | "recall" | "practice";

export type QuestionAttempt = {
  id: string;
  questionId: string;
  topicId: string;
  mode: AttemptMode;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
  timestamp: string;
};

export type TopicMastery =
  | "not_started"
  | "exposed"
  | "practicing"
  | "familiar"
  | "strong";

export type WeaknessRecord = {
  questionId: string;
  topicId: string;
  prompt: string;
  explanation: string;
  userAnswer?: string;
  correctAnswer?: string;
  incorrectCount: number;
  lastAttemptAt: string;
};

export type EvaluationResult = {
  correct: boolean;
  feedback: string;
  userAnswerFormatted: string;
  correctAnswerFormatted: string;
};

function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Deterministically evaluates user input against a question's correct answer.
 * Accommodates reasonable variations for numeric rounding and math expressions.
 */
export function evaluateAnswer(
  question: Question,
  rawInput: string | number,
): EvaluationResult {
  const userAnswerFormatted = String(rawInput).trim();
  const correctAnswerFormatted = String(question.answer).trim();

  let correct = false;

  switch (question.type) {
    case "mcq":
    case "true_false": {
      correct =
        userAnswerFormatted.toLowerCase() ===
        correctAnswerFormatted.toLowerCase();
      break;
    }
    case "numeric": {
      const userNum = parseFloat(userAnswerFormatted);
      const targetNum = Number(question.answer);
      if (!isNaN(userNum) && !isNaN(targetNum)) {
        correct = Math.abs(userNum - targetNum) < 0.05;
      }
      break;
    }
    case "fill_blank":
    case "short_answer": {
      const normUser = normalizeText(userAnswerFormatted);
      const normTarget = normalizeText(correctAnswerFormatted);

      if (normUser === normTarget) {
        correct = true;
      } else {
        // Handle common math abbreviations or alternate phrasing
        const alternates: Record<string, string[]> = {
          "3x2": ["3x^2", "3*x^2", "3x**2"],
          "ln|x| + c": ["ln|x|", "ln(x)", "lnx", "ln(x) + c"],
          "units": ["unit", "dimensions", "dimension"],
          "displacement": ["position", "x"],
          "-1": ["minus 1", "negative 1"],
        };

        const list = alternates[normTarget] ?? [];
        if (list.map(normalizeText).includes(normUser)) {
          correct = true;
        }
      }
      break;
    }
  }

  const feedback = correct
    ? "Correct! " + question.explanation
    : `Incorrect. The correct answer is "${correctAnswerFormatted}". ${question.explanation}`;

  return {
    correct,
    feedback,
    userAnswerFormatted,
    correctAnswerFormatted,
  };
}

/**
 * Deterministically identifies questions and topics where the student has struggled.
 */
export function detectWeaknesses(
  attempts: QuestionAttempt[],
  questions: Question[] = [],
): WeaknessRecord[] {
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const grouped = new Map<string, { attempts: QuestionAttempt[]; incorrectCount: number }>();

  for (const a of attempts) {
    const existing = grouped.get(a.questionId) ?? { attempts: [], incorrectCount: 0 };
    existing.attempts.push(a);
    if (!a.correct) {
      existing.incorrectCount += 1;
    }
    grouped.set(a.questionId, existing);
  }

  const weaknesses: WeaknessRecord[] = [];

  for (const [qId, data] of grouped.entries()) {
    if (data.incorrectCount > 0) {
      const last = data.attempts[data.attempts.length - 1];
      const qMeta = questionMap.get(qId);
      weaknesses.push({
        questionId: qId,
        topicId: last.topicId,
        prompt: qMeta?.prompt ?? last.prompt,
        explanation: qMeta?.explanation ?? `Correct answer: ${last.correctAnswer}`,
        userAnswer: last.userAnswer,
        correctAnswer: last.correctAnswer,
        incorrectCount: data.incorrectCount,
        lastAttemptAt: last.timestamp,
      });
    }
  }

  // Sort most frequent / recent mistakes first
  return weaknesses.sort((a, b) => b.incorrectCount - a.incorrectCount);
}

/**
 * Computes progressive mastery of a topic:
 * NOT STARTED -> EXPOSED (material viewed) -> PRACTICING (questions attempted)
 * -> FAMILIAR (>=70% accuracy) -> STRONG (>=85% accuracy with at least 4 attempts)
 */
export function calculateTopicMastery(
  topicId: string,
  isComplete: boolean,
  attempts: QuestionAttempt[],
): TopicMastery {
  const topicAttempts = attempts.filter((a) => a.topicId === topicId);

  if (topicAttempts.length === 0) {
    return isComplete ? "exposed" : "not_started";
  }

  const correctCount = topicAttempts.filter((a) => a.correct).length;
  const accuracy = correctCount / topicAttempts.length;

  if (topicAttempts.length >= 4 && accuracy >= 0.85 && isComplete) {
    return "strong";
  }

  if (topicAttempts.length >= 2 && accuracy >= 0.7) {
    return "familiar";
  }

  return "practicing";
}
