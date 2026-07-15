// src/engine/lectureProgress.ts
import type { Resource } from '../types';

/**
 * Returns the completion percentage (0-100) of a single lecture resource.
 */
export function getLectureCompletionPercent(lecture: Resource): number {
  if (lecture.completed) return 100;
  const duration = lecture.durationMinutes || 0;
  const watched = lecture.watchedMinutes || 0;
  return duration > 0 ? Math.min(100, Math.round((watched / duration) * 100)) : 0;
}

/**
 * Averages completion percentage across all lecture resources for a topic.
 * A topic with zero lectures has 0% lecture progress.
 */
export function calculateLectureSetProgress(lectures: Resource[]): number {
  if (lectures.length === 0) return 0;
  const total = lectures.reduce((sum, l) => sum + getLectureCompletionPercent(l), 0);
  return Math.round(total / lectures.length);
}

/**
 * True only if the topic has at least one lecture and every lecture is complete.
 */
export function areAllLecturesCompleted(lectures: Resource[]): boolean {
  return lectures.length > 0 && lectures.every((l) => getLectureCompletionPercent(l) >= 100);
}

/** Sum of watched minutes across all lectures for a topic (for study-time stats). */
export function sumWatchedMinutes(lectures: Resource[]): number {
  return lectures.reduce((sum, l) => sum + (l.watchedMinutes || 0), 0);
}
