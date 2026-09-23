import type { QuestionAttempt } from "./study-attempts";

export type SessionStage =
  | "intro"
  | "warmup"
  | "learn"
  | "recall"
  | "practice"
  | "review";

export type SessionMode = "guided" | "practice_only";

export type SessionState = {
  topicId: string;
  subjectId: string;
  mode: SessionMode;
  stage: SessionStage;
  warmupIndex: number;
  learnIndex: number;
  recallIndex: number;
  practiceIndex: number;
  attempts: QuestionAttempt[];
  retestQuestionIds?: string[];
  retestIndex?: number;
  isRetesting?: boolean;
  startedAt: string;
  completedAt?: string;
};

const SESSION_PREFIX = "study-hub.active-session.";

export function getSessionStorageKey(topicId: string): string {
  return `${SESSION_PREFIX}${topicId}`;
}

export function initSessionState(
  topicId: string,
  subjectId: string,
  mode: SessionMode = "guided",
): SessionState {
  return {
    topicId,
    subjectId,
    mode,
    stage: mode === "practice_only" ? "practice" : "intro",
    warmupIndex: 0,
    learnIndex: 0,
    recallIndex: 0,
    practiceIndex: 0,
    attempts: [],
    startedAt: new Date().toISOString(),
  };
}

export function saveActiveSession(state: SessionState): void {
  if (typeof window === "undefined") return;
  try {
    const key = getSessionStorageKey(state.topicId);
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Graceful degradation when storage quota is exceeded or in private mode
  }
}

export function loadActiveSession(topicId: string): SessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getSessionStorageKey(topicId);
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.topicId === topicId && typeof parsed.stage === "string") {
      return parsed as SessionState;
    }
  } catch {
    return null;
  }
  return null;
}

export function clearActiveSession(topicId: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getSessionStorageKey(topicId);
    window.localStorage.removeItem(key);
  } catch {
    // Ignore error
  }
}
