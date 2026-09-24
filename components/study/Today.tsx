"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock3,
  Zap,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { subjects } from "@/lib/curriculum";
import { formatExamDate } from "@/lib/study-progress";
import { useProgress } from "./StudyState";

export function Today() {
  const { completed, ready } = useProgress();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.02,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 420, damping: 28 },
    },
  };

  return (
    <div className="clean-exam-container">
      {/* High-Priority Hero Action Card */}
      <motion.section
        className="sprint-hero-card"
        aria-label="High Priority Exam Sprint"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="sprint-hero-header" variants={itemVariants}>
          <span className="sprint-badge">
            SLOT A • OCT 1 (6 DAYS LEFT)
          </span>
          <span className="sprint-priority-tag mono">
            <Zap size={13} aria-hidden="true" />
            EXAM SPRINT PRIORITY
          </span>
        </motion.div>

        <motion.div className="sprint-hero-body" variants={itemVariants}>
          <h1 className="sprint-title">Mathematics: Module 1 Essentials</h1>
          <p className="sprint-subtitle">
            Linear Algebra &amp; Matrices · 4 core exam topics · Rank, Gauss Elimination &amp; Eigenvalues
          </p>
        </motion.div>

        <motion.div className="sprint-hero-footer" variants={itemVariants}>
          <Link
            href="/study/mathematics?topic=math-1-1"
            className="sprint-action-btn"
          >
            <span>START 30-MIN SPRINT</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>

          <div className="sprint-time-hint mono">
            <Clock3 size={15} aria-hidden="true" />
            <span>30 MIN DRILL · IMMEDIATE RECALL &amp; PRACTICE</span>
          </div>
        </motion.div>
      </motion.section>

      {/* 5-Item October Internal Subjects Checklist */}
      <motion.section
        className="exam-checklist-section"
        aria-label="October Internal Subjects Checklist"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
      >
        <div className="checklist-section-header">
          <div className="checklist-kicker">
            <span className="checklist-dot" aria-hidden="true" />
            <span className="mono">OCTOBER 2026 INTERNAL EXAM TIMETABLE</span>
          </div>
          <div className="checklist-heading-row">
            <h2>October Internal Subjects</h2>
            <span className="checklist-count-pill mono">
              05 SUBJECTS SCHEDULED
            </span>
          </div>
          <p className="checklist-sub">
            Track module completion and revise sequentially before exam day.
          </p>
        </div>

        <div className="checklist-list" role="list">
          {subjects.map((s, idx) => {
            const topics = s.units.flatMap((u) => u.topics);
            const done = ready
              ? topics.filter((t) => completed.includes(t.id)).length
              : 0;
            const pct =
              topics.length > 0
                ? Math.round((done / topics.length) * 100)
                : 0;
            const isComplete = done === topics.length && topics.length > 0;
            const dateDisplay = s.examDate
              ? formatExamDate(s.examDate)
              : "October 2026";

            return (
              <motion.div
                key={s.id}
                role="listitem"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.04 * idx }}
              >
                <Link
                  href={`/subjects/${s.id}`}
                  className={`checklist-row ${isComplete ? "is-complete" : ""}`}
                >
                  <div className="checklist-row-left">
                    <div
                      className={`checklist-check-circle ${isComplete ? "is-checked" : ""}`}
                      aria-label={isComplete ? "Completed" : `Step ${idx + 1}`}
                    >
                      {isComplete ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <span className="mono">{idx + 1}</span>
                      )}
                    </div>

                    <div className="checklist-row-info">
                      <div className="checklist-meta-row">
                        <span className="checklist-slot-badge mono">
                          {s.slot || `Slot ${String.fromCharCode(65 + idx)}`}
                        </span>
                        <span className="checklist-date-badge mono">
                          <Calendar size={12} aria-hidden="true" />
                          {dateDisplay}
                        </span>
                        <span className="checklist-code-badge mono">
                          {s.code}
                        </span>
                      </div>
                      <h3 className="checklist-row-title">{s.name}</h3>
                    </div>
                  </div>

                  <div className="checklist-row-right">
                    <div className="checklist-progress-meta">
                      <span className="checklist-topic-count mono">
                        {ready ? `${done}/${topics.length}` : "—"} topics
                      </span>
                      <span className="checklist-percent mono">
                        {ready ? `${pct}%` : "0%"}
                      </span>
                    </div>
                    <div
                      className="checklist-progress-rail"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="checklist-progress-bar"
                        style={{ width: `${ready ? pct : 0}%` }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
