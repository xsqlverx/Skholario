"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { formatExamDate, validExamDate } from "@/lib/study-progress";
import { useProgress } from "./StudyState";

const MotionButton = motion.create("button");

export function ExamDateEditor({ subjectId }: { subjectId: string }) {
  const { examDates, ready, today, setExamDate, storageError } = useProgress();
  const shouldReduceMotion = useReducedMotion();
  const saved = examDates[subjectId] ?? "";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validExamDate(draft)) {
      setMessage("Choose a valid exam date.");
      return;
    }
    setExamDate(subjectId, draft);
    setEditing(false);
    setMessage("Exam date updated.");
  }

  return (
    <section className="exam-settings" aria-labelledby="exam-heading">
      <div>
        <h2 id="exam-heading">Your exam date</h2>
        <p>
          {!ready
            ? "Loading your saved date…"
            : saved
              ? formatExamDate(saved)
              : "No date set. Study in curriculum order."}
        </p>
        <p className="muted">
          {saved && saved < today
            ? "This date has passed. Update it to prioritize this subject."
            : "The nearest upcoming exam gets study priority."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.form
            key="edit-form"
            className="exam-form"
            onSubmit={save}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
          >
            <label htmlFor="exam-date">Exam date</label>
            <input
              autoFocus
              id="exam-date"
              name="exam-date"
              type="date"
              min="1900-01-01"
              max="9999-12-31"
              required
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setMessage("");
              }}
            />
            <div className="exam-form-actions">
              <MotionButton
                type="submit"
                className="action"
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                SAVE DATE
              </MotionButton>
              <MotionButton
                type="button"
                className="text-link"
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                onClick={() => {
                  setEditing(false);
                  setMessage("");
                }}
              >
                Cancel
              </MotionButton>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="action-buttons"
            className="exam-form-actions"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.14 }}
          >
            <MotionButton
              disabled={!ready}
              className="text-link"
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              onClick={() => {
                setDraft(saved);
                setMessage("");
                setEditing(true);
              }}
            >
              {saved ? "Edit exam date" : "Set exam date"}
            </MotionButton>
            {saved && (
              <MotionButton
                disabled={!ready}
                className="text-link"
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                onClick={() => {
                  setExamDate(subjectId, "");
                  setMessage("Exam date removed. Study priority updated.");
                }}
              >
                Remove date
              </MotionButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p role="status" className="exam-feedback">
        {message}
        {storageError &&
          " Changes are kept for this visit only; browser storage is unavailable."}
      </p>
    </section>
  );
}
