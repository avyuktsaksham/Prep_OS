// src/db/notesService.ts
import { db } from './index';
import type { Resource } from '../types';

export interface NotesData {
  title: string;
  markdown: string;
}

export async function saveNotes(topicId: string, data: NotesData): Promise<string> {
  const resource: Resource = {
    id: crypto.randomUUID(),
    topicId,
    type: 'NOTES',
    title: data.title,
    createdAt: Date.now(),
    markdown: data.markdown,
  };

  return await db.resources.add(resource);
}

export async function getNotes(topicId: string): Promise<Resource | undefined> {
  return await db.resources
    .where('topicId')
    .equals(topicId)
    .filter((resource) => resource.type === 'NOTES')
    .first();
}

export async function updateNotes(topicId: string, data: Partial<NotesData>): Promise<number> {
  const existingNotes = await getNotes(topicId);
  
  if (!existingNotes) {
    throw new Error(`No notes found for topic: ${topicId}`);
  }

  const updates: Partial<Resource> = {};
  
  if (data.title !== undefined) updates.title = data.title;
  if (data.markdown !== undefined) updates.markdown = data.markdown;

  return await db.resources.update(existingNotes.id, updates);
}

export async function deleteNotes(topicId: string): Promise<void> {
  const existingNotes = await getNotes(topicId);
  
  if (existingNotes) {
    await db.resources.delete(existingNotes.id);
  }
}

/**
 * Returns all notes resources.
 * Used by TodayTaskEngine.
 */
export async function getAllNotes(): Promise<Resource[]> {
  return db.resources
    .where('type')
    .equals('NOTES')
    .toArray();
}