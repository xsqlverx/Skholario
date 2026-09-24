"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle,
  FileText,
  Plus,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import {
  ParsedCurriculum,
  ParsedModule,
  ParsedTopic,
} from "@/lib/curriculum-ingestion/types";
import { Eyebrow } from "../Primitives";

interface CurriculumReviewModalProps {
  parsed: ParsedCurriculum;
  onConfirm: (curriculum: ParsedCurriculum) => void;
  onCancel: () => void;
}

export function CurriculumReviewModal({
  parsed,
  onConfirm,
  onCancel,
}: CurriculumReviewModalProps) {
  const [data, setData] = useState<ParsedCurriculum>(() => JSON.parse(JSON.stringify(parsed)));
  const [showWarnings, setShowWarnings] = useState(false);

  const totalTopics = data.modules.reduce((sum, m) => sum + m.topics.length, 0);

  // Subject metadata edits
  const handleCodeChange = (code: string) => {
    setData((prev) => ({ ...prev, subjectCode: code.toUpperCase() }));
  };

  const handleNameChange = (name: string) => {
    setData((prev) => ({ ...prev, subjectName: name }));
  };

  const handleShortChange = (short: string) => {
    setData((prev) => ({ ...prev, shortName: short }));
  };

  // Module edits
  const handleModuleTitleChange = (moduleIndex: number, title: string) => {
    setData((prev) => {
      const nextModules = [...prev.modules];
      nextModules[moduleIndex] = { ...nextModules[moduleIndex], title };
      return { ...prev, modules: nextModules };
    });
  };

  const handleDeleteModule = (moduleIndex: number) => {
    setData((prev) => {
      const nextModules = prev.modules
        .filter((_, idx) => idx !== moduleIndex)
        .map((m, idx) => ({ ...m, order: idx + 1 }));
      return { ...prev, modules: nextModules };
    });
  };

  const handleAddModule = () => {
    setData((prev) => {
      const order = prev.modules.length + 1;
      const newModule: ParsedModule = {
        id: `${prev.subjectId}-unit-${order}`,
        title: `Module ${order}`,
        order,
        sourcePages: [1],
        topics: [],
      };
      return { ...prev, modules: [...prev.modules, newModule] };
    });
  };

  // Topic edits
  const handleTopicTitleChange = (
    moduleIndex: number,
    topicIndex: number,
    title: string,
  ) => {
    setData((prev) => {
      const nextModules = [...prev.modules];
      const targetModule = { ...nextModules[moduleIndex] };
      const nextTopics = [...targetModule.topics];
      nextTopics[topicIndex] = { ...nextTopics[topicIndex], title };
      targetModule.topics = nextTopics;
      nextModules[moduleIndex] = targetModule;
      return { ...prev, modules: nextModules };
    });
  };

  const handleDeleteTopic = (moduleIndex: number, topicIndex: number) => {
    setData((prev) => {
      const nextModules = [...prev.modules];
      const targetModule = { ...nextModules[moduleIndex] };
      targetModule.topics = targetModule.topics
        .filter((_, idx) => idx !== topicIndex)
        .map((t, idx) => ({ ...t, order: idx + 1 }));
      nextModules[moduleIndex] = targetModule;
      return { ...prev, modules: nextModules };
    });
  };

  const handleMoveTopic = (
    moduleIndex: number,
    topicIndex: number,
    direction: "up" | "down",
  ) => {
    setData((prev) => {
      const nextModules = [...prev.modules];
      const targetModule = { ...nextModules[moduleIndex] };
      const nextTopics = [...targetModule.topics];
      const targetIndex = direction === "up" ? topicIndex - 1 : topicIndex + 1;

      if (targetIndex < 0 || targetIndex >= nextTopics.length) return prev;

      const temp = nextTopics[topicIndex];
      nextTopics[topicIndex] = nextTopics[targetIndex];
      nextTopics[targetIndex] = temp;

      targetModule.topics = nextTopics.map((t, idx) => ({ ...t, order: idx + 1 }));
      nextModules[moduleIndex] = targetModule;
      return { ...prev, modules: nextModules };
    });
  };

  const handleAddTopic = (moduleIndex: number) => {
    setData((prev) => {
      const nextModules = [...prev.modules];
      const targetModule = { ...nextModules[moduleIndex] };
      const order = targetModule.topics.length + 1;
      const newTopic: ParsedTopic = {
        id: `${prev.subjectId}-u${targetModule.order}-t${order}`,
        title: `Topic ${order}`,
        order,
        sourcePages: targetModule.sourcePages,
      };
      targetModule.topics = [...targetModule.topics, newTopic];
      nextModules[moduleIndex] = targetModule;
      return { ...prev, modules: nextModules };
    });
  };

  const handleConfirm = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#ee482f", "#24251f", "#d7e2c8", "#eee49f"],
      });
    } catch {
      // safe fallback
    }
    onConfirm(data);
  };

  const getConfidenceBadge = () => {
    if (data.confidence === "high") {
      return (
        <span className="confidence-pill high">
          <CheckCircle size={13} aria-hidden="true" />
          HIGH CONFIDENCE ({Math.round(data.confidenceScore * 100)}%)
        </span>
      );
    }
    if (data.confidence === "medium") {
      return (
        <span className="confidence-pill medium">
          <AlertTriangle size={13} aria-hidden="true" />
          MEDIUM CONFIDENCE ({Math.round(data.confidenceScore * 100)}%)
        </span>
      );
    }
    return (
      <span className="confidence-pill low">
        <AlertTriangle size={13} aria-hidden="true" />
        REVIEW REQUIRED ({Math.round(data.confidenceScore * 100)}%)
      </span>
    );
  };

  return (
    <div
      className="review-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <motion.div
        className="review-modal-card"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <header className="review-modal-header">
          <div>
            <div className="review-header-meta">
              <span className="review-doc-tag">
                <FileText size={13} aria-hidden="true" />
                {data.fileName}
              </span>
              {getConfidenceBadge()}
            </div>
            <h2 id="review-modal-title" className="review-modal-title">
              Review syllabus curriculum
            </h2>
            <p className="review-modal-desc">
              Extracted on-device. Review detected course structure, edit titles, or
              adjust topics before importing into Skholario.
            </p>
          </div>

          <button
            type="button"
            className="review-close-btn"
            onClick={onCancel}
            aria-label="Cancel and close review"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {data.warnings.length > 0 && (
          <div className="review-warnings-bar">
            <div className="warning-summary">
              <AlertTriangle size={15} aria-hidden="true" />
              <span>
                {data.warnings.length} parsing note{data.warnings.length > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                className="warning-toggle-btn"
                onClick={() => setShowWarnings(!showWarnings)}
              >
                {showWarnings ? "Hide" : "View"}
              </button>
            </div>
            {showWarnings && (
              <ul className="warning-list">
                {data.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="review-modal-scrollable">
          {/* Section 1: Subject Identity */}
          <section className="review-meta-section">
            <Eyebrow>COURSE IDENTITY</Eyebrow>
            <div className="review-meta-inputs">
              <div className="input-group">
                <label htmlFor="course-code-input" className="mono">
                  COURSE CODE
                </label>
                <input
                  id="course-code-input"
                  type="text"
                  value={data.subjectCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="e.g. EST102"
                  className="editorial-input"
                />
              </div>

              <div className="input-group wide">
                <label htmlFor="course-name-input" className="mono">
                  FULL COURSE NAME
                </label>
                <input
                  id="course-name-input"
                  type="text"
                  value={data.subjectName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Algorithmic Thinking with Python"
                  className="editorial-input"
                />
              </div>

              <div className="input-group">
                <label htmlFor="course-short-input" className="mono">
                  SHORT DISPLAY
                </label>
                <input
                  id="course-short-input"
                  type="text"
                  value={data.shortName}
                  onChange={(e) => handleShortChange(e.target.value)}
                  placeholder="e.g. Algorithmic Thinking"
                  className="editorial-input"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Modules and Topics */}
          <section className="review-modules-section">
            <div className="modules-section-header">
              <Eyebrow>
                MODULES & TOPICS ({data.modules.length} MODULES · {totalTopics} TOPICS)
              </Eyebrow>
              <button
                type="button"
                className="add-module-top-btn"
                onClick={handleAddModule}
              >
                <Plus size={14} aria-hidden="true" />
                Add Module
              </button>
            </div>

            <div className="review-modules-list">
              {data.modules.map((m, mIdx) => (
                <div key={m.id || mIdx} className="review-module-card">
                  <div className="module-card-header">
                    <span className="mono module-order-pill">
                      MODULE 0{m.order}
                    </span>
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) =>
                        handleModuleTitleChange(mIdx, e.target.value)
                      }
                      placeholder="Module title"
                      className="module-title-input"
                      aria-label={`Module ${m.order} title`}
                    />
                    <span className="source-pages-badge mono">
                      p. {m.sourcePages.join(", ")}
                    </span>
                    <button
                      type="button"
                      className="delete-module-btn"
                      onClick={() => handleDeleteModule(mIdx)}
                      aria-label={`Delete Module ${m.order}`}
                      title="Delete module"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="module-topics-list">
                    {m.topics.map((t, tIdx) => (
                      <div key={t.id || tIdx} className="review-topic-row">
                        <span className="topic-order mono">
                          {m.order}.{t.order}
                        </span>
                        <input
                          type="text"
                          value={t.title}
                          onChange={(e) =>
                            handleTopicTitleChange(mIdx, tIdx, e.target.value)
                          }
                          className="topic-title-input"
                          aria-label={`Topic ${m.order}.${t.order} title`}
                        />
                        <span className="source-page-tag mono">
                          p. {t.sourcePages?.join(",") || "1"}
                        </span>
                        <div className="topic-reorder-buttons">
                          <button
                            type="button"
                            className="reorder-btn"
                            disabled={tIdx === 0}
                            onClick={() => handleMoveTopic(mIdx, tIdx, "up")}
                            aria-label="Move topic up"
                          >
                            <ArrowUp size={13} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="reorder-btn"
                            disabled={tIdx === m.topics.length - 1}
                            onClick={() => handleMoveTopic(mIdx, tIdx, "down")}
                            aria-label="Move topic down"
                          >
                            <ArrowDown size={13} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="delete-topic-btn"
                            onClick={() => handleDeleteTopic(mIdx, tIdx)}
                            aria-label={`Delete topic ${t.title}`}
                            title="Delete topic"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="add-topic-btn"
                      onClick={() => handleAddTopic(mIdx)}
                    >
                      <Plus size={13} aria-hidden="true" />
                      Add Topic to Module {m.order}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="review-modal-footer">
          <div className="review-footer-summary mono">
            <span>{data.modules.length} MODULES</span>
            <span className="divider">·</span>
            <span>{totalTopics} TOPICS DETECTED</span>
          </div>

          <div className="review-footer-actions">
            <button
              type="button"
              className="review-cancel-btn"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="review-confirm-btn"
              onClick={handleConfirm}
            >
              <Sparkles size={16} aria-hidden="true" />
              Confirm & Import to Curriculum
              <Check size={16} aria-hidden="true" />
            </button>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
