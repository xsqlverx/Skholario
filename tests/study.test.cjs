/* eslint-disable @typescript-eslint/no-require-imports -- Node's test runner loads the existing TypeScript compiler; no test dependency needed. */
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
const { subjects, allTopics } = require("../lib/curriculum.ts");
const {
  emptyProgress,
  decodeProgress,
  recommendTopic,
  completeTopic,
  updateExamDate,
  localDateKey,
  validExamDate,
  firstIncomplete,
} = require("../lib/study-progress.ts");
const {
  createProgressStore,
  progressKey,
  legacyProgressKey,
} = require("../lib/progress-storage.ts");
const today = "2026-09-23";
function memoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
}

test("new students start at zero and follow curriculum order", () => {
  const progress = decodeProgress(null).progress;
  assert.deepEqual(progress.completed, []);
  assert.equal(recommendTopic(progress, today).topic.id, "math-1-1");
});
test("nearest upcoming exam outranks curriculum order, including exams today", () => {
  let progress = updateExamDate(emptyProgress(), "chemistry", "2026-09-25");
  progress = updateExamDate(progress, "graphics", today);
  assert.equal(recommendTopic(progress, today).subject.id, "graphics");
});
test("exam ties use curriculum order; past exams do not dominate", () => {
  let progress = {
    ...emptyProgress(),
    examDates: {
      chemistry: "2026-09-25",
      graphics: "2026-09-25",
      mathematics: "2026-09-22",
    },
  };
  assert.equal(recommendTopic(progress, today).subject.id, "chemistry");
  progress = { ...progress, examDates: { chemistry: "2026-09-22" } };
  assert.equal(recommendTopic(progress, today).subject.id, "mathematics");
});
test("completed subjects and invalid exam dates cannot win recommendations", () => {
  const progress = {
    ...emptyProgress(),
    completed: subjects[1].units.flatMap((u) => u.topics.map((t) => t.id)),
    examDates: { chemistry: today, graphics: "invalid" },
  };
  assert.equal(recommendTopic(progress, today).topic.id, "math-1-1");
});
test("completion moves across topics, units and subjects without recommending a completed topic", () => {
  let progress = emptyProgress();
  for (const expected of allTopics) {
    const next = recommendTopic(progress, today);
    assert.equal(next.topic.id, expected.id);
    assert.ok(!progress.completed.includes(next.topic.id));
    progress = completeTopic(progress, next.topic.id);
  }
  assert.equal(recommendTopic(progress, today), null);
  assert.equal(firstIncomplete(subjects[0], progress.completed), null);
});
test("completion is idempotent, keeps its original timestamp, and rejects unknown topics", () => {
  const progress = completeTopic(
    emptyProgress(),
    "math-1-1",
    "2026-09-23T08:00:00.000Z",
  );
  assert.equal(completeTopic(progress, "math-1-1"), progress);
  assert.equal(completeTopic(progress, "not-a-topic"), progress);
  assert.equal(progress.completedAt["math-1-1"], "2026-09-23T08:00:00.000Z");
});
test("removing an exam restores curriculum order without changing completion", () => {
  let progress = completeTopic(emptyProgress(), "math-1-1");
  progress = updateExamDate(progress, "chemistry", "2026-09-24");
  assert.equal(recommendTopic(progress, today).subject.id, "chemistry");
  progress = updateExamDate(progress, "chemistry", "");
  assert.equal(recommendTopic(progress, today).topic.id, "math-1-2");
  assert.deepEqual(progress.completed, ["math-1-1"]);
});
test("civil dates validate leap days, month bounds and local calendar dates", () => {
  for (const date of [
    "2026-02-30",
    "2026-02-29",
    "2026-13-01",
    "2026-00-01",
    "2026-09-00",
    "26-09-23",
    "",
  ])
    assert.equal(validExamDate(date), false, date);
  assert.equal(validExamDate("2028-02-29"), true);
  assert.equal(validExamDate(today), true);
  assert.equal(localDateKey(new Date(2026, 8, 23, 0, 5)), today);
  assert.equal(
    updateExamDate(emptyProgress(), "unknown", today).examDates.unknown,
    undefined,
  );
});
test("legacy data preserves existing completions without inventing dates", () => {
  const { progress } = decodeProgress(
    JSON.stringify({ version: 1, completed: ["math-1-1", "math-1-1"] }),
  );
  assert.equal(progress.version, 2);
  assert.deepEqual(progress.completed, ["math-1-1"]);
  assert.deepEqual(progress.completedAt, {});
  assert.deepEqual(progress.examDates, {});
});
test("malformed or unsupported data falls back safely; known valid fields survive partial corruption", () => {
  for (const raw of ["{", "null", "[]", '{"version":999,"completed":[]}']) {
    const result = decodeProgress(raw);
    assert.equal(result.dataWarning, true);
    assert.deepEqual(result.progress.completed, []);
  }
  const result = decodeProgress(
    JSON.stringify({
      version: 2,
      completed: ["math-1-1", "bogus", 7],
      completedAt: { "math-1-1": "2026-09-23T08:00:00Z", bogus: "bad" },
      examDates: { chemistry: today, graphics: "2026-02-30" },
    }),
  );
  assert.deepEqual(result.progress.completed, ["math-1-1"]);
  assert.deepEqual(result.progress.examDates, { chemistry: today });
  assert.equal(result.dataWarning, true);
});
test("stored dates and completions survive a new store instance (reload)", () => {
  const storage = memoryStorage();
  const store = createProgressStore(() => storage);
  store.complete("math-1-1");
  store.setExamDate("chemistry", today);
  const reloaded = createProgressStore(() => storage).getSnapshot();
  assert.deepEqual(reloaded.progress.completed, ["math-1-1"]);
  assert.equal(reloaded.progress.examDates.chemistry, today);
  assert.ok(reloaded.progress.completedAt["math-1-1"]);
  assert.equal(reloaded.storageError, false);
});
test("legacy migration writes v2 on mutation and leaves the original untouched", () => {
  const legacy = JSON.stringify({ version: 1, completed: ["math-1-1"] });
  const storage = memoryStorage({ [legacyProgressKey]: legacy });
  const store = createProgressStore(() => storage);
  assert.deepEqual(store.getSnapshot().progress.completed, ["math-1-1"]);
  store.setExamDate("chemistry", today);
  assert.equal(JSON.parse(storage.getItem(progressKey)).version, 2);
  assert.equal(storage.getItem(legacyProgressKey), legacy);
});
test("failed writes preserve progress in memory and report storage failure", () => {
  const stored = JSON.stringify({
    ...emptyProgress(),
    completed: ["math-1-1"],
  });
  const storage = {
    getItem: (key) => (key === progressKey ? stored : null),
    setItem: () => {
      throw new Error("Quota exceeded");
    },
  };
  const store = createProgressStore(() => storage);
  store.complete("math-1-2");
  assert.deepEqual(store.getSnapshot().progress.completed, [
    "math-1-1",
    "math-1-2",
  ]);
  assert.equal(store.getSnapshot().storageError, true);
  store.setExamDate("chemistry", today);
  assert.equal(store.getSnapshot().progress.examDates.chemistry, today);
  assert.equal(store.getSnapshot(), store.getSnapshot());
});
test("blocked storage still allows the complete local study loop", () => {
  const store = createProgressStore(() => {
    throw new Error("SecurityError");
  });
  store.complete("math-1-1");
  assert.equal(
    recommendTopic(store.getSnapshot().progress, today).topic.id,
    "math-1-2",
  );
  assert.equal(store.getSnapshot().storageError, true);
});
test("external storage updates are re-read, and mutations use the latest persisted state", () => {
  const storage = memoryStorage();
  const first = createProgressStore(() => storage);
  const second = createProgressStore(() => storage);
  let updates = 0;
  const unsubscribe = second.subscribe(() => updates++);
  first.complete("math-1-1");
  second.refresh();
  assert.equal(updates, 1);
  assert.deepEqual(second.getSnapshot().progress.completed, ["math-1-1"]);
  second.complete("math-1-2");
  assert.deepEqual(first.getSnapshot().progress.completed, [
    "math-1-1",
    "math-1-2",
  ]);
  unsubscribe();
});
test("explicit IDs are unique and preserve completion when curriculum order changes", () => {
  const ids = subjects.flatMap((s) => [
    s.id,
    ...s.units.flatMap((u) => [u.id, ...u.topics.map((t) => t.id)]),
  ]);
  assert.equal(new Set(ids).size, ids.length);
  const progress = completeTopic(emptyProgress(), "math-1-1");
  const reversed = [...subjects].reverse();
  assert.equal(
    decodeProgress(JSON.stringify(progress), reversed).progress.completed[0],
    "math-1-1",
  );
  assert.equal(
    recommendTopic(progress, today, reversed).subject.id,
    "mathematics",
  );
});
