"use client";

import React, { useState } from "react";
import { useStudyHub } from "@/lib/store";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { DashboardTab } from "@/components/tabs/DashboardTab";
import { CoursesTab } from "@/components/tabs/CoursesTab";
import { ResourcesTab } from "@/components/tabs/ResourcesTab";
import { DeadlinesTab } from "@/components/tabs/DeadlinesTab";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { FlashcardsTab } from "@/components/tabs/FlashcardsTab";
import { DiscussionTab } from "@/components/tabs/DiscussionTab";
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderDown, 
  Clock, 
  Headphones, 
  Layers, 
  MessageSquare 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StudyHubApp() {
  const { activeTab, setActiveTab } = useStudyHub();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const mobileNavItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "deadlines", label: "Exams", icon: Clock },
    { id: "lounge", label: "Lounge", icon: Headphones },
    { id: "resources", label: "Vault", icon: FolderDown },
    { id: "flashcards", label: "Cram", icon: Layers },
    { id: "discussion", label: "Forum", icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <Navbar onOpenCommandPalette={() => setIsCommandOpen(true)} />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 pb-24 lg:pb-12 max-w-7xl mx-auto w-full">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "courses" && <CoursesTab />}
          {activeTab === "resources" && <ResourcesTab />}
          {activeTab === "deadlines" && <DeadlinesTab />}
          {activeTab === "lounge" && <PomodoroTimer />}
          {activeTab === "flashcards" && <FlashcardsTab />}
          {activeTab === "discussion" && <DiscussionTab />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-800 bg-slate-950/95 py-2 px-1 backdrop-blur-md lg:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-all cursor-pointer",
                isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "stroke-[2.5]" : "stroke-2")} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </div>
  );
}
