"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Asterisk,
  Check,
  Clock3,
  FileText,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { subjects } from "@/lib/curriculum";
import { formatExamDate, validExamDate } from "@/lib/study-progress";
import { useProgress } from "./StudyState";
import { ActionLink, Eyebrow, ProgressMarks, SectionTitle } from "./Primitives";
import { OnboardingBanner } from "./onboarding/OnboardingBanner";
import { SyllabusTracker } from "./onboarding/SyllabusTracker";

export function Today() {
  const { completed, ready, storageError, recommendation, examDates, today } =
    useProgress();

  const { subject, unit, topic } = recommendation ?? {};

  const nearestExam = ready
    ? subjects
        .map((s) => ({ subject: s, date: examDates[s.id] }))
        .filter((exam) => validExamDate(exam.date) && exam.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))[0]
    : undefined;

  const mathTopics = subjects[0].units.flatMap((u) => u.topics);
  const done = mathTopics.filter((t) => completed.includes(t.id)).length;

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
    <>
      <div className="page-kicker">
        <Eyebrow>YOUR PERSONAL STUDY SPACE</Eyebrow>
        <span className="sample-label">KTU · SAMPLE CURRICULUM</span>
      </div>

      <section className="today-heading">
        <h1>
          A little focus.
          <br />
          <span>A lot further.</span>
        </h1>
        <div className="heading-aside">
          <span className="handwritten">you’ve got this.</span>
          <ArrowDownRight size={49} strokeWidth={1.3} aria-hidden="true" />
        </div>
      </section>

      <OnboardingBanner />

      <div className="today-grid">
        <motion.section
          className="study-feature"
          aria-labelledby="next-topic"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="feature-top" variants={itemVariants}>
            <span className="pill">
              <span className="tiny-dot" />
              YOUR NEXT MOVE
            </span>
            <span className="mono">01 / FOCUS</span>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Eyebrow>
              {!ready ? "YOUR STUDY PLAN" : (subject?.short ?? "LOOK AT YOU GO")}
              <span className="label-divider">/</span>
              {unit
                ? `UNIT ${String(subject!.units.indexOf(unit) + 1).padStart(2, "0")}`
                : ready
                  ? "ALL DONE"
                  : "LOADING"}
            </Eyebrow>
          </motion.div>

          <motion.h2 id="next-topic" variants={itemVariants}>
            {!ready
              ? "Finding your place."
              : (unit?.title ?? "All topics complete.")}
          </motion.h2>

          <motion.p className="topic-caption" variants={itemVariants}>
            {!ready
              ? "Reading your progress on this device…"
              : (topic?.title ??
                "You’ve finished every topic in this curriculum. Your progress is saved; revisit a subject whenever you like.")}
          </motion.p>

          <motion.div className="feature-bottom" variants={itemVariants}>
            {!ready ? (
              <button className="action" disabled>
                LOADING YOUR PROGRESS
              </button>
            ) : topic && subject ? (
              <ActionLink href={`/study/${subject.id}?topic=${topic.id}`}>
                STUDY NOW
              </ActionLink>
            ) : (
              <ActionLink href="/subjects">EXPLORE SUBJECTS</ActionLink>
            )}
            {topic && (
              <span className="time-note">
                <Clock3 size={17} />
                {topic?.minutes ?? 0} MIN
                <span>One topic. You can do this.</span>
              </span>
            )}
          </motion.div>

          {recommendation && (
            <motion.p
              className="recommendation-reason"
              variants={itemVariants}
            >
              {recommendation.examDate
                ? `Next exam: ${formatExamDate(recommendation.examDate)}`
                : "Next incomplete topic · curriculum order"}
            </motion.p>
          )}

          <Asterisk
            className="feature-asterisk"
            size={165}
            strokeWidth={1.1}
            aria-hidden="true"
          />
        </motion.section>

        <aside className="side-notes">
          <motion.section
            className="exam-note"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 26,
              delay: 0.08,
            }}
          >
            <div className="note-heading">
              <Eyebrow>ON THE HORIZON</Eyebrow>
              <span className="small-tag">YOUR DATES</span>
            </div>
            <h2>
              Next up.
              <br />
              Not right now.
            </h2>
            <p>
              {!ready
                ? "Loading exam dates…"
                : nearestExam
                  ? `${nearestExam.subject.short} · Exam`
                  : "No upcoming exam dates set."}
            </p>
            {nearestExam ? (
              <div className="exam-date">
                <strong>
                  {Number(nearestExam.date.slice(8))}
                  <span>
                    {formatExamDate(nearestExam.date)
                      .split(" ")[1]
                      .toUpperCase()}
                  </span>
                </strong>
                <span>{formatExamDate(nearestExam.date)}</span>
              </div>
            ) : (
              <p className="exam-empty">
                Set a date on a subject to help decide what comes first.
              </p>
            )}
            <ActionLink
              secondary
              href={
                nearestExam
                  ? `/subjects/${nearestExam.subject.id}#exam-heading`
                  : "/subjects"
              }
            >
              {nearestExam ? "View subject & exam" : "Choose a subject"}
            </ActionLink>
          </motion.section>

          <div className="margin-note">
            <Asterisk size={32} aria-hidden="true" />
            <p>
              You don’t have to finish
              <br />
              <strong>everything today.</strong>
            </p>
          </div>
        </aside>
      </div>

      <SyllabusTracker />

      <motion.section
        className="home-subjects"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      >
        <SectionTitle
          number="01"
          title="Your subjects"
          href="/subjects"
          link="All six subjects"
        />
        <div className="subject-strip">
          {subjects.slice(0, 3).map((s, i) => (
            <Link
              href={`/subjects/${s.id}`}
              className="subject-teaser"
              key={s.id}
            >
              <span className={`mini-symbol ${s.color}`} aria-hidden="true">
                {s.symbol}
              </span>
              <div>
                <span className="mono">
                  0{i + 1} / {s.code}
                </span>
                <h3>{s.short}</h3>
                <span className="muted">{s.units.length} units to explore</span>
              </div>
              <ArrowUpRight size={22} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </motion.section>

      <motion.div
        className="lower-grid"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      >
        <section className="progress-note">
          <SectionTitle number="02" title="Little wins add up" />
          <div className="progress-copy">
            <strong>
              {ready ? String(done).padStart(2, "0") : "—"}
              <span>/{mathTopics.length}</span>
            </strong>
            <p>
              Mathematics topics complete.
              <br />A little closer than yesterday.
            </p>
          </div>
          <ProgressMarks done={done} total={mathTopics.length} />
          <span className="muted">
            <Check size={15} />{" "}
            {storageError
              ? "Progress kept for this visit · storage unavailable"
              : "Your progress · saved on this device"}
          </span>
        </section>

        <section className="resources-note">
          <SectionTitle number="03" title="On your desk" />
          <Link
            href="/subjects/mathematics#resources"
            className="resource-row"
          >
            <FileText size={22} />
            <div>
              <strong>Differential equations</strong>
              <span>Resource collection · Mathematics</span>
            </div>
            <ArrowUpRight size={20} />
          </Link>
          <Link
            href="/subjects/physics#resources"
            className="resource-row"
          >
            <FileText size={22} />
            <div>
              <strong>Oscillations & waves</strong>
              <span>Resource collection · Physics</span>
            </div>
            <ArrowUpRight size={20} />
          </Link>
        </section>
      </motion.div>

      <motion.div
        className="closing-line"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.25 }}
      >
        <span>THE BIG PICTURE CAN WAIT.</span>
        <p>
          Start with <em>one thing.</em>
          <Asterisk aria-hidden="true" />
        </p>
      </motion.div>
    </>
  );
}
