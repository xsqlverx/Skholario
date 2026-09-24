"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
  type Progress,
} from "@/lib/study-progress";
import type { QuestionAttempt } from "@/lib/study-attempts";
import {
  getSyncEmail,
  setSyncEmail as persistSyncEmail,
  pullSync,
  pushSync,
  debounce,
} from "@/lib/sync";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

type State = ProgressSnapshot & {
  completed: string[];
  examDates: Record<string, string>;
  attempts: QuestionAttempt[];
  today: string;
  recommendation: Recommendation | null;
  complete: (id: string) => void;
  toggleComplete: (id: string) => void;
  setExamDate: (subjectId: string, date: string) => void;
  recordAttempts: (attempts: QuestionAttempt[]) => void;
  syncStatus: SyncStatus;
  syncEmail: string;
  setSyncEmail: (email: string) => void;
  syncNow: () => Promise<void>;
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
    ) {
      store.refresh();
    }
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

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncEmail, setSyncEmailState] = useState<string>(() => getSyncEmail());
  const isInitialMount = useRef(true);

  // Debounced push state to Cloudflare KV
  const debouncedPush = useMemo(() => {
    return debounce((email: string, latestProgress: Progress) => {
      setSyncStatus("syncing");
      pushSync(email, latestProgress)
        .then((res) => {
          if (res.success) setSyncStatus("synced");
          else setSyncStatus("error");
        })
        .catch(() => setSyncStatus("error"));
    }, 800);
  }, []);

  // Update sync email and trigger re-pull
  const handleSetSyncEmail = useCallback((newEmail: string) => {
    const cleaned = newEmail.trim().toLowerCase();
    persistSyncEmail(cleaned);
    setSyncEmailState(cleaned);
  }, []);

  // Manual or programmatic sync pull & push
  const syncNow = useCallback(async () => {
    const email = getSyncEmail();
    setSyncStatus("syncing");
    try {
      const remoteData = await pullSync<Progress>(email);
      if (remoteData && Object.keys(remoteData).length > 0) {
        const local = store.getSnapshot().progress;
        const remoteCompleted = Array.isArray(remoteData.completed) ? remoteData.completed : [];
        const remoteExamDates = (typeof remoteData.examDates === "object" && remoteData.examDates) ? remoteData.examDates : {};
        const remoteAttempts = Array.isArray(remoteData.attempts) ? remoteData.attempts : [];

        const mergedCompleted = Array.from(new Set([...local.completed, ...remoteCompleted]));
        const mergedExamDates = { ...local.examDates, ...remoteExamDates };
        const mergedAttempts = [...(local.attempts || []), ...remoteAttempts.filter(
          (ra) => !(local.attempts || []).some((la) => la.id === ra.id || (la.questionId === ra.questionId && la.timestamp === ra.timestamp))
        )];

        const merged: Progress = {
          version: 2,
          completed: mergedCompleted,
          completedAt: { ...local.completedAt },
          examDates: mergedExamDates,
          attempts: mergedAttempts,
        };
        store.hydrate(merged);
        await pushSync(email, merged);
      } else {
        await pushSync(email, store.getSnapshot().progress);
      }
      setSyncStatus("synced");
    } catch {
      setSyncStatus("error");
    }
  }, []);

  // Initial client mount: pull remote state from Cloudflare KV
  useEffect(() => {
    let active = true;
    const email = getSyncEmail();

    pullSync<Progress>(email)
      .then((remoteData) => {
        if (!active) return;
        if (remoteData && Object.keys(remoteData).length > 0) {
          const local = store.getSnapshot().progress;
          const remoteCompleted = Array.isArray(remoteData.completed) ? remoteData.completed : [];
          const remoteExamDates = (typeof remoteData.examDates === "object" && remoteData.examDates) ? remoteData.examDates : {};
          const remoteAttempts = Array.isArray(remoteData.attempts) ? remoteData.attempts : [];

          const mergedCompleted = Array.from(new Set([...local.completed, ...remoteCompleted]));
          const mergedExamDates = { ...local.examDates, ...remoteExamDates };
          const mergedAttempts = [...(local.attempts || []), ...remoteAttempts.filter(
            (ra) => !(local.attempts || []).some((la) => la.id === ra.id || (la.questionId === ra.questionId && la.timestamp === ra.timestamp))
          )];

          const hasDifferences =
            mergedCompleted.length !== local.completed.length ||
            Object.keys(mergedExamDates).length !== Object.keys(local.examDates).length;

          if (hasDifferences) {
            store.hydrate({
              version: 2,
              completed: mergedCompleted,
              completedAt: { ...local.completedAt },
              examDates: mergedExamDates,
              attempts: mergedAttempts,
            });
          }
          setSyncStatus("synced");
        } else {
          setSyncStatus("idle");
        }
      })
      .catch((err) => {
        console.warn("KV sync pull failed on mount:", err);
        if (active) setSyncStatus("error");
      })
      .finally(() => {
        setTimeout(() => {
          isInitialMount.current = false;
        }, 300);
      });

    return () => {
      active = false;
    };
  }, []);

  // Debounced push whenever topic completion changes
  const prevCompletedRef = useRef<string[]>(snapshot.progress.completed);
  useEffect(() => {
    if (isInitialMount.current) {
      prevCompletedRef.current = snapshot.progress.completed;
      return;
    }

    if (prevCompletedRef.current !== snapshot.progress.completed) {
      prevCompletedRef.current = snapshot.progress.completed;
      debouncedPush(getSyncEmail(), snapshot.progress);
    }
  }, [snapshot.progress.completed, snapshot.progress, debouncedPush]);

  // Wrapped complete action
  const handleComplete = useCallback(
    (id: string) => {
      store.complete(id);
      const current = store.getSnapshot().progress;
      debouncedPush(getSyncEmail(), current);
    },
    [debouncedPush],
  );

  // Wrapped toggleComplete action
  const handleToggleComplete = useCallback(
    (id: string) => {
      store.toggleComplete(id);
      const current = store.getSnapshot().progress;
      debouncedPush(getSyncEmail(), current);
    },
    [debouncedPush],
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
        complete: handleComplete,
        toggleComplete: handleToggleComplete,
        setExamDate: store.setExamDate,
        recordAttempts: store.recordAttempts,
        syncStatus,
        syncEmail,
        setSyncEmail: handleSetSyncEmail,
        syncNow,
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
