// src/engine/progressEngine.ts
import { db } from "../db/index";
import gateData from '../data/gate.json';

interface ProgressResult {
  progress: number;
  breakdown: {
    lecture: number;
    notes: number;
    pyq: number;
  };
}

export async function calculateSubjectProgress(subjectId: string): Promise<ProgressResult> {
  // 1. Get all topic IDs for this subject
  const subject = (gateData.subjects as { id: string; topics: { id: string }[] }[]).find(
    (s) => s.id === subjectId
  );

  if (!subject || subject.topics.length === 0) {
    return { progress: 0, breakdown: { lecture: 0, notes: 0, pyq: 0 } };
  }

  const topicIds = subject.topics.map((t) => t.id);

  // 2. Fetch all resources linked to these topics in one query
  const resources = await db.resources
    .where('topicId')
    .anyOf(topicIds)
    .toArray();

  let totalLectureScore = 0;
  let totalNotesScore = 0;
  let totalPyqScore = 0;

  // 3. Calculate scores per topic
  for (const topicId of topicIds) {
    const topicResources = resources.filter((r) => r.topicId === topicId);

    const lecture = topicResources.find((r) => r.type === 'LECTURE');
    const notes = topicResources.find((r) => r.type === 'NOTES');
    const pyq = topicResources.find((r) => r.type === 'PYQ');

    // Lecture Score (based on duration watched)
    const duration = lecture?.durationMinutes || 0;
    const watched = lecture?.watchedMinutes || 0;
    const lectureScore = duration > 0 ? Math.min(100, (watched / duration) * 100) : 0;

    // Notes Score (binary)
    const notesScore = notes ? 100 : 0;

    // PYQ Score (accuracy)
    const pyqScore = pyq?.accuracy || 0;

    totalLectureScore += lectureScore;
    totalNotesScore += notesScore;
    totalPyqScore += pyqScore;
  }

  const topicCount = topicIds.length;
  
  // 4. Calculate averages across all topics
  const avgLecture = totalLectureScore / topicCount;
  const avgNotes = totalNotesScore / topicCount;
  const avgPyq = totalPyqScore / topicCount;

  // 5. Final weighted formula (Lecture: 40%, Notes: 30%, PYQ: 30%)
  const overallProgress = (avgLecture * 0.4) + (avgNotes * 0.3) + (avgPyq * 0.3);

  return {
    progress: Math.round(overallProgress),
    breakdown: {
      lecture: Math.round(avgLecture),
      notes: Math.round(avgNotes),
      pyq: Math.round(avgPyq),
    },
  };
}