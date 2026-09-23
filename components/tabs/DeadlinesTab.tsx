"use client";

import React, { useState } from "react";
import { useStudyHub } from "@/lib/store";
import { DeadlineItem } from "@/lib/types";
import { Clock, Plus, CheckCircle2, Circle, AlertCircle, Calendar, Sparkles, X } from "lucide-react";
import { cn, getDaysRemaining, formatDate } from "@/lib/utils";
import { fireCelebrationConfetti } from "@/lib/confetti";

export function DeadlinesTab() {
  const { deadlines, courses, toggleDeadlineStatus, addDeadline } = useStudyHub();
  const [filterType, setFilterType] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New deadline form state
  const [title, setTitle] = useState("");
  const [formCourse, setFormCourse] = useState(courses[0]?.id || "cs301");
  const [formType, setFormType] = useState<DeadlineItem["type"]>("assignment");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<DeadlineItem["priority"]>("high");
  const [weightPercent, setWeightPercent] = useState("10");
  const [notes, setNotes] = useState("");

  const filtered = deadlines.filter((item) => {
    if (filterType === "all") return true;
    if (filterType === "completed") return item.status === "completed";
    if (filterType === "pending") return item.status !== "completed";
    return item.type === filterType;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    const courseObj = courses.find((c) => c.id === formCourse);
    addDeadline({
      courseId: formCourse,
      courseCode: courseObj?.code || "CS 301",
      title,
      type: formType,
      dueDate: new Date(dueDate).toISOString(),
      priority,
      weightPercent: Number(weightPercent) || 0,
      status: "pending",
      notes,
    });
    setTitle("");
    setNotes("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Deadlines & Exam War Room</h1>
          <p className="text-xs text-slate-400 mt-1">
            Precision countdown timers, exam syllabus checkpoints, and submission tracking.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Deadline</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["all", "pending", "exam", "assignment", "project", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer",
              filterType === tab
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Deadlines List */}
      <div className="space-y-3">
        {sorted.map((item) => {
          const remaining = getDaysRemaining(item.dueDate);
          const isDone = item.status === "completed";
          const isUrgent = !isDone && remaining.days <= 1 && !remaining.isPast;

          return (
            <div
              key={item.id}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 backdrop-blur-sm transition-all shadow-md",
                isDone
                  ? "border-slate-800/60 bg-slate-950/40 opacity-60"
                  : isUrgent
                  ? "border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900"
                  : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
              )}
            >
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => {
                    toggleDeadlineStatus(item.id);
                    if (!isDone) fireCelebrationConfetti();
                  }}
                  className="mt-1 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Circle className="h-5 w-5 hover:stroke-emerald-400" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs font-black text-indigo-400 border border-indigo-500/20">
                      {item.courseCode}
                    </span>

                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        item.priority === "high"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : item.priority === "medium"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      )}
                    >
                      {item.priority} Priority
                    </span>

                    {item.weightPercent ? (
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                        {item.weightPercent}% of Final Grade
                      </span>
                    ) : null}
                  </div>

                  <h3
                    className={cn(
                      "text-sm font-bold text-white",
                      isDone && "line-through text-slate-500"
                    )}
                  >
                    {item.title}
                  </h3>

                  {item.notes && <p className="text-xs text-slate-400">{item.notes}</p>}
                </div>
              </div>

              {/* Countdown Badge & Date */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                <span
                  className={cn(
                    "rounded-xl px-3 py-1 text-xs font-black border",
                    isDone
                      ? "bg-slate-800 text-slate-400 border-slate-700"
                      : remaining.isPast
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : isUrgent
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                      : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                  )}
                >
                  {isDone
                    ? "Completed ✨"
                    : remaining.isPast
                    ? "Past Due"
                    : remaining.days > 0
                    ? `${remaining.days}d ${remaining.hours}h left`
                    : `${remaining.hours}h left`}
                </span>

                <span className="text-[11px] text-slate-500 mt-1 font-mono">
                  {formatDate(item.dueDate)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deadline Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Add Task / Exam</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Exam on Concurrency & Memory"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Course</label>
                  <select
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as DeadlineItem["type"])}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="exam">Exam</option>
                    <option value="assignment">Assignment</option>
                    <option value="project">Project</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Due Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as DeadlineItem["priority"])}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Notes / Details</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Chapters, submission formats, link to portal..."
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all cursor-pointer"
              >
                Save Deadline
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
