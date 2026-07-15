// src/types/index.ts

export type TopicStatus = "NOT_STARTED" | "LEARNING" | "MASTERED";

export interface Subject {
  id: string;
  name: string;
  weightage: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  status: TopicStatus;
  lastStudiedAt?: number;
}

export type ResourceType =
  | "LECTURE"
  | "NOTES"
  | "PYQ"
  | "BOOK"
  | "LINK";

export type MistakeConfidence =
  | "AGAIN"
  | "HARD"
  | "GOOD"
  | "EASY";

// Used only inside PYQ Resource
export interface MistakeItem {
  id: string;
  questionId?: string;
  questionReference: string;
  notes?: string;
  difficulty?: "HARD" | "MEDIUM" | "EASY";
  status: "PENDING" | "RESOLVED";
  attempts: number;
  confidenceHistory: MistakeConfidence[];
  nextReviewDate: number;
  createdAt: number;
  updatedAt: number;
}

export interface Resource {
  id: string;
  topicId: string;
  type: ResourceType;

  title: string;
  url?: string;

  createdAt: number;

  // Lecture
  durationMinutes?: number;
  watchedMinutes?: number;
  completed?: boolean;
  lastWatchedAt?: number;

  // Notes
  markdown?: string;

  // PYQ
  totalQuestions?: number;
  correct?: number;
  incorrect?: number;
  accuracy?: number;
  mistakeItems?: MistakeItem[]; // Only for PYQ resources
}

export interface Revision {
  id: string;
  topicId: string;
  nextReviewDate: number;
  interval: number;
  easeFactor: number;
  reviewCount: number;
}

export interface Setting {
  key: string;
  value: unknown;
}

export type TaskType =
  | "LECTURE"
  | "NOTES"
  | "PYQ"
  | "REVISION"
  | "MISTAKE";

export interface TodayTask {
  id: string;
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;

  type: TaskType;

  priority: 1 | 2 | 3 | 4;

  title: string;
  actionLabel: string;

  // Estimated time to finish this task
  estimatedMinutes: number;
  
  // Optional yield score for advanced sorting/UI
  yieldScore?: number; 
}

export interface SubjectMetrics {
  subjectId: string;
  subjectName: string;
  weightage: number;
  totalTopics: number;
  completedTopics: number;
  subjectProgress: number;
  lectureProgress: number;
  notesProgress: number;
  pyqProgress: number;
  accuracy: number;
  studyTimeMinutes: number;
}

export interface AnalyticsInsights {
  strongestSubject: string | null;
  weakestSubject: string | null;
  mostStudiedSubject: string | null;
  leastStudiedSubject: string | null;
}

export interface AnalyticsSnapshot {
  overallProgress: number;
  totalSubjects: number;
  completedSubjects: number;
  totalTopics: number;
  completedTopics: number;
  totalStudyTimeMinutes: number;
  totalPyqsSolved: number;
  overallAccuracy: number;
  dueRevisionsCount: number;
  totalMistakes: number;
  pendingMistakes: number;
  resolvedMistakes: number;
  mistakeResolutionRate: number;
  averageAttempts: number;
  dueMistakesToday: number;
  subjectMetrics: SubjectMetrics[];
  insights: AnalyticsInsights;
}

export type TimelineEventType =
  | "LECTURE_STARTED"
  | "LECTURE_COMPLETED"
  | "NOTES_ADDED"
  | "PYQ_COMPLETED"
  | "MISTAKE_LOGGED"
  | "MISTAKE_REVIEWED"
  | "REVISION_DONE"
  | "MASTERED";

export interface TimelineEvent {
  id: string;
  topicId: string;

  type: TimelineEventType;

  title: string;
  description?: string;

  createdAt: number;
}