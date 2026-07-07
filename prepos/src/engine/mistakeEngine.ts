// src/engine/mistakeEngine.ts
import type { Resource, MistakeItem, MistakeConfidence } from '../types';

export type ExtractedMistake = MistakeItem & {
  resourceId: string;
  topicId: string;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const REVIEW_INTERVALS: Record<MistakeConfidence, number> = {
  AGAIN: 1,
  HARD: 3,
  GOOD: 7,
  EASY: 14
};

export function extractAllMistakes(pyqs: Resource[]): ExtractedMistake[] {
  const extracted: ExtractedMistake[] = [];
  
  for (const pyq of pyqs) {
    if (!pyq.mistakeItems?.length) {
  continue;
} {
      for (const mistake of pyq.mistakeItems) {
        extracted.push({
          ...mistake,
          resourceId: pyq.id,
          topicId: pyq.topicId
        });
      }
    }
  }
  
  return extracted;
}

export function calculateNextReviewDate(
  _attempts: number,
  confidence: MistakeConfidence
): number {
  return Date.now() + REVIEW_INTERVALS[confidence] * ONE_DAY_MS;
}

export function processMistakeReview(mistake: MistakeItem, confidence: MistakeConfidence): MistakeItem {
  const newHistory = [
  ...mistake.confidenceHistory,
  confidence
];
  
  let newStatus: "PENDING" | "RESOLVED" = "PENDING";
  
  if (newHistory.length >= 3) {
    const lastThree = newHistory.slice(-3);
    const isMastered = lastThree.every(
  (val) => val === "GOOD" || val === "EASY"
);
    
    if (isMastered) {
      newStatus = "RESOLVED";
    }
  }

  return {
    ...mistake,
    attempts: mistake.attempts + 1,
    confidenceHistory: newHistory,
    nextReviewDate: calculateNextReviewDate(
    mistake.attempts + 1,
    confidence
),
    status: newStatus,
    updatedAt: Date.now()
  };
}