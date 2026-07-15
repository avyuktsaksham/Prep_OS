// src/engine/weakTopicEngine.ts
import type { SubjectMetrics } from '../types';

export interface WeakSubjectAlert extends SubjectMetrics {
  yieldScore: number;
}

interface WeakSubjectOptions {
  /** How far below the average progress a subject must fall to count as "behind". */
  relativeMargin?: number;
  /** Don't show any alerts until overall average progress crosses this — avoids
   *  flagging half the subjects as "weak" on day one when everything is near 0%. */
  minOverallProgress?: number;
  /** Cap the number of alerts shown so the dashboard stays clean. */
  maxResults?: number;
}

/**
 * Flags subjects that are high-marks but meaningfully BEHIND your own average
 * progress across subjects — the combination that costs the most marks in the
 * exam if left ignored.
 *
 * A subject qualifies if:
 *  - its weightage is at/above the median weightage across all subjects, AND
 *  - its progress is at least `relativeMargin` points below your average
 *    subject progress (a relative laggard, not just an arbitrary absolute cutoff)
 *
 * Nothing is shown until average progress crosses `minOverallProgress`, since
 * early on every subject is near 0% and nothing is genuinely "behind" yet.
 *
 * Results are sorted by (weightage * (100 - progress)) descending — the same
 * "yield" logic used in Today's Tasks — so the subject costing the most marks
 * appears first, capped to `maxResults`.
 */
export function getWeakSubjectAlerts(
  subjectMetrics: SubjectMetrics[],
  options: WeakSubjectOptions = {}
): WeakSubjectAlert[] {
  const { relativeMargin = 15, minOverallProgress = 10, maxResults = 3 } = options;

  const withTopics = subjectMetrics.filter((m) => m.totalTopics > 0);
  if (withTopics.length < 2) return [];

  const avgProgress =
    withTopics.reduce((sum, m) => sum + m.subjectProgress, 0) / withTopics.length;

  if (avgProgress < minOverallProgress) return [];

  const sortedWeightage = [...withTopics].map((m) => m.weightage).sort((a, b) => a - b);
  const mid = Math.floor(sortedWeightage.length / 2);
  const medianWeightage =
    sortedWeightage.length % 2 === 0
      ? (sortedWeightage[mid - 1] + sortedWeightage[mid]) / 2
      : sortedWeightage[mid];

  return withTopics
    .filter(
      (m) =>
        m.weightage >= medianWeightage &&
        m.subjectProgress < avgProgress - relativeMargin
    )
    .map((m) => ({
      ...m,
      yieldScore: m.weightage * (100 - m.subjectProgress),
    }))
    .sort((a, b) => b.yieldScore - a.yieldScore)
    .slice(0, maxResults);
}
