"use client";
import { createContext, useContext, useSyncExternalStore } from "react";
import {
  createProgressStore,
  legacyProgressKey,
  progressKey,
  serverSnapshot,
  type ProgressSnapshot,
} from "@/lib/progress-storage";
import {
  localDateKey,
  recommendTopic,
  type Recommendation,
} from "@/lib/study-progress";

import type { QuestionAttempt } from "@/lib/study-attempts";

type State = ProgressSnapshot & {
  completed: string[];
  examDates: Record<string, string>;
  attempts: QuestionAttempt[];
  today: string;
  recommendation: Recommendation | null;
  complete: (id: string) => void;
  setExamDate: (subjectId: string, date: string) => void;
  recordAttempts: (attempts: QuestionAttempt[]) => void;
};
const Context = createContext<State | null>(null);
const store = createProgressStore(() => window.localStorage);
function subscribe(listener: () => void) {
  const unsubscribe = store.subscribe(listener);
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === progressKey ||
      event.key === legacyProgressKey ||
      event.key === null
    )
      store.refresh();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    unsubscribe();
    window.removeEventListener("storage", onStorage);
  };
}
function subscribeToDay(listener: () => void) {
  let timeout: ReturnType<typeof setTimeout>;
  function schedule() {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    timeout = setTimeout(
      () => {
        listener();
        schedule();
      },
      midnight.getTime() - now.getTime() + 100,
    );
  }
  const onFocus = () => {
    listener();
    clearTimeout(timeout);
    schedule();
  };
  schedule();
  window.addEventListener("focus", onFocus);
  return () => {
    clearTimeout(timeout);
    window.removeEventListener("focus", onFocus);
  };
}
const getServerSnapshot = () => serverSnapshot;
const getServerDay = () => "";
export function StudyState({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    store.getSnapshot,
    getServerSnapshot,
  );
  const today = useSyncExternalStore(
    subscribeToDay,
    localDateKey,
    getServerDay,
  );
  const ready = snapshot.ready && today !== "";
  const recommendation = ready
    ? recommendTopic(snapshot.progress, today)
    : null;
  return (
    <Context.Provider
      value={{
        ...snapshot,
        ready,
        today,
        completed: snapshot.progress.completed,
        examDates: snapshot.progress.examDates,
        attempts: snapshot.progress.attempts ?? [],
        recommendation,
        complete: store.complete,
        setExamDate: store.setExamDate,
        recordAttempts: store.recordAttempts,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useProgress() {
  const value = useContext(Context);
  if (!value) throw new Error("StudyState is required");
  return value;
}
