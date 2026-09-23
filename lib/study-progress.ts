import { subjects, type Subject, type Topic, type Unit } from "./curriculum";
import type { QuestionAttempt } from "./study-attempts";

export type Progress = {
  version: 2;
  completed: string[];
  completedAt: Record<string, string>;
  examDates: Record<string, string>;
  attempts?: QuestionAttempt[];
};
export type Recommendation = {
  subject: Subject;
  unit: Unit;
  topic: Topic;
  examDate?: string;
};

export function emptyProgress(): Progress {
  return {
    version: 2,
    completed: [],
    completedAt: {},
    examDates: {},
    attempts: [],
  };
}

export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Validate a civil date without parsing YYYY-MM-DD as UTC or normalizing Feb 30.
export function validExamDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1900 || year > 9999 || month < 1 || month > 12 || day < 1)
    return false;
  return day <= new Date(year, month, 0).getDate();
}

export function formatExamDate(value: string): string {
  if (!validExamDate(value)) return "No exam date";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function decodeProgress(
  raw: string | null,
  curriculum = subjects,
): { progress: Progress; dataWarning: boolean } {
  if (raw === null) return { progress: emptyProgress(), dataWarning: false };
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !record(value) ||
      ![1, 2].includes(value.version as number) ||
      !Array.isArray(value.completed)
    )
      throw new Error("Unrecognized progress format");
    const topicIds = new Set(
      curriculum.flatMap((s) =>
        s.units.flatMap((u) => u.topics.map((t) => t.id)),
      ),
    );
    const progress = emptyProgress();
    progress.completed = [
      ...new Set(
        value.completed.filter(
          (id): id is string => typeof id === "string" && topicIds.has(id),
        ),
      ),
    ];
    let dataWarning =
      progress.completed.length !== new Set(value.completed).size;
    if (value.version === 2) {
      if (!record(value.examDates) || !record(value.completedAt))
        dataWarning = true;
      if (record(value.examDates)) {
        for (const [id, date] of Object.entries(value.examDates)) {
          if (curriculum.some((s) => s.id === id) && validExamDate(date))
            progress.examDates[id] = date;
          else dataWarning = true;
        }
      }
      if (record(value.completedAt)) {
        for (const [id, date] of Object.entries(value.completedAt)) {
          if (
            progress.completed.includes(id) &&
            typeof date === "string" &&
            Number.isFinite(Date.parse(date))
          )
            progress.completedAt[id] = date;
          else dataWarning = true;
        }
      }
      if (Array.isArray(value.attempts)) {
        progress.attempts = value.attempts.filter(
          (a): a is QuestionAttempt =>
            record(a) &&
            typeof a.questionId === "string" &&
            typeof a.topicId === "string" &&
            typeof a.correct === "boolean",
        );
      }
    }
    // Version 1 had no completion timestamps. Keep them unknown rather than invent dates.
    return { progress, dataWarning };
  } catch {
    return { progress: emptyProgress(), dataWarning: true };
  }
}

export function firstIncomplete(
  subject: Subject,
  completed: readonly string[],
): Recommendation | null {
  for (const unit of subject.units) {
    const topic = unit.topics.find((t) => !completed.includes(t.id));
    if (topic) return { subject, unit, topic };
  }
  return null;
}

export function recommendTopic(
  progress: Pick<Progress, "completed" | "examDates">,
  today: string,
  curriculum = subjects,
): Recommendation | null {
  const candidates = curriculum.flatMap((subject) => {
    const next = firstIncomplete(subject, progress.completed);
    if (!next) return [];
    const date = progress.examDates[subject.id];
    return [
      {
        ...next,
        examDate: validExamDate(date) && date >= today ? date : undefined,
      },
    ];
  });
  // Stable sort preserves curriculum order for undated subjects and equal dates.
  candidates.sort((a, b) =>
    (a.examDate ?? "9999-99-99").localeCompare(b.examDate ?? "9999-99-99"),
  );
  return candidates[0] ?? null;
}

export function completeTopic(
  progress: Progress,
  topicId: string,
  timestamp = new Date().toISOString(),
): Progress {
  if (
    !subjects.some((s) =>
      s.units.some((u) => u.topics.some((t) => t.id === topicId)),
    ) ||
    progress.completed.includes(topicId)
  )
    return progress;
  return {
    ...progress,
    completed: [...progress.completed, topicId],
    completedAt: { ...progress.completedAt, [topicId]: timestamp },
  };
}

export function updateExamDate(
  progress: Progress,
  subjectId: string,
  date: string,
): Progress {
  if (
    !subjects.some((s) => s.id === subjectId) ||
    (date !== "" && !validExamDate(date))
  )
    return progress;
  const examDates = { ...progress.examDates };
  if (date) examDates[subjectId] = date;
  else delete examDates[subjectId];
  return { ...progress, examDates };
}

export function recordAttempts(
  progress: Progress,
  newAttempts: QuestionAttempt[],
): Progress {
  if (newAttempts.length === 0) return progress;
  const existing = progress.attempts ?? [];
  // Retain the latest 500 attempts to bound local storage size
  const combined = [...existing, ...newAttempts].slice(-500);
  return { ...progress, attempts: combined };
}

