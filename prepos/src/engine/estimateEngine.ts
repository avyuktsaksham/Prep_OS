// src/engine/estimateEngine.ts

import type { TodayTask, Resource, Revision } from "../types";

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
 * Estimates a MAX time budget for a revision, based on how well the person
 * actually knows this topic (SM-2 easeFactor + review history) — not a
 * flat number for every topic. Struggling topics get more time budgeted,
 * well-retained topics get a quick recall-check budget. Hard-capped at
 * 40 min so a single revision never eats the whole study block.
 */
export function estimateRevisionTime(revision?: Revision): number {
  if (!revision) return 20;

  let minutes = 15;

  if (revision.easeFactor < 2.0) {
    minutes += 15; // struggling — needs a deeper re-study, not just a glance
  } else if (revision.easeFactor >= 2.8) {
    minutes -= 5; // well retained — a quick recall check is enough
  }

  if (revision.reviewCount === 0) {
    minutes += 5; // first-ever revision of this topic, still unfamiliar
  }

  return Math.max(10, Math.min(minutes, 40));
}

/**
 * @deprecated use estimateRevisionTime(revision) for a data-aware estimate.
 * Kept as a flat fallback for call sites without a Revision record yet.
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