"use client";

import React, { useState } from "react";
import { useStudyHub } from "@/lib/store";
import { Course } from "@/lib/types";
import { BookOpen, User, MapPin, ExternalLink, Plus, AlertCircle, CheckCircle, Calculator, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CoursesTab() {
  const { courses, addAttendance } = useStudyHub();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New course form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [room, setRoom] = useState("");
  const [credits, setCredits] = useState("4");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Course Hub & Attendance Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time 75% minimum threshold bunk calculator, syllabus milestones, and course drives.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => {
          const { attended, total, minRequiredPercent } = course.attendance;
          const currentPercent = total > 0 ? Math.round((attended / total) * 100) : 100;
          const isAboveThreshold = currentPercent >= minRequiredPercent;

          // Bunk / Skip math
          // If above threshold: can skip Math.floor((attended - 0.75 * total) / 0.75)
          // If below threshold: need to attend Math.ceil((0.75 * total - attended) / (1 - 0.75))
          const canBunk = Math.max(0, Math.floor((attended - 0.75 * total) / 0.75));
          const mustAttend = Math.max(0, Math.ceil((0.75 * total - attended) / 0.25));

          return (
            <div
              key={course.id}
              className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm transition-all hover:border-slate-700 shadow-xl"
            >
              {/* Top Accent Gradient Bar */}
              <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", course.color)} />

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-white">{course.code}</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                      {course.credits} Credits
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300 mt-0.5">{course.name}</h3>
                </div>

                <span
                  className={cn(
                    "flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black border",
                    isAboveThreshold
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                  )}
                >
                  {isAboveThreshold ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  <span>{currentPercent}%</span>
                </span>
              </div>

              {/* Course Meta Info */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-2 truncate">
                  <User className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                  <span className="truncate">{course.room}</span>
                </div>
              </div>

              {/* Attendance Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Classes: <strong className="text-white">{attended}</strong> / {total}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">Min. Required: {minRequiredPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      isAboveThreshold ? "bg-emerald-500" : "bg-red-500"
                    )}
                    style={{ width: `${Math.min(100, currentPercent)}%` }}
                  />
                </div>
              </div>

              {/* Smart Bunk Calculator Insight Box */}
              <div
                className={cn(
                  "rounded-xl p-3 text-xs mb-4 border flex items-center gap-2.5",
                  isAboveThreshold
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-red-500/10 border-red-500/20 text-red-300"
                )}
              >
                <Calculator className="h-4 w-4 shrink-0" />
                <span>
                  {isAboveThreshold
                    ? `Safe Zone: You can skip ${canBunk} more class${canBunk === 1 ? "" : "es"} without dropping below 75%.`
                    : `Critical: Attend the next ${mustAttend} consecutive class${mustAttend === 1 ? "" : "es"} to recover 75%!`}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addAttendance(course.id, true)}
                    className="rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    + Attended
                  </button>
                  <button
                    onClick={() => addAttendance(course.id, false)}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all cursor-pointer"
                  >
                    + Missed
                  </button>
                </div>

                {course.driveUrl && (
                  <a
                    href={course.driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <span>Lecture Drive</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Add New Subject</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">Course Code (e.g. CS 402)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="CS 402"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Course Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Distributed Systems"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Instructor</label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="Prof. Davis"
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Room / Hall</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Hall 302"
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Credits</label>
                <input
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={() => {
                  if (!code || !name) return;
                  // In a real app we'd dispatch to store
                  setIsModalOpen(false);
                }}
                className="w-full mt-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all cursor-pointer"
              >
                Register Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
