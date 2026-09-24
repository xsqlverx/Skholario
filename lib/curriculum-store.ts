"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Subject, Unit, Topic, subjects as defaultSubjects } from "./curriculum";
import { ParsedCurriculum } from "./curriculum-ingestion/types";

export const CURRICULUM_STORAGE_KEY = "study-hub.custom-curriculum";

export interface CustomCurriculumState {
  version: 1;
  subjects: Record<string, Subject>;
}

const DEFAULT_CURRICULUM_STATE: CustomCurriculumState = Object.freeze({
  version: 1,
  subjects: {},
});

let cachedState: CustomCurriculumState | null = null;
let cachedMergedSubjects: Subject[] | null = null;
const listeners = new Set<() => void>();

function notify() {
  cachedMergedSubjects = null;
  listeners.forEach((listener) => listener());
}

export function getCustomCurriculumSnapshot(): CustomCurriculumState {
  if (typeof window === "undefined") {
    return DEFAULT_CURRICULUM_STATE;
  }

  if (cachedState) {
    return cachedState;
  }

  try {
    const raw = window.localStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (!raw) {
      cachedState = DEFAULT_CURRICULUM_STATE;
      return cachedState;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.subjects) {
      cachedState = {
        version: 1,
        subjects: parsed.subjects,
      };
      return cachedState;
    }
  } catch {
    // Fallback on corrupt JSON
  }

  cachedState = DEFAULT_CURRICULUM_STATE;
  return cachedState;
}

export function saveCustomCurriculum(state: CustomCurriculumState): void {
  cachedState = state;
  cachedMergedSubjects = null;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }
  notify();
}

export function getActiveCurriculum(): Subject[] {
  if (cachedMergedSubjects) {
    return cachedMergedSubjects;
  }

  const customState = getCustomCurriculumSnapshot();
  const customMap = customState.subjects;

  // Merge custom subjects with default subjects
  const merged: Subject[] = defaultSubjects.map((def) => {
    // Check if this default subject was replaced by ID or by Course Code
    const customMatch =
      customMap[def.id] ||
      Object.values(customMap).find(
        (c) => c.code.toLowerCase() === def.code.toLowerCase(),
      );
    return customMatch || def;
  });

  // Append any entirely new subjects that don't match default IDs
  for (const [id, customSubject] of Object.entries(customMap)) {
    const exists = merged.some(
      (m) =>
        m.id === id ||
        m.code.toLowerCase() === customSubject.code.toLowerCase(),
    );
    if (!exists) {
      merged.push(customSubject);
    }
  }

  cachedMergedSubjects = merged;
  return merged;
}

export function findActiveSubject(id: string): Subject | undefined {
  const all = getActiveCurriculum();
  return (
    all.find((s) => s.id === id) ||
    all.find((s) => s.code.toLowerCase() === id.toLowerCase())
  );
}

export function convertParsedToSubject(parsed: ParsedCurriculum): Subject {
  // Check if this matches an existing default subject to preserve symbol and color
  const existing = defaultSubjects.find(
    (s) =>
      s.id === parsed.subjectId ||
      s.code.toLowerCase() === parsed.subjectCode.toLowerCase() ||
      s.name.toLowerCase() === parsed.subjectName.toLowerCase(),
  );

  const id = existing ? existing.id : parsed.subjectId;
  const symbol = existing ? existing.symbol : getDeterministicSymbol(parsed.subjectCode);
  const color = existing ? existing.color : getDeterministicColor(parsed.subjectCode);

  const units: Unit[] = parsed.modules.map((m, idx) => {
    const topics: Topic[] = m.topics.map((t) => ({
      id: t.id,
      title: t.title,
      minutes: 25, // default study unit time
      sourcePages: t.sourcePages,
    }));

    return {
      id: m.id || `${id}-unit-${idx + 1}`,
      title: m.title,
      sourcePages: m.sourcePages,
      topics,
    };
  });

  return {
    id,
    code: parsed.subjectCode,
    name: parsed.subjectName,
    short: parsed.shortName,
    symbol,
    color,
    units,
  };
}

export function importCurriculum(parsed: ParsedCurriculum): Subject {
  const subject = convertParsedToSubject(parsed);
  const current = getCustomCurriculumSnapshot();

  const nextState: CustomCurriculumState = {
    ...current,
    subjects: {
      ...current.subjects,
      [subject.id]: subject,
    },
  };

  saveCustomCurriculum(nextState);
  return subject;
}

export function resetSubjectToDefault(subjectId: string): void {
  const current = getCustomCurriculumSnapshot();
  const nextSubjects = { ...current.subjects };
  delete nextSubjects[subjectId];

  saveCustomCurriculum({
    ...current,
    subjects: nextSubjects,
  });
}

export function resetAllCurriculumToDefault(): void {
  saveCustomCurriculum({
    version: 1,
    subjects: {},
  });
}

function getDeterministicSymbol(code: string): string {
  const symbols = ["λ", "∫", "↗", "{ }", "△", "Ω", "✦", "∑", "π"];
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  return symbols[Math.abs(hash) % symbols.length];
}

function getDeterministicColor(code: string): string {
  const colors = ["red", "green", "yellow", "ink", "pink", "paper"];
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === CURRICULUM_STORAGE_KEY) {
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

export function useCurriculum() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useSyncExternalStore(
    subscribe,
    getCustomCurriculumSnapshot,
    () => DEFAULT_CURRICULUM_STATE,
  );

  const subjects = mounted ? getActiveCurriculum() : defaultSubjects;

  return {
    subjects,
    ready: mounted,
    findSubject: (id: string) => {
      const all = mounted ? getActiveCurriculum() : defaultSubjects;
      return (
        all.find((s) => s.id === id) ||
        all.find((s) => s.code.toLowerCase() === id.toLowerCase())
      );
    },
    importCurriculum,
    resetSubjectToDefault,
    resetAllCurriculumToDefault,
  };
}
