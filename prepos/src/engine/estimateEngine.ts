// src/engine/estimateEngine.ts

import type { TodayTask, Resource } from "../types";

/**
 * Estimate remaining lecture time.
 */
export function estimateLecture(resource?: Resource): number {
  if (!resource) return 60;

  const duration = resource.durationMinutes ?? 60;
  const watched = resource.watchedMinutes ?? 0;

  return Math.max(duration - watched, 0);
}

/**
 * Estimate notes creation/revision time.
 */
export function estimateNotes(_resource?: Resource): number {
  return 30;
}

/**
 * Estimate PYQ solving time.
 */
export function estimatePyq(resource?: Resource): number {
  if (!resource) return 30;

  const totalQuestions = resource.totalQuestions ?? 15;

  return totalQuestions * 2;
}

/**
 * Standard revision estimate.
 */
export function estimateRevision(): number {
  return 20;
}

/**
 * Standard mistake review estimate.
 */
export function estimateMistake(): number {
  return 10;
}

/**
 * Generic task estimator.
 */
export function estimateTask(
  task: TodayTask,
  resource?: Resource
): number {
  switch (task.type) {
    case "LECTURE":
      return estimateLecture(resource);

    case "NOTES":
      return estimateNotes(resource);

    case "PYQ":
      return estimatePyq(resource);

    case "REVISION":
      return estimateRevision();

    case "MISTAKE":
      return estimateMistake();

    default:
      return 30;
  }
}