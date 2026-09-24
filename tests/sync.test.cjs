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

// Polyfill window and localStorage
const memoryStorage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => memoryStorage.get(key) ?? null,
    setItem: (key, val) => memoryStorage.set(key, String(val)),
    removeItem: (key) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear(),
  },
};

const {
  getSyncEmail,
  setSyncEmail,
  pushSync,
  pullSync,
  debounce,
  DEFAULT_SYNC_EMAIL,
  SYNC_WORKER_URL,
} = require("../lib/sync.ts");

test("getSyncEmail defaults to student@skholario.app and reflects setSyncEmail", () => {
  memoryStorage.clear();
  assert.equal(getSyncEmail(), DEFAULT_SYNC_EMAIL);

  setSyncEmail("rahul.k@ktu.edu");
  assert.equal(getSyncEmail(), "rahul.k@ktu.edu");
});

test("debounce batches rapid invocations into single execution", async () => {
  let callCount = 0;
  let lastArg = "";
  const fn = debounce((arg) => {
    callCount++;
    lastArg = arg;
  }, 50);

  fn("first");
  fn("second");
  fn("third");

  assert.equal(callCount, 0);

  await new Promise((resolve) => setTimeout(resolve, 80));

  assert.equal(callCount, 1);
  assert.equal(lastArg, "third");
});

test("pullSync and pushSync communicate with production Cloudflare Worker KV", async () => {
  // Use a unique test email
  const testEmail = `test.runner.${Date.now()}@skholario.app`;

  // 1. Initial pull on new email should return null
  const initial = await pullSync(testEmail);
  assert.equal(initial, null);

  // 2. Push state
  const testState = {
    completed: ["est102-u1-t1", "est102-u1-t2"],
    examDates: { programming: "2026-11-10" },
    studyTimeMinutes: 50,
  };

  const pushResult = await pushSync(testEmail, testState);
  assert.equal(pushResult.success, true);
  assert.equal(pushResult.email, testEmail);
  assert.ok(pushResult.syncedAt);

  // 3. Pull state and verify round-trip persistence (allowing for KV edge propagation)
  let pulled = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    await new Promise((r) => setTimeout(r, 600));
    pulled = await pullSync(testEmail);
    if (pulled) break;
  }
  assert.ok(pulled, "Expected KV to return saved payload after propagation");
  assert.deepEqual(pulled.completed, ["est102-u1-t1", "est102-u1-t2"]);
  assert.equal(pulled.examDates.programming, "2026-11-10");
  assert.equal(pulled.studyTimeMinutes, 50);
});
