// src/engine/topicProgressEngine.ts
import { getLecture } from '../db/lectureService';
import { getNotes } from '../db/notesService';
import { getPyq } from '../db/pyqService';
import { getRevision } from '../db/revisionService';

export interface TopicProgress {
  progress: number;
  lecture: number;
  notes: number;
  pyq: number;
  confidence: number;
}

export async function calculateTopicProgress(topicId: string): Promise<TopicProgress> {
  const [lecture, notes, pyq, revision] = await Promise.all([
    getLecture(topicId),
    getNotes(topicId),
    getPyq(topicId),
    getRevision(topicId)
  ]);

  // 1. Lecture Progress
  const duration = lecture?.durationMinutes || 0;
  const watched = lecture?.watchedMinutes || 0;
  const lectureProgress = duration > 0 ? Math.min(100, Math.round((watched / duration) * 100)) : 0;

  // 2. Notes Progress
  const notesProgress = notes ? 100 : 0;

  // 3. PYQ Progress
  const pyqProgress = pyq?.accuracy || 0;

  // 4. Overall Progress (Lecture 40%, Notes 30%, PYQ 30%)
  const progress = Math.round((lectureProgress * 0.4) + (notesProgress * 0.3) + (pyqProgress * 0.3));

  // 5. Confidence Score
  let confidence = 0;
  if (!revision) {
    confidence = pyqProgress;
  } else {
    // Calculate Revision Quality (baseline easeFactor of 2.5 = 100%)
    const revisionQuality = Math.min(100, Math.round((revision.easeFactor / 2.5) * 100));
    confidence = Math.round((0.6 * pyqProgress) + (0.4 * revisionQuality));
  }

  return {
    progress,
    lecture: lectureProgress,
    notes: notesProgress,
    pyq: pyqProgress,
    confidence
  };
}