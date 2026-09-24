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

const { parseCurriculum } = require("../lib/curriculum-ingestion/parser.ts");
const {
  getActiveCurriculum,
  importCurriculum,
  resetSubjectToDefault,
  resetAllCurriculumToDefault,
  findActiveSubject,
} = require("../lib/curriculum-store.ts");

test("parses KTU EST102 Algorithmic Thinking with Python into 5 modules with topics", () => {
  const pythonDoc = {
    fileName: "EST102-python.pdf",
    fileSize: 1024 * 250,
    totalPages: 2,
    pages: [
      {
        pageNumber: 1,
        lines: [
          "APJ ABDUL KALAM TECHNOLOGICAL UNIVERSITY",
          "Course Code: EST 102",
          "Course Name: ALGORITHMIC THINKING WITH PYTHON",
          "Credits: 4",
          "Semester: FIRST",
          "Syllabus",
          "MODULE 1",
          "Computational Approaches: Basics of problem solving, algorithm design, flowcharts, pseudocode. Introduction to Python syntax, variables, data types, operators and expressions.",
          "MODULE 2",
          "Control Structures: Selection statements (if, if-else, nested if). Iteration statements (while loop, for loop). Jump statements: break, continue, pass. Nested loops and patterns.",
          "MODULE 3",
          "Functions and Recursion: Defining functions, parameters, return values, default arguments, local and global scope. Recursion fundamentals, recursive problem solving, base cases and call stack.",
        ],
        text: "...",
      },
      {
        pageNumber: 2,
        lines: [
          "MODULE 4",
          "Data Structures: Strings, string methods and slicing. Lists and list comprehension. Tuples, sets and set operations. Dictionaries and key-value mapping operations.",
          "MODULE 5",
          "File Handling & Algorithmic Complexity: File operations: read, write, append, with statement. Exception handling: try, except, finally. Search and sort: linear search, binary search, bubble sort.",
          "Text Books",
          "1. Allen B. Downey, Think Python, O'Reilly Media.",
          "2. Reema Thareja, Python Programming, Oxford University Press.",
        ],
        text: "...",
      },
    ],
  };

  const parsed = parseCurriculum(pythonDoc);

  assert.equal(parsed.subjectCode, "EST102");
  assert.equal(parsed.subjectName, "ALGORITHMIC THINKING WITH PYTHON");
  assert.equal(parsed.shortName, "Algorithmic Thinking");
  assert.equal(parsed.modules.length, 5);
  assert.equal(parsed.confidence, "high");
  assert.ok(parsed.confidenceScore >= 0.8);

  // Verify modules
  assert.ok(parsed.modules[0].title.toLowerCase().includes("computational"));
  assert.ok(parsed.modules[1].title.toLowerCase().includes("control structures"));
  assert.ok(parsed.modules[2].title.toLowerCase().includes("functions and recursion"));
  assert.ok(parsed.modules[3].title.toLowerCase().includes("data structures"));
  assert.ok(parsed.modules[4].title.toLowerCase().includes("file handling"));

  // Verify topics in Module 3 (Functions and Recursion)
  const m3 = parsed.modules[2];
  assert.ok(m3.topics.length >= 3);
  assert.ok(m3.topics.some((t) => t.title.toLowerCase().includes("recursion")));

  // Verify deterministic IDs
  assert.equal(parsed.modules[0].id, "est102-unit-1");
  assert.equal(parsed.modules[0].topics[0].id, "est102-u1-t1");

  // Verify source page tracking
  assert.deepEqual(parsed.modules[0].sourcePages, [1]);
  assert.deepEqual(parsed.modules[4].sourcePages, [2]);
});

test("parses KTU EST130 Electrical Engineering and excludes textbook boilerplate", () => {
  const electricalDoc = {
    fileName: "EST130-electrical.pdf",
    fileSize: 1024 * 320,
    totalPages: 3,
    pages: [
      {
        pageNumber: 1,
        lines: [
          "APJ ABDUL KALAM TECHNOLOGICAL UNIVERSITY",
          "Course Code: EST 130",
          "Course Name: INTRODUCTION TO ELECTRICAL AND ELECTRONICS ENGINEERING",
          "Credits: 4",
          "Syllabus",
          "MODULE 1",
          "DC Circuits: Ohm's Law and Kirchhoff's Laws. Mesh analysis and nodal analysis for resistive networks. Series and parallel combination of resistors. Star-Delta transformation.",
          "MODULE 2",
          "Electromagnetic Induction & AC Fundamentals: Faraday's laws of electromagnetic induction, Lenz's law. Self and mutual inductance. Waveforms, frequency, RMS value, average value, form factor. Series R-L-C circuits.",
        ],
        text: "...",
      },
      {
        pageNumber: 2,
        lines: [
          "MODULE 3",
          "Electrical Machines: Single phase transformer - construction and working principle, EMF equation. DC Motors - principle of operation, torque equation. Three phase induction motor basics.",
          "MODULE 4",
          "Electronics Devices: Semiconductor physics, PN junction diode - operation and V-I characteristics. Rectifiers: Half wave, Full wave and Bridge rectifiers. Zener diode. BJT configurations (CE, CB, CC).",
        ],
        text: "...",
      },
      {
        pageNumber: 3,
        lines: [
          "MODULE 5",
          "Electronic Systems & Communication: Operational amplifier basics, ideal op-amp characteristics. Principles of electronic communication, block diagram of communication system, modulation concepts (AM, FM).",
          "Text Books",
          "1. Hughes, Electrical and Electronic Technology, Pearson Education.",
          "2. D. P. Kothari and I. J. Nagrath, Basic Electrical Engineering, Tata McGraw Hill.",
          "Reference Books",
          "1. Boylestad and Nashelsky, Electronic Devices and Circuit Theory, Pearson.",
          "Question Paper Pattern",
          "Maximum Marks: 100",
        ],
        text: "...",
      },
    ],
  };

  const parsed = parseCurriculum(electricalDoc);

  assert.equal(parsed.subjectCode, "EST130");
  assert.equal(parsed.shortName, "Electrical & Electronics");
  assert.equal(parsed.modules.length, 5);

  // Verify Module 1 topics
  const m1 = parsed.modules[0];
  assert.ok(m1.topics.some((t) => t.title.toLowerCase().includes("kirchhoff")));
  assert.ok(m1.topics.some((t) => t.title.toLowerCase().includes("mesh analysis")));

  // Verify textbooks are completely excluded
  const allTopicTitles = parsed.modules
    .flatMap((m) => m.topics.map((t) => t.title.toLowerCase()))
    .join(" ");
  assert.equal(allTopicTitles.includes("hughes"), false);
  assert.equal(allTopicTitles.includes("kothari"), false);
  assert.equal(allTopicTitles.includes("boylestad"), false);
  assert.equal(allTopicTitles.includes("maximum marks"), false);

  // Verify source page tracking across pages 1, 2, 3
  assert.deepEqual(parsed.modules[0].sourcePages, [1]);
  assert.deepEqual(parsed.modules[2].sourcePages, [2]);
  assert.deepEqual(parsed.modules[4].sourcePages, [3]);
});

test("handles Roman numeral modules and Unit header variants", () => {
  const romanDoc = {
    fileName: "physics-syllabus.pdf",
    fileSize: 1024 * 100,
    totalPages: 1,
    pages: [
      {
        pageNumber: 1,
        lines: [
          "Subject Code: PHT100",
          "Subject Name: Engineering Physics",
          "UNIT I: Oscillations and Waves",
          "Simple harmonic motion, damped oscillations, forced vibrations, resonance.",
          "UNIT II: Wave Optics",
          "Interference of light, Newton rings, diffraction, polarization.",
          "UNIT III: Quantum Mechanics",
          "De Broglie hypothesis, Heisenberg uncertainty principle, wave function.",
          "UNIT IV: Lasers and Fibre Optics",
          "Spontaneous and stimulated emission, ruby laser, optical fibres.",
        ],
        text: "...",
      },
    ],
  };

  const parsed = parseCurriculum(romanDoc);
  assert.equal(parsed.modules.length, 4);
  assert.equal(parsed.modules[0].order, 1);
  assert.equal(parsed.modules[1].order, 2);
  assert.equal(parsed.modules[2].order, 3);
  assert.equal(parsed.modules[3].order, 4);
  assert.ok(parsed.modules[0].title.toLowerCase().includes("oscillations"));
  assert.ok(parsed.modules[2].title.toLowerCase().includes("quantum"));
});

test("flags low confidence and warnings for sparse or unformatted documents", () => {
  const sparseDoc = {
    fileName: "sparse.pdf",
    fileSize: 1024 * 50,
    totalPages: 1,
    pages: [
      {
        pageNumber: 1,
        lines: [
          "MODULE 1",
          "Single Topic Only",
        ],
        text: "...",
      },
    ],
  };

  const parsed = parseCurriculum(sparseDoc);
  assert.equal(parsed.confidence, "low");
  assert.ok(parsed.confidenceScore < 0.5);
  assert.ok(parsed.warnings.length > 0);
});

test("throws IngestionError on empty document or missing modules", () => {
  const emptyDoc = {
    fileName: "empty.pdf",
    fileSize: 100,
    totalPages: 0,
    pages: [],
  };

  assert.throws(
    () => parseCurriculum(emptyDoc),
    (err) => err.code === "EMPTY_DOCUMENT",
  );

  const noModulesDoc = {
    fileName: "timetable.pdf",
    fileSize: 1000,
    totalPages: 1,
    pages: [
      {
        pageNumber: 1,
        lines: ["Monday: 9am Math", "Tuesday: 10am Physics"],
        text: "...",
      },
    ],
  };

  assert.throws(
    () => parseCurriculum(noModulesDoc),
    (err) => err.code === "NO_MODULES_FOUND",
  );
});

test("curriculum store imports, merges, and persists custom subjects", () => {
  memoryStorage.clear();
  resetAllCurriculumToDefault();

  const initialSubjects = getActiveCurriculum();
  assert.equal(initialSubjects.length, 6);

  // Import custom electrical curriculum
  const parsed = {
    subjectId: "electrical",
    subjectCode: "EST130",
    subjectName: "Introduction to Electrical and Electronics Engineering",
    shortName: "Electrical & Electronics",
    modules: [
      {
        id: "electrical-unit-1",
        title: "DC Circuits",
        order: 1,
        sourcePages: [1],
        topics: [
          {
            id: "electrical-u1-t1",
            title: "Kirchhoff's Laws",
            order: 1,
            sourcePages: [1],
          },
          {
            id: "electrical-u1-t2",
            title: "Mesh Analysis",
            order: 2,
            sourcePages: [1],
          },
        ],
      },
    ],
    confidence: "high",
    confidenceScore: 0.9,
    warnings: [],
    extractedAt: new Date().toISOString(),
    fileName: "EST130.pdf",
  };

  importCurriculum(parsed);

  const updatedSubjects = getActiveCurriculum();
  assert.equal(updatedSubjects.length, 6);

  const activeElec = findActiveSubject("electrical");
  assert.ok(activeElec);
  assert.equal(activeElec.units.length, 1);
  assert.equal(activeElec.units[0].title, "DC Circuits");
  assert.equal(activeElec.units[0].topics[0].title, "Kirchhoff's Laws");
  assert.deepEqual(activeElec.units[0].topics[0].sourcePages, [1]);

  // Reset to default
  resetSubjectToDefault("electrical");
  const restoredElec = findActiveSubject("electrical");
  assert.ok(restoredElec);
  assert.equal(restoredElec.units.length, 5); // default has 5 units
});
