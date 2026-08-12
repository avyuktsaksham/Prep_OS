// src/engine/revisionReminderEngine.ts
import gateData from '../data/gate.json';
import { getAllRevisions } from '../db/revisionService';
import { estimateRevisionTime } from './estimateEngine';

interface GateSubject {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
}

interface TopicMeta {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
}

function getAllTopicsMeta(): Map<string, TopicMeta> {
  const data = gateData as { subjects: GateSubject[] };
  const map = new Map<string, TopicMeta>();

  data.subjects.forEach((subject) => {
    subject.topics.forEach((topic) => {
      map.set(topic.id, {
        topicId: topic.id,
        topicName: topic.name,
        subjectId: subject.id,
        subjectName: subject.name,
      });
    });
  });

  return map;
}

export interface RevisionReminder extends TopicMeta {
  estimatedMinutes: number;
}

/**
 * Returns every topic due for revision today (or overdue), each with a
 * MAX time budget so the person knows exactly how long to spend before
 * moving on — not an open-ended "revise this" with no time box.
 */
export async function getTodayRevisionReminders(): Promise<RevisionReminder[]> {
  const [revisions, topicsMeta] = await Promise.all([
    getAllRevisions(),
    Promise.resolve(getAllTopicsMeta()),
  ]);

  const now = Date.now();

  return revisions
    .filter((r) => r.nextReviewDate <= now)
    .map((r) => {
      const meta = topicsMeta.get(r.topicId);
      if (!meta) return null;
      return {
        ...meta,
        estimatedMinutes: estimateRevisionTime(r),
      };
    })
    .filter((x): x is RevisionReminder => x !== null)
    .sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
}
