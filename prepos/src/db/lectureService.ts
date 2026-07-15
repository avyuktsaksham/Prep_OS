// src/db/lectureService.ts
import { db } from "./index";
import type { Resource } from "../types";

export interface LectureData {
  title: string;
  url?: string;
  durationMinutes?: number;
  watchedMinutes?: number;
  completed?: boolean;
  lastWatchedAt?: number;
}

function computeLastWatchedAt(
  watchedMinutes: number | undefined,
  fallback?: number
): number | undefined {
  return watchedMinutes && watchedMinutes > 0 ? fallback ?? Date.now() : undefined;
}

/**
 * Creates a new lecture resource for a topic. A topic can have multiple
 * lectures (e.g. a primary teacher's lecture + a backup/revision video).
 */
export async function addLecture(
  topicId: string,
  lecture: LectureData
): Promise<string> {
  const resource: Resource = {
    id: crypto.randomUUID(),
    topicId,
    type: "LECTURE",

    title: lecture.title,
    url: lecture.url,

    createdAt: Date.now(),

    durationMinutes: lecture.durationMinutes,
    watchedMinutes: lecture.watchedMinutes ?? 0,
    completed: lecture.completed ?? false,
    lastWatchedAt: computeLastWatchedAt(lecture.watchedMinutes, lecture.lastWatchedAt),
  };

  await db.resources.add(resource);
  return resource.id;
}

/** Returns every lecture resource attached to a topic. */
export async function getLecturesByTopic(topicId: string): Promise<Resource[]> {
  return db.resources
    .where("topicId")
    .equals(topicId)
    .filter((resource) => resource.type === "LECTURE")
    .toArray();
}

/** Updates a specific lecture by its resource id. */
export async function updateLectureById(
  id: string,
  lecture: Partial<LectureData>
): Promise<number> {
  const updates: Partial<Resource> = {
    ...(lecture.title !== undefined && { title: lecture.title }),
    ...(lecture.url !== undefined && { url: lecture.url }),
    ...(lecture.durationMinutes !== undefined && {
      durationMinutes: lecture.durationMinutes,
    }),
    ...(lecture.watchedMinutes !== undefined && {
      watchedMinutes: lecture.watchedMinutes,
      lastWatchedAt: computeLastWatchedAt(lecture.watchedMinutes, lecture.lastWatchedAt),
    }),
    ...(lecture.completed !== undefined && {
      completed: lecture.completed,
    }),
  };

  return db.resources.update(id, updates);
}

/** Deletes a specific lecture by its resource id. */
export async function deleteLectureById(id: string): Promise<void> {
  await db.resources.delete(id);
}

/**
 * Returns all lecture resources across every topic.
 * Used by TodayTaskEngine / AnalyticsEngine.
 */
export async function getAllLectures(): Promise<Resource[]> {
  return db.resources.where("type").equals("LECTURE").toArray();
}
