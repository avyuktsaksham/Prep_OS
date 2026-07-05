// src/db/pyqService.ts
import { db } from './index';
import type { Resource } from '../types';

export interface PyqData {
  title: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
}

export async function savePyq(topicId: string, data: PyqData): Promise<void> {
  const accuracy = data.totalQuestions > 0 
    ? Math.round((data.correct / data.totalQuestions) * 100) 
    : 0;

  const resource = {
    id: crypto.randomUUID(),
    topicId,
    type: 'PYQ',
    title: data.title,
    createdAt: Date.now(),
    totalQuestions: data.totalQuestions,
    correct: data.correct,
    incorrect: data.incorrect,
    accuracy: accuracy,
  } as Resource & { totalQuestions: number };

  await db.resources.add(resource);
}

export async function getPyq(topicId: string): Promise<(Resource & { totalQuestions?: number }) | undefined> {
  return await db.resources
    .where('topicId')
    .equals(topicId)
    .filter((resource) => resource.type === 'PYQ')
    .first() as (Resource & { totalQuestions?: number }) | undefined;
}

export async function updatePyq(topicId: string, data: Partial<PyqData>): Promise<number> {
  const existingPyq = await getPyq(topicId);
  
  if (!existingPyq) {
    throw new Error(`No PYQ found for topic: ${topicId}`);
  }

  const updates: Partial<Resource> = {};
  
  if (data.title !== undefined) updates.title = data.title;
  if (data.totalQuestions !== undefined) updates.totalQuestions = data.totalQuestions;
  if (data.correct !== undefined) updates.correct = data.correct;
  if (data.incorrect !== undefined) updates.incorrect = data.incorrect;

  // Recalculate accuracy if any related field is updated
  const updatedTotal = data.totalQuestions ?? existingPyq.totalQuestions ?? 0;
  const updatedCorrect = data.correct ?? existingPyq.correct ?? 0;
  
  if (updatedTotal > 0) {
    updates.accuracy = Math.round((updatedCorrect / updatedTotal) * 100);
  } else {
    updates.accuracy = 0;
  }

  return await db.resources.update(existingPyq.id, updates);
}

export async function deletePyq(topicId: string): Promise<void> {
  const existingPyq = await getPyq(topicId);
  
  if (existingPyq) {
    await db.resources.delete(existingPyq.id);
  }
}