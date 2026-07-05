// src/db/revisionService.ts
import { db } from './index';
import type { Revision } from '../types';

export async function saveRevision(topicId: string): Promise<void> {
  const revision: Revision = {
    id: crypto.randomUUID(),
    topicId,
    nextReviewDate: Date.now(), // Due immediately upon creation
    interval: 0,
    easeFactor: 2.5, // Standard starting EF for SM-2 algorithm
    reviewCount: 0,
  };

  await db.revisions.add(revision);
}

export async function getRevision(topicId: string): Promise<Revision | undefined> {
  return await db.revisions
    .where('topicId')
    .equals(topicId)
    .first();
}

/**
 * Updates the revision schedule using a modified SuperMemo-2 (SM-2) algorithm.
 * @param topicId The ID of the topic being reviewed
 * @param qualityRating 0-5 scale (0 = complete blackout, 5 = perfect recall)
 */
export async function updateRevision(topicId: string, qualityRating: number): Promise<number> {
  const existing = await getRevision(topicId);
  
  if (!existing) {
    throw new Error(`No revision schedule found for topic: ${topicId}`);
  }

  let { easeFactor, interval, reviewCount } = existing;
  
  // Calculate new SM-2 values
  if (qualityRating >= 3) {
    if (reviewCount === 0) {
      interval = 1;
    } else if (reviewCount === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    reviewCount += 1;
  } else {
    reviewCount = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - qualityRating) * (0.08 + (5 - qualityRating) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // Convert interval (days) to milliseconds and add to current time
  const nextReviewDate = Date.now() + (interval * 24 * 60 * 60 * 1000);

  return await db.revisions.update(existing.id, {
    nextReviewDate,
    interval,
    easeFactor,
    reviewCount,
  });
}

export async function deleteRevision(topicId: string): Promise<void> {
  const existing = await getRevision(topicId);
  
  if (existing) {
    await db.revisions.delete(existing.id);
  }
}