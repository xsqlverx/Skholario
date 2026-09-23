"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Course, ResourceItem, DeadlineItem, StudyBuddy, FlashcardDeck, DiscussionPost } from "./types";
import { INITIAL_COURSES, INITIAL_RESOURCES, INITIAL_DEADLINES, INITIAL_STUDY_BUDDIES, INITIAL_DECKS, INITIAL_POSTS } from "./mock-data";
import { playSuccessChime } from "./audio";

interface StudyStoreType {
  courses: Course[];
  resources: ResourceItem[];
  deadlines: DeadlineItem[];
  buddies: StudyBuddy[];
  decks: FlashcardDeck[];
  posts: DiscussionPost[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Actions
  addAttendance: (courseId: string, attended: boolean) => void;
  toggleDeadlineStatus: (deadlineId: string) => void;
  addDeadline: (deadline: Omit<DeadlineItem, "id">) => void;
  upvoteResource: (resourceId: string) => void;
  addResource: (resource: Omit<ResourceItem, "id" | "downloads" | "upvotes">) => void;
  toggleCardMastered: (deckId: string, cardId: string) => void;
  addPost: (post: Omit<DiscussionPost, "id" | "timestamp" | "upvotes" | "repliesCount">) => void;
  upvotePost: (postId: string) => void;
  userStudyMinutes: number;
  incrementStudyMinutes: (mins: number) => void;
}

const StudyContext = createContext<StudyStoreType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>(INITIAL_DEADLINES);
  const [buddies] = useState<StudyBuddy[]>(INITIAL_STUDY_BUDDIES);
  const [decks, setDecks] = useState<FlashcardDeck[]>(INITIAL_DECKS);
  const [posts, setPosts] = useState<DiscussionPost[]>(INITIAL_POSTS);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userStudyMinutes, setUserStudyMinutes] = useState<number>(145);

  // Load from localStorage on client mount
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedDeadlines = localStorage.getItem("studysync_deadlines");
        if (savedDeadlines) setDeadlines(JSON.parse(savedDeadlines));

        const savedCourses = localStorage.getItem("studysync_courses");
        if (savedCourses) setCourses(JSON.parse(savedCourses));

        const savedMinutes = localStorage.getItem("studysync_minutes");
        if (savedMinutes) setUserStudyMinutes(Number(savedMinutes));
      } catch {
        // ignore storage errors
      }
    });
  }, []);

  const addAttendance = (courseId: string, attended: boolean) => {
    setCourses((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          attendance: {
            ...c.attendance,
            total: c.attendance.total + 1,
            attended: attended ? c.attendance.attended + 1 : c.attendance.attended,
          },
        };
      });
      localStorage.setItem("studysync_courses", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleDeadlineStatus = (deadlineId: string) => {
    setDeadlines((prev) => {
      const updated = prev.map((dl) => {
        if (dl.id !== deadlineId) return dl;
        const newStatus: DeadlineItem["status"] = dl.status === "completed" ? "pending" : "completed";
        if (newStatus === "completed") {
          playSuccessChime();
        }
        return { ...dl, status: newStatus };
      });
      localStorage.setItem("studysync_deadlines", JSON.stringify(updated));
      return updated;
    });
  };

  const addDeadline = (deadline: Omit<DeadlineItem, "id">) => {
    const newItem: DeadlineItem = {
      ...deadline,
      id: `dl-${Date.now()}`,
    };
    setDeadlines((prev) => {
      const updated = [newItem, ...prev];
      localStorage.setItem("studysync_deadlines", JSON.stringify(updated));
      return updated;
    });
  };

  const upvoteResource = (resourceId: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  const addResource = (resource: Omit<ResourceItem, "id" | "downloads" | "upvotes">) => {
    const newItem: ResourceItem = {
      ...resource,
      id: `res-${Date.now()}`,
      downloads: 0,
      upvotes: 1,
    };
    setResources((prev) => [newItem, ...prev]);
  };

  const toggleCardMastered = (deckId: string, cardId: string) => {
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deckId) return d;
        return {
          ...d,
          cards: d.cards.map((c) => (c.id === cardId ? { ...c, mastered: !c.mastered } : c)),
        };
      })
    );
  };

  const addPost = (post: Omit<DiscussionPost, "id" | "timestamp" | "upvotes" | "repliesCount">) => {
    const newPost: DiscussionPost = {
      ...post,
      id: `post-${Date.now()}`,
      timestamp: "Just now",
      upvotes: 0,
      repliesCount: 0,
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const upvotePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  };

  const incrementStudyMinutes = (mins: number) => {
    setUserStudyMinutes((prev) => {
      const updated = prev + mins;
      localStorage.setItem("studysync_minutes", String(updated));
      return updated;
    });
  };

  return (
    <StudyContext.Provider
      value={{
        courses,
        resources,
        deadlines,
        buddies,
        decks,
        posts,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        addAttendance,
        toggleDeadlineStatus,
        addDeadline,
        upvoteResource,
        addResource,
        toggleCardMastered,
        addPost,
        upvotePost,
        userStudyMinutes,
        incrementStudyMinutes,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudyHub() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error("useStudyHub must be used within a StudyProvider");
  }
  return context;
}
