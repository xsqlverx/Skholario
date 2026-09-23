"use client";

import React from "react";
import { useStudyHub } from "@/lib/store";
import { 
  Clock, 
  BookOpen, 
  Flame, 
  ArrowUpRight, 
  CheckCircle2, 
  Circle, 
  FolderDown, 
  Headphones, 
  Users, 
  Sparkles,
  ChevronRight,
  ThumbsUp
} from "lucide-react";
import { cn, getDaysRemaining } from "@/lib/utils";
import { fireCelebrationConfetti } from "@/lib/confetti";

export function DashboardTab() {
  const { 
    courses, 
    deadlines, 
    resources, 
    buddies, 
    setActiveTab, 
    toggleDeadlineStatus, 
    addAttendance,
    upvoteResource,
    userStudyMinutes 
  } = useStudyHub();

  const pendingDeadlines = deadlines.filter((d) => d.status !== "completed");
  const upcomingSorted = [...pendingDeadlines].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const totalClasses = courses.reduce((acc, c) => acc + c.attendance.total, 0);
  const totalAttended = courses.reduce((acc, c) => acc + c.attendance.attended, 0);
  const avgAttendance = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-950 p-6 md:p-8 backdrop-blur-md">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Midterm Season Prep Mode</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Ready to crush your exams, Alex? 🚀
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              You have <strong className="text-amber-400">{pendingDeadlines.length} tasks</strong> due this week, 
              and <strong className="text-emerald-400">{buddies.length} friends</strong> are currently studying in the virtual lounge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("lounge")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer"
            >
              <Headphones className="h-4 w-4" />
              <span>Join Study Lounge</span>
            </button>
            <button
              onClick={() => setActiveTab("deadlines")}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Clock className="h-4 w-4 text-amber-400" />
              <span>View Deadlines</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Attendance */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Avg Attendance</span>
            <BookOpen className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{avgAttendance}%</div>
          <div className="text-[11px] text-emerald-400 mt-1">Above 75% requirement</div>
        </div>

        {/* Pending Deadlines */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Pending Deadlines</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingDeadlines.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Next due in 36h</div>
        </div>

        {/* Study Time */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Focus Time Today</span>
            <Flame className="h-4 w-4 text-orange-400 fill-orange-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {Math.floor(userStudyMinutes / 60)}h {userStudyMinutes % 60}m
          </div>
          <div className="text-[11px] text-indigo-400 mt-1">Top 15% on campus</div>
        </div>

        {/* Active Study Buddies */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Study Buddies Live</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{buddies.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">4 active in lounge</div>
        </div>
      </div>

      {/* Main 2-Col Layout: Deadlines & Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Deadlines & Course Attendance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Deadlines Widget */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <h2 className="font-bold text-sm text-white">Urgent Deadlines & Exam Countdown</h2>
              </div>
              <button
                onClick={() => setActiveTab("deadlines")}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                <span>All Tasks</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingSorted.slice(0, 3).map((item) => {
                const remaining = getDaysRemaining(item.dueDate);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/90 bg-slate-950/60 p-3.5 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => {
                          toggleDeadlineStatus(item.id);
                          fireCelebrationConfetti();
                        }}
                        className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                      >
                        <Circle className="h-5 w-5" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                            {item.courseCode}
                          </span>
                          <span className="text-xs font-semibold text-white">{item.title}</span>
                        </div>
                        {item.notes && <p className="text-[11px] text-slate-400 mt-1">{item.notes}</p>}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                        {remaining.days > 0 ? `${remaining.days}d ${remaining.hours}h` : `${remaining.hours}h left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Course Attendance Stepper */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <h2 className="font-bold text-sm text-white">Subject Attendance & Syllabus</h2>
              </div>
              <button
                onClick={() => setActiveTab("courses")}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                <span>Manage Courses</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {courses.map((c) => {
                const percent = Math.round((c.attendance.attended / c.attendance.total) * 100);
                const isSafe = percent >= 75;
                // Skippable calculation
                const canSkip = Math.max(0, Math.floor((c.attendance.attended - 0.75 * c.attendance.total) / 0.75));

                return (
                  <div
                    key={c.id}
                    className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-extrabold text-sm text-white">{c.code}</span>
                        <div className="text-xs text-slate-400 truncate max-w-[170px]">{c.name}</div>
                      </div>
                      <span
                        className={cn(
                          "rounded-lg px-2 py-0.5 text-xs font-bold border",
                          isSafe
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}
                      >
                        {percent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn("h-1.5 rounded-full transition-all", isSafe ? "bg-emerald-500" : "bg-red-500")}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        {isSafe ? `Can skip: ${canSkip} classes` : `Below 75% threshold!`}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => addAttendance(c.id, true)}
                          className="rounded-lg bg-emerald-600/20 px-2 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all cursor-pointer"
                        >
                          + Present
                        </button>
                        <button
                          onClick={() => addAttendance(c.id, false)}
                          className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-400 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                        >
                          + Absent
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Trending Resources & Friends Studying */}
        <div className="space-y-6">
          {/* Top Shared Notes in Vault */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderDown className="h-4 w-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Top Shared Notes</h3>
              </div>
              <button
                onClick={() => setActiveTab("resources")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Vault
              </button>
            </div>

            <div className="space-y-3">
              {resources.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between text-[11px] text-indigo-400 font-semibold mb-1">
                    <span>{r.courseCode}</span>
                    <span className="text-slate-400">{r.fileSize}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{r.title}</h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span>By {r.author}</span>
                    <button
                      onClick={() => upvoteResource(r.id)}
                      className="flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 hover:text-indigo-400 transition-all cursor-pointer"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{r.upvotes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Study Buddy Lounge Card */}
          <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 to-slate-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Live Lounge</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Maya, Jordan, Chloe & Samir are currently in focus mode.
            </p>

            <button
              onClick={() => setActiveTab("lounge")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Headphones className="h-4 w-4" />
              <span>Launch Focus Lounge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
