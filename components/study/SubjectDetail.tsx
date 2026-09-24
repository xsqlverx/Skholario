"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, FileText } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Subject } from "@/lib/curriculum";
import { useCurriculum } from "@/lib/curriculum-store";
import { useProgress } from "./StudyState";
import { ActionLink, Eyebrow, ProgressMarks, SectionTitle } from "./Primitives";
import { firstIncomplete } from "@/lib/study-progress";
import { ExamDateEditor } from "./ExamDateEditor";

export function SubjectDetail({ subject: initialSubject }: { subject: Subject }) {
  const { completed, ready } = useProgress();
  const { findSubject: findInCurriculum, ready: curriculumReady } = useCurriculum();
  const subject = curriculumReady
    ? findInCurriculum(initialSubject.id) || initialSubject
    : initialSubject;
  const shouldReduceMotion = useReducedMotion();
  const topics = subject.units.flatMap((u) => u.topics);
  const next = firstIncomplete(subject, completed)?.topic;
  const done = topics.filter((t) => completed.includes(t.id)).length;

  return (
    <>
      <Link className="back-link" href="/subjects">
        <ArrowLeft size={18} />
        All subjects
      </Link>

      <div className="detail-heading">
        <div>
          <Eyebrow>{subject.code} / SAMPLE CURRICULUM</Eyebrow>
          <h1>
            {subject.short}
            <span className="red-text">.</span>
          </h1>
          <p>{subject.name}</p>
        </div>
        <span className={`detail-symbol ${subject.color}`} aria-hidden="true">
          {subject.symbol}
        </span>
      </div>

      <div className="detail-summary">
        <div>
          <span className="mono">
            {ready ? done : "—"} OF {topics.length} TOPICS COMPLETE
          </span>
          <ProgressMarks done={done} total={topics.length} />
        </div>
        {!ready ? (
          <button disabled className="action">
            LOADING PROGRESS
          </button>
        ) : next ? (
          <ActionLink href={`/study/${subject.id}?topic=${next.id}`}>
            CONTINUE STUDYING
          </ActionLink>
        ) : (
          <span className="complete-label">
            <Check />
            All topics complete
          </span>
        )}
      </div>

      <ExamDateEditor subjectId={subject.id} />

      <SectionTitle number="01" title="Your path through it" />

      <div className="curriculum-map">
        {subject.units.map((unit, index) => {
          const count = unit.topics.filter((t) =>
            completed.includes(t.id),
          ).length;
          const current = unit.topics.some((t) => t.id === next?.id);
          const isComplete = count === unit.topics.length;

          return (
            <section
              className={`unit-row ${current ? "current-unit" : ""}`}
              key={unit.id}
            >
              <div className="unit-number">
                <span className="mono">UNIT</span>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <span className="unit-status">
                  {isComplete
                    ? "✓ COMPLETE"
                    : current
                      ? "↗ YOU ARE HERE"
                      : "TO EXPLORE"}
                </span>
              </div>
              <div className="unit-content">
                <h2>{unit.title}</h2>
                <ul>
                  {unit.topics.map((topic) => {
                    const isTopicDone = completed.includes(topic.id);
                    const isNext = topic.id === next?.id;
                    const stateLabel = !ready
                      ? "LOADING"
                      : isTopicDone
                        ? "COMPLETE"
                        : isNext
                          ? "NEXT"
                          : "NOT STARTED";

                    return (
                      <li key={topic.id}>
                        <Link href={`/study/${subject.id}?topic=${topic.id}`}>
                          <motion.span
                            className={`topic-check ${isTopicDone ? "is-done" : ""}`}
                            initial={false}
                            animate={
                              shouldReduceMotion
                                ? undefined
                                : isTopicDone
                                  ? { scale: [0.85, 1] }
                                  : { scale: 1 }
                            }
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 25,
                            }}
                          >
                            {isTopicDone && (
                              <motion.span
                                initial={
                                  shouldReduceMotion ? false : { scale: 0 }
                                }
                                animate={{ scale: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 25,
                                }}
                              >
                                <Check size={14} />
                              </motion.span>
                            )}
                          </motion.span>
                          <span className="topic-title">
                            {topic.title}
                            {topic.sourcePages && topic.sourcePages.length > 0 && (
                              <span
                                className="topic-source-pill mono"
                                title={`Source: Syllabus PDF page ${topic.sourcePages.join(", ")}`}
                              >
                                p. {topic.sourcePages.join("–")}
                              </span>
                            )}
                            <span className="topic-state">{stateLabel}</span>
                          </span>
                          <span className="topic-minutes">
                            {topic.minutes} min
                          </span>
                          <span className="inline-flex">
                            <ArrowUpRight size={18} />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      <section id="resources" className="detail-resources">
        <SectionTitle number="02" title="Room for your resources" />
        <div className="resource-empty">
          <FileText size={32} />
          <div>
            <h3>Your notes belong here.</h3>
            <p>
              PDFs, past papers and helpful links will live alongside each
              topic. Resource uploads are coming in a later pass.
            </p>
          </div>
          <span className="small-tag">NOT ADDED YET</span>
        </div>
      </section>
    </>
  );
}
