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
}

export interface Revision {
  id: string;
  topicId: string;
  nextReviewDate: number;
  interval: number;
  easeFactor: number;
  reviewCount: number;
}

export interface Mistake {
  id: string;
  topicId: string;
  note: string;
  isResolved: boolean;
  createdAt: number;
}

export interface Setting {
  key: string;
  value: string | number | boolean;
}