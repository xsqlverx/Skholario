"use client";

import React from "react";
import { useStudyHub } from "@/lib/store";
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderDown, 
  Clock, 
  Headphones, 
  Layers, 
  MessageSquare,
  AlertTriangle,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export function Sidebar() {
  const { activeTab, setActiveTab, deadlines, courses } = useStudyHub();

  const pendingDeadlinesCount = deadlines.filter((d) => d.status !== "completed").length;

  // Check for any attendance alerts below 75%
  const lowAttendanceCourse = courses.find(
    (c) => (c.attendance.attended / c.attendance.total) * 100 < 75
  );

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "Course Hub", icon: BookOpen, badge: courses.length },
    { id: "resources", label: "Resource Vault", icon: FolderDown },
    { id: "deadlines", label: "Deadlines & Exams", icon: Clock, badge: pendingDeadlinesCount > 0 ? pendingDeadlinesCount : undefined },
    { id: "lounge", label: "Study Lounge", icon: Headphones },
    { id: "flashcards", label: "Quick Cram", icon: Layers },
    { id: "discussion", label: "Peer Forum", icon: MessageSquare },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/60 p-4 flex flex-col justify-between hidden lg:flex">
      <div className="space-y-6">
        {/* Semester Tag */}
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 p-3 border border-slate-800/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Fall 2026 Semester</div>
            <div className="text-[11px] text-slate-400">B.Tech Computer Science</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/30 shadow-sm shadow-indigo-500/10"
                    : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4", isActive ? "text-indigo-400" : "text-slate-400")} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold",
                      isActive
                        ? "bg-indigo-500/30 text-indigo-200"
                        : "bg-slate-800 text-slate-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Alert / Stats Card */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        {lowAttendanceCourse ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Attendance Warning</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Your attendance in <strong className="text-amber-300">{lowAttendanceCourse.code}</strong> is{" "}
              {Math.round((lowAttendanceCourse.attendance.attended / lowAttendanceCourse.attendance.total) * 100)}%.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="text-[11px] text-emerald-400 font-medium">✨ Attendance is in good standing across all registered subjects!</div>
          </div>
        )}

        <div className="text-[11px] text-slate-400 text-center">
          Built for students • StudySphere Hub
        </div>
      </div>
    </aside>
  );
}
