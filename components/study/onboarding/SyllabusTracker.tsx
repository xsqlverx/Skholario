"use client";

import { useRef, useState } from "react";
import { FileText, Check, Trash2, Upload, Plus } from "lucide-react";
import { subjects } from "@/lib/curriculum";
import { useOnboarding } from "@/lib/onboarding-storage";
import { Eyebrow, ProgressMarks } from "../Primitives";

export function SyllabusTracker() {
  const {
    attachments,
    attachedCount,
    totalSubjects,
    attachSyllabusPdf,
    removeSyllabusPdf,
  } = useOnboarding();

  const [dragOverSubject, setDragOverSubject] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = (subjectId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    attachSyllabusPdf(subjectId, file.name, file.size);
  };

  const handleAttachMock = (subjectId: string, subjectCode: string) => {
    attachSyllabusPdf(subjectId, `${subjectCode.toLowerCase()}-syllabus.pdf`, 1024 * 450);
  };

  return (
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
            Study Hub maps topics directly to your university syllabus. Attach your
            PDFs to track curriculum coverage and unlock tailored practice.
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

      <div className="syllabus-subjects-grid">
        {subjects.map((s, idx) => {
          const attachment = attachments[s.id];
          const isAttached = Boolean(attachment);
          const isDragging = dragOverSubject === s.id;

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
                handleFileChange(s.id, e.dataTransfer.files);
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

              {isAttached ? (
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
                    onClick={() => removeSyllabusPdf(s.id)}
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
                    onClick={() => handleAttachMock(s.id, s.code)}
                    title="Attach sample syllabus"
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
  );
}
