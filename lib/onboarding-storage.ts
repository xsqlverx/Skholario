"use client";

import { useSyncExternalStore } from "react";
import { subjects } from "./curriculum";

export type SyllabusAttachment = {
  fileName: string;
  fileSize: number;
  attachedAt: string;
};

export type OnboardingState = {
  hasSeenTour: boolean;
  tourDismissed: boolean;
  bannerDismissed: boolean;
  attachments: Record<string, SyllabusAttachment>;
};

export const ONBOARDING_STORAGE_KEY = "study-hub.onboarding";

const DEFAULT_ONBOARDING_STATE: OnboardingState = Object.freeze({
  hasSeenTour: false,
  tourDismissed: false,
  bannerDismissed: false,
  attachments: {},
});

export function defaultOnboardingState(): OnboardingState {
  return DEFAULT_ONBOARDING_STATE;
}

let cachedState: OnboardingState | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getOnboardingSnapshot(): OnboardingState {
  if (typeof window === "undefined") {
    return DEFAULT_ONBOARDING_STATE;
  }

  if (cachedState) {
    return cachedState;
  }

  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) {
      cachedState = DEFAULT_ONBOARDING_STATE;
      return cachedState;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      cachedState = {
        hasSeenTour: Boolean(parsed.hasSeenTour),
        tourDismissed: Boolean(parsed.tourDismissed),
        bannerDismissed: Boolean(parsed.bannerDismissed),
        attachments:
          parsed.attachments && typeof parsed.attachments === "object"
            ? parsed.attachments
            : {},
      };
      return cachedState;
    }
  } catch {
    // Fallback to cached or default
  }

  cachedState = DEFAULT_ONBOARDING_STATE;
  return cachedState;
}

export function saveOnboardingState(state: OnboardingState): void {
  cachedState = state;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota error
    }
  }
  notify();
}

export function attachSyllabusPdf(
  subjectId: string,
  fileName: string,
  fileSize = 0,
): void {
  const current = getOnboardingSnapshot();
  const next: OnboardingState = {
    ...current,
    attachments: {
      ...current.attachments,
      [subjectId]: {
        fileName,
        fileSize,
        attachedAt: new Date().toISOString(),
      },
    },
  };
  saveOnboardingState(next);
}

export function removeSyllabusPdf(subjectId: string): void {
  const current = getOnboardingSnapshot();
  const nextAttachments = { ...current.attachments };
  delete nextAttachments[subjectId];
  const next: OnboardingState = {
    ...current,
    attachments: nextAttachments,
  };
  saveOnboardingState(next);
}

export function dismissTour(): void {
  const current = getOnboardingSnapshot();
  saveOnboardingState({
    ...current,
    hasSeenTour: true,
    tourDismissed: true,
  });
}

export function openTour(): void {
  const current = getOnboardingSnapshot();
  saveOnboardingState({
    ...current,
    tourDismissed: false,
  });
}

export function dismissBanner(): void {
  const current = getOnboardingSnapshot();
  saveOnboardingState({
    ...current,
    bannerDismissed: true,
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === ONBOARDING_STORAGE_KEY) {
      cachedState = null;
      notify();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function getAttachedSubjectsCount(state: OnboardingState): number {
  return Math.min(
    subjects.length,
    Object.keys(state.attachments).length,
  );
}

export function useOnboarding() {
  const state = useSyncExternalStore(
    subscribe,
    getOnboardingSnapshot,
    defaultOnboardingState,
  );

  const attachedCount = getAttachedSubjectsCount(state);

  return {
    ...state,
    attachedCount,
    totalSubjects: subjects.length,
    attachSyllabusPdf,
    removeSyllabusPdf,
    dismissTour,
    openTour,
    dismissBanner,
  };
}
