"use client";

import { useRef, useState } from "react";
import {
  FileText,
  Check,
  Trash2,
  Upload,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { subjects } from "@/lib/curriculum";
import { useOnboarding } from "@/lib/onboarding-storage";
import { useCurriculum } from "@/lib/curriculum-store";
import { extractPdfDocument } from "@/lib/curriculum-ingestion/pdf-extractor";
import { parseCurriculum } from "@/lib/curriculum-ingestion/parser";
import {
  ExtractedDocument,
  IngestionError,
  ParsedCurriculum,
} from "@/lib/curriculum-ingestion/types";
import { Eyebrow, ProgressMarks } from "../Primitives";
import { CurriculumReviewModal } from "./CurriculumReviewModal";

interface ProcessingState {
  subjectId: string;
  statusText: string;
}

export function SyllabusTracker() {
  const {
    attachments,
    attachedCount,
    totalSubjects,
    attachSyllabusPdf,
    removeSyllabusPdf,
  } = useOnboarding();

  const { importCurriculum, resetSubjectToDefault } = useCurriculum();

  const [dragOverSubject, setDragOverSubject] = useState<string | null>(null);
  const [processing, setProcessing] = useState<ProcessingState | null>(null);
  const [reviewState, setReviewState] = useState<{
    subjectId: string;
    parsed: ParsedCurriculum;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleProcessFile = async (subjectId: string, file: File) => {
    setErrorMessage(null);
    setProcessing({
      subjectId,
      statusText: "Reading PDF pages locally...",
    });

    try {
      const doc = await extractPdfDocument(
        file,
        file.name,
        (current, total) => {
          setProcessing({
            subjectId,
            statusText: `Reading page ${current} of ${total}...`,
          });
        },
      );

      setProcessing({
        subjectId,
        statusText: "Understanding syllabus structure...",
      });

      const parsed = parseCurriculum(doc);

      // Open review modal
      setReviewState({ subjectId, parsed });
      setProcessing(null);
    } catch (err: unknown) {
      setProcessing(null);
      if (err instanceof IngestionError) {
        setErrorMessage(err.message);
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(`Failed to process PDF: ${msg}`);
      }
    }
  };

  const handleFileChange = (subjectId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    handleProcessFile(subjectId, file);
  };

  const handleAttachMock = (subjectId: string, subjectCode: string, short: string) => {
    setErrorMessage(null);
    setProcessing({
      subjectId,
      statusText: "Generating sample syllabus...",
    });

    setTimeout(() => {
      try {
        const mockDoc = getMockSyllabusDocument(subjectCode, short);
        const parsed = parseCurriculum(mockDoc);
        setReviewState({ subjectId, parsed });
        setProcessing(null);
      } catch {
        setProcessing(null);
        setErrorMessage("Failed to generate sample syllabus.");
      }
    }, 200);
  };

  const handleConfirmReview = (confirmed: ParsedCurriculum) => {
    if (!reviewState) return;
    const { subjectId } = reviewState;

    // Commit structured curriculum into local store
    importCurriculum(confirmed);

    // Save attachment record in onboarding store
    attachSyllabusPdf(subjectId, confirmed.fileName, 1024 * 350);

    setReviewState(null);
  };

  const handleRemove = (subjectId: string) => {
    removeSyllabusPdf(subjectId);
    resetSubjectToDefault(subjectId);
  };

  return (
    <>
      <section
        id="syllabus-tracker-section"
        className="syllabus-tracker-card"
        aria-labelledby="syllabus-tracker-title"
      >
        <div className="tracker-top">
          <div>
            <Eyebrow>SEMESTER SETUP / OFFICIAL CURRICULUM</Eyebrow>
            <h2 id="syllabus-tracker-title">Attach your syllabus PDFs</h2>
            <p className="tracker-desc">
              Skholario understands your university syllabus directly in your browser.
              Attach your PDFs to automatically extract modules, topics, and source pages.
              Your documents never leave your device.
            </p>
          </div>

          <div className="tracker-meter-box">
            <span className="mono">
              {attachedCount} OF {String(totalSubjects).padStart(2, "0")} SUBJECTS ADDED
            </span>
            <ProgressMarks done={attachedCount} total={totalSubjects} />
            <span className="meter-caption">
              {attachedCount === totalSubjects
                ? "All 6 subject syllabi attached!"
                : `${totalSubjects - attachedCount} more subject${totalSubjects - attachedCount > 1 ? "s" : ""} to complete setup`}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="tracker-error-banner" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <div>
              <strong>Extraction Note:</strong> {errorMessage}
            </div>
            <button
              type="button"
              className="error-dismiss-btn"
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error message"
            >
              ×
            </button>
          </div>
        )}

        <div className="syllabus-subjects-grid">
          {subjects.map((s, idx) => {
            const attachment = attachments[s.id];
            const isAttached = Boolean(attachment);
            const isDragging = dragOverSubject === s.id;
            const isCurrentProcessing = processing?.subjectId === s.id;

            return (
              <div
                key={s.id}
                className={`syllabus-subject-card ${isAttached ? "attached" : ""} ${isDragging ? "drag-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverSubject(s.id);
                }}
                onDragLeave={() => setDragOverSubject(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverSubject(null);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleProcessFile(s.id, e.dataTransfer.files[0]);
                  }
                }}
              >
                <div className="card-subject-meta">
                  <span className={`subject-mini-chip ${s.color}`} aria-hidden="true">
                    {s.symbol}
                  </span>
                  <div>
                    <span className="mono">0{idx + 1} / {s.code}</span>
                    <h3>{s.short}</h3>
                  </div>
                </div>

                {isCurrentProcessing ? (
                  <div className="processing-status-row">
                    <Loader2 size={16} className="spin" aria-hidden="true" />
                    <span className="mono">{processing.statusText}</span>
                  </div>
                ) : isAttached ? (
                  <div className="attached-status-row">
                    <div className="file-chip">
                      <FileText size={16} aria-hidden="true" />
                      <span className="file-name" title={attachment.fileName}>
                        {attachment.fileName}
                      </span>
                      <span className="file-verified">
                        <Check size={13} aria-hidden="true" />
                      </span>
                    </div>

                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => handleRemove(s.id)}
                      aria-label={`Remove syllabus PDF for ${s.short}`}
                      title="Remove syllabus"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="unattached-actions">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      id={`file-input-${s.id}`}
                      ref={(el) => {
                        fileInputRefs.current[s.id] = el;
                      }}
                      className="sr-only"
                      onChange={(e) => handleFileChange(s.id, e.target.files)}
                    />

                    <label
                      htmlFor={`file-input-${s.id}`}
                      className="action-file-upload"
                    >
                      <Upload size={15} aria-hidden="true" />
                      Attach PDF
                    </label>

                    <button
                      type="button"
                      className="sample-attach-btn"
                      onClick={() => handleAttachMock(s.id, s.code, s.short)}
                      title="Parse sample syllabus"
                    >
                      <Plus size={13} aria-hidden="true" />
                      Sample
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {reviewState && (
        <CurriculumReviewModal
          parsed={reviewState.parsed}
          onConfirm={handleConfirmReview}
          onCancel={() => setReviewState(null)}
        />
      )}
    </>
  );
}

function getMockSyllabusDocument(code: string, short: string): ExtractedDocument {
  const isElectrical =
    code.toUpperCase().includes("EST130") ||
    short.toLowerCase().includes("electrical");

  if (isElectrical) {
    return {
      fileName: "EST130-electrical-syllabus.pdf",
      fileSize: 1024 * 340,
      totalPages: 3,
      pages: [
        {
          pageNumber: 1,
          text: `APJ ABDUL KALAM TECHNOLOGICAL UNIVERSITY
Course Code: EST 130
Course Name: INTRODUCTION TO ELECTRICAL AND ELECTRONICS ENGINEERING
Credits: 4  Semester: FIRST

Syllabus
MODULE 1
DC Circuits: Ohm's Law and Kirchhoff's Laws. Mesh analysis and nodal analysis for resistive networks. Series and parallel combination of resistors. Star-Delta transformation. Maximum power transfer theorem.

MODULE 2
Electromagnetic Induction & AC Fundamentals: Faraday's laws of electromagnetic induction, Lenz's law. Self and mutual inductance. Generation of alternating voltages, waveforms, frequency, time period, peak value, RMS value, average value, form factor, peak factor. AC through pure R, L and C circuits. Series R-L-C circuits and resonance.`,
          lines: [
            "APJ ABDUL KALAM TECHNOLOGICAL UNIVERSITY",
            "Course Code: EST 130",
            "Course Name: INTRODUCTION TO ELECTRICAL AND ELECTRONICS ENGINEERING",
            "Credits: 4 Semester: FIRST",
            "Syllabus",
            "MODULE 1",
            "DC Circuits: Ohm's Law and Kirchhoff's Laws. Mesh analysis and nodal analysis for resistive networks. Series and parallel combination of resistors. Star-Delta transformation. Maximum power transfer theorem.",
            "MODULE 2",
            "Electromagnetic Induction & AC Fundamentals: Faraday's laws of electromagnetic induction, Lenz's law. Self and mutual inductance. Generation of alternating voltages, waveforms, frequency, time period, peak value, RMS value, average value, form factor, peak factor. AC through pure R, L and C circuits. Series R-L-C circuits and resonance.",
          ],
        },
        {
          pageNumber: 2,
          text: `MODULE 3
Electrical Machines: Single phase transformer - construction and working principle, EMF equation, losses and efficiency. DC Motors - principle of operation, types, back EMF, torque equation. Three phase induction motor - construction and rotating magnetic field basics.

MODULE 4
Electronics Devices: Semiconductor physics, PN junction diode - operation and V-I characteristics. Rectifiers: Half wave, Full wave and Bridge rectifiers, ripple factor. Zener diode as voltage regulator. Bipolar Junction Transistor (BJT) - operation and configurations (CE, CB, CC).`,
          lines: [
            "MODULE 3",
            "Electrical Machines: Single phase transformer - construction and working principle, EMF equation, losses and efficiency. DC Motors - principle of operation, types, back EMF, torque equation. Three phase induction motor - construction and rotating magnetic field basics.",
            "MODULE 4",
            "Electronics Devices: Semiconductor physics, PN junction diode - operation and V-I characteristics. Rectifiers: Half wave, Full wave and Bridge rectifiers, ripple factor. Zener diode as voltage regulator. Bipolar Junction Transistor (BJT) - operation and configurations (CE, CB, CC).",
          ],
        },
        {
          pageNumber: 3,
          text: `MODULE 5
Electronic Systems & Communication: Operational amplifier basics, ideal op-amp characteristics, inverting and non-inverting configurations. Principles of electronic communication, block diagram of communication system, modulation concepts (AM, FM).

Text Books
1. Hughes, Electrical and Electronic Technology, Pearson Education.
2. D. P. Kothari and I. J. Nagrath, Basic Electrical Engineering, Tata McGraw Hill.
Reference Books
1. Boylestad and Nashelsky, Electronic Devices and Circuit Theory, Pearson.`,
          lines: [
            "MODULE 5",
            "Electronic Systems & Communication: Operational amplifier basics, ideal op-amp characteristics, inverting and non-inverting configurations. Principles of electronic communication, block diagram of communication system, modulation concepts (AM, FM).",
            "Text Books",
            "1. Hughes, Electrical and Electronic Technology, Pearson Education.",
            "2. D. P. Kothari and I. J. Nagrath, Basic Electrical Engineering, Tata McGraw Hill.",
            "Reference Books",
            "1. Boylestad and Nashelsky, Electronic Devices and Circuit Theory, Pearson.",
          ],
        },
      ],
    };
  }

  // Algorithmic Thinking with Python
  return {
    fileName: `${code.toLowerCase()}-syllabus.pdf`,
    fileSize: 1024 * 280,
    totalPages: 2,
    pages: [
      {
        pageNumber: 1,
        text: `APJ ABDUL KALAM TECHNOLOGICAL UNIVERSITY
Course Code: ${code}
Course Name: ALGORITHMIC THINKING WITH PYTHON
Credits: 4 Semester: S1

Syllabus
MODULE 1
Computational Approaches: Basics of problem solving, algorithm design, flowcharts, pseudocode. Introduction to Python syntax, variables, data types, operators and expressions.

MODULE 2
Control Structures: Selection statements (if, if-else, nested if). Iteration statements (while loop, for loop). Jump statements: break, continue, pass. Nested loops and patterns.

MODULE 3
Functions and Recursion: Defining functions, parameters, return values, default arguments, local and global scope. Recursion fundamentals, recursive problem solving, base cases and call stack.`,
        lines: [
          "APJ ABDUL KALAM TECHNOLOGICAL UNIVERSITY",
          `Course Code: ${code}`,
          "Course Name: ALGORITHMIC THINKING WITH PYTHON",
          "Credits: 4 Semester: S1",
          "Syllabus",
          "MODULE 1",
          "Computational Approaches: Basics of problem solving, algorithm design, flowcharts, pseudocode. Introduction to Python syntax, variables, data types, operators and expressions.",
          "MODULE 2",
          "Control Structures: Selection statements (if, if-else, nested if). Iteration statements (while loop, for loop). Jump statements: break, continue, pass. Nested loops and patterns.",
          "MODULE 3",
          "Functions and Recursion: Defining functions, parameters, return values, default arguments, local and global scope. Recursion fundamentals, recursive problem solving, base cases and call stack.",
        ],
      },
      {
        pageNumber: 2,
        text: `MODULE 4
Data Structures: Strings, string methods and slicing. Lists and list comprehension. Tuples, sets and set operations. Dictionaries and key-value mapping operations.

MODULE 5
File Handling & Algorithmic Complexity: File operations: read, write, append, with statement. Exception handling: try, except, finally. Search and sort: linear search, binary search, bubble sort.

Text Books
1. Allen B. Downey, Think Python, O'Reilly Media.
2. Reema Thareja, Python Programming, Oxford University Press.`,
        lines: [
          "MODULE 4",
          "Data Structures: Strings, string methods and slicing. Lists and list comprehension. Tuples, sets and set operations. Dictionaries and key-value mapping operations.",
          "MODULE 5",
          "File Handling & Algorithmic Complexity: File operations: read, write, append, with statement. Exception handling: try, except, finally. Search and sort: linear search, binary search, bubble sort.",
          "Text Books",
          "1. Allen B. Downey, Think Python, O'Reilly Media.",
          "2. Reema Thareja, Python Programming, Oxford University Press.",
        ],
      },
    ],
  };
}
