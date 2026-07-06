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

export async function saveLecture(
  topicId: string,
  lecture: LectureData
): Promise<void> {
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
    lastWatchedAt:
  lecture.watchedMinutes && lecture.watchedMinutes > 0
    ? (lecture.lastWatchedAt ?? Date.now())
    : undefined,
  };

  await db.resources.add(resource);
}

export async function getLecture(
  topicId: string
): Promise<Resource | undefined> {
  return db.resources
    .where("topicId")
    .equals(topicId)
    .filter((resource) => resource.type === "LECTURE")
    .first();
}

export async function updateLecture(
  topicId: string,
  lecture: Partial<LectureData>
): Promise<number> {
  const existingLecture = await getLecture(topicId);

  if (!existingLecture) {
    throw new Error(`Lecture not found for topic: ${topicId}`);
  }

  const updates: Partial<Resource> = {
    ...(lecture.title !== undefined && { title: lecture.title }),
    ...(lecture.url !== undefined && { url: lecture.url }),
    ...(lecture.durationMinutes !== undefined && {
      durationMinutes: lecture.durationMinutes,
    }),
    ...(lecture.watchedMinutes !== undefined && {
      watchedMinutes: lecture.watchedMinutes,
    }),
    ...(lecture.completed !== undefined && {
      completed: lecture.completed,
    }),
    ...(lecture.watchedMinutes !== undefined && {
  lastWatchedAt:
    lecture.watchedMinutes > 0
      ? (lecture.lastWatchedAt ?? Date.now())
      : undefined,
}),
  };

  return db.resources.update(existingLecture.id, updates);
}

export async function deleteLecture(
  topicId: string
): Promise<void> {
  const existingLecture = await getLecture(topicId);

  if (!existingLecture) return;

  await db.resources.delete(existingLecture.id);
}

/**
 * Returns all lecture resources.
 * Used by TodayTaskEngine.
 */
export async function getAllLectures(): Promise<Resource[]> {
  return db.resources
    .where('type')
    .equals('LECTURE')
    .toArray();
}