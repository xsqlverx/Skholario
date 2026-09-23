/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner with typescript transpile */
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

// Polyfill window and localStorage for node test runner
const memoryStorage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => memoryStorage.get(key) ?? null,
    setItem: (key, val) => memoryStorage.set(key, String(val)),
    removeItem: (key) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear(),
  },
  addEventListener: () => {},
  removeEventListener: () => {},
};

const {
  defaultOnboardingState,
  getOnboardingSnapshot,
  saveOnboardingState,
  attachSyllabusPdf,
  removeSyllabusPdf,
  dismissTour,
  openTour,
  dismissBanner,
  getAttachedSubjectsCount,
  ONBOARDING_STORAGE_KEY,
} = require("../lib/onboarding-storage.ts");
const { subjects } = require("../lib/curriculum.ts");

test("onboarding defaults to uncompleted tour and zero attachments", () => {
  memoryStorage.clear();
  const def = defaultOnboardingState();
  assert.equal(def.hasSeenTour, false);
  assert.equal(def.tourDismissed, false);
  assert.equal(def.bannerDismissed, false);
  assert.deepEqual(def.attachments, {});
});

test("attaching a syllabus PDF updates the attachments store and count", () => {
  memoryStorage.clear();
  saveOnboardingState(defaultOnboardingState());

  attachSyllabusPdf("mathematics", "ktu-maths-2024.pdf", 1024 * 500);

  const snapshot = getOnboardingSnapshot();
  assert.ok(snapshot.attachments["mathematics"]);
  assert.equal(snapshot.attachments["mathematics"].fileName, "ktu-maths-2024.pdf");
  assert.equal(snapshot.attachments["mathematics"].fileSize, 1024 * 500);
  assert.ok(snapshot.attachments["mathematics"].attachedAt);

  const attachedCount = getAttachedSubjectsCount(snapshot);
  assert.equal(attachedCount, 1);
});

test("attaching multiple subjects tracks progress towards 6/6", () => {
  memoryStorage.clear();
  saveOnboardingState(defaultOnboardingState());

  // Attach all 6 subjects
  for (const s of subjects) {
    attachSyllabusPdf(s.id, `${s.id}-syllabus.pdf`, 204800);
  }

  const snapshot = getOnboardingSnapshot();
  const attachedCount = Object.keys(snapshot.attachments).filter((id) =>
    subjects.some((s) => s.id === id)
  ).length;
  assert.equal(attachedCount, 6);
  assert.equal(subjects.length, 6);
});

test("removing a syllabus PDF accurately decrements the count", () => {
  memoryStorage.clear();
  saveOnboardingState(defaultOnboardingState());

  attachSyllabusPdf("mathematics", "maths-syllabus.pdf", 300000);
  attachSyllabusPdf("physics", "physics-syllabus.pdf", 400000);

  let snapshot = getOnboardingSnapshot();
  assert.equal(Object.keys(snapshot.attachments).length, 2);

  removeSyllabusPdf("mathematics");
  snapshot = getOnboardingSnapshot();
  assert.equal(snapshot.attachments["mathematics"], undefined);
  assert.ok(snapshot.attachments["physics"]);
  assert.equal(Object.keys(snapshot.attachments).length, 1);
});

test("dismissing tour and banner updates persistence correctly", () => {
  memoryStorage.clear();
  saveOnboardingState(defaultOnboardingState());

  dismissTour();
  let snap = getOnboardingSnapshot();
  assert.equal(snap.hasSeenTour, true);
  assert.equal(snap.tourDismissed, true);

  // Re-open tour
  openTour();
  snap = getOnboardingSnapshot();
  assert.equal(snap.tourDismissed, false);

  dismissBanner();
  snap = getOnboardingSnapshot();
  assert.equal(snap.bannerDismissed, true);
});

test("handles corrupted or empty localStorage gracefully", () => {
  memoryStorage.set(ONBOARDING_STORAGE_KEY, "invalid{{json");
  const snap = getOnboardingSnapshot();
  assert.ok(snap);
  assert.equal(typeof snap.attachments, "object");
});
