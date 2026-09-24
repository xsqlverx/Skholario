import {
  completeTopic,
  decodeProgress,
  emptyProgress,
  recordAttempts,
  updateExamDate,
  type Progress,
} from "./study-progress";
import type { QuestionAttempt } from "./study-attempts";

export const progressKey = "study-hub.progress.v2";
export const legacyProgressKey = "study-hub.progress.v1";
type BrowserStorage = Pick<Storage, "getItem" | "setItem">;
export type ProgressSnapshot = {
  progress: Progress;
  ready: boolean;
  storageError: boolean;
  dataWarning: boolean;
};
export const serverSnapshot: ProgressSnapshot = {
  progress: emptyProgress(),
  ready: false,
  storageError: false,
  dataWarning: false,
};

// One adapter shared by the provider; injected storage also makes failure and
// migration behavior testable without a browser or another dependency.
export function createProgressStore(getStorage: () => BrowserStorage) {
  let cached = serverSnapshot;
  let lastRaw: string | null | undefined;
  let memoryOnly = false;
  const listeners = new Set<() => void>();
  function getSnapshot(): ProgressSnapshot {
    if (memoryOnly) return cached;
    try {
      const storage = getStorage();
      const raw =
        storage.getItem(progressKey) ?? storage.getItem(legacyProgressKey);
      if (!cached.ready || cached.storageError || raw !== lastRaw) {
        cached = { ...decodeProgress(raw), ready: true, storageError: false };
        lastRaw = raw;
      }
    } catch {
      if (!cached.ready || !cached.storageError)
        cached = { ...cached, ready: true, storageError: true };
    }
    return cached;
  }
  function publish(progress: Progress) {
    const raw = JSON.stringify(progress);
    let storageError = false;
    try {
      getStorage().setItem(progressKey, raw);
      lastRaw = raw;
      memoryOnly = false;
    } catch {
      storageError = true;
      memoryOnly = true;
    }
    cached = { progress, ready: true, storageError, dataWarning: false };
    listeners.forEach((listener) => listener());
  }
  return {
    getSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    refresh() {
      listeners.forEach((listener) => listener());
    },
    hydrate(progress: Progress) {
      publish(progress);
    },
    toggleComplete(id: string) {
      const progress = getSnapshot().progress;
      if (progress.completed.includes(id)) {
        const nextCompleted = progress.completed.filter((t) => t !== id);
        const nextCompletedAt = { ...progress.completedAt };
        delete nextCompletedAt[id];
        publish({
          ...progress,
          completed: nextCompleted,
          completedAt: nextCompletedAt,
        });
      } else {
        const next = completeTopic(progress, id);
        if (next !== progress) publish(next);
      }
    },
    complete(id: string) {
      const progress = getSnapshot().progress;
      const next = completeTopic(progress, id);
      if (next !== progress) publish(next);
    },
    setExamDate(subjectId: string, date: string) {
      const progress = getSnapshot().progress;
      const next = updateExamDate(progress, subjectId, date);
      if (next !== progress) publish(next);
    },
    recordAttempts(attempts: QuestionAttempt[]) {
      const progress = getSnapshot().progress;
      const next = recordAttempts(progress, attempts);
      if (next !== progress) publish(next);
    },
  };
}
