export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  room: string;
  credits: number;
  color: string; // Tailwind gradient or color key
  attendance: {
    attended: number;
    total: number;
    minRequiredPercent: number;
  };
  syllabusProgress: number; // 0 - 100
  nextClass?: string;
  driveUrl?: string;
}

export interface ResourceItem {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  description: string;
  type: "notes" | "cheatsheet" | "past_paper" | "slides" | "link";
  author: string;
  authorAvatar?: string;
  uploadDate: string;
  downloads: number;
  upvotes: number;
  tags: string[];
  fileSize?: string;
  externalUrl?: string;
}

export interface DeadlineItem {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  type: "exam" | "assignment" | "project" | "quiz";
  dueDate: string; // ISO date
  weightPercent?: number;
  status: "pending" | "in_progress" | "completed";
  priority: "high" | "medium" | "low";
  notes?: string;
}

export interface StudyBuddy {
  id: string;
  name: string;
  avatar: string;
  currentCourse: string;
  currentTopic: string;
  timeStudyingMinutes: number;
  status: "focusing" | "on_break" | "idle";
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
  difficulty?: "easy" | "medium" | "hard";
  mastered: boolean;
}

export interface FlashcardDeck {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  description: string;
  cards: Flashcard[];
}

export interface DiscussionPost {
  id: string;
  courseCode?: string;
  author: string;
  authorAvatar: string;
  timestamp: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  repliesCount: number;
  isPinned?: boolean;
}
