// src/engine/revisionLookaheadEngine.ts
import gateData from '../data/gate.json';
import { getAllRevisions } from '../db/revisionService';

interface TopicMeta {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
}

interface GateSubject {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
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

export interface LookaheadItem extends TopicMeta {
  nextReviewDate: number;
}

export interface LookaheadBucket {
  label: string;
  dateKey: string;
  isOverdue: boolean;
  items: LookaheadItem[];
}

/**
 * Groups all upcoming (and overdue) revisions into day-by-day buckets
 * for the next `daysAhead` days, so the person can plan ahead instead
 * of only seeing what's due right now.
 */
export async function getRevisionLookahead(daysAhead = 7): Promise<LookaheadBucket[]> {
  const revisions = await getAllRevisions();
  const topicsMeta = getAllTopicsMeta();

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const overdueItems: LookaheadItem[] = [];
  const dayBuckets = new Map<string, LookaheadItem[]>();

  for (const rev of revisions) {
    const meta = topicsMeta.get(rev.topicId);
    if (!meta) continue;

    const item: LookaheadItem = { ...meta, nextReviewDate: rev.nextReviewDate };
    const revDate = new Date(rev.nextReviewDate);
    const revMidnight = new Date(revDate.getFullYear(), revDate.getMonth(), revDate.getDate());
    const diffDays = Math.round(
      (revMidnight.getTime() - todayMidnight.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (diffDays < 0) {
      overdueItems.push(item);
    } else if (diffDays <= daysAhead - 1) {
      const key = revMidnight.toDateString();
      const arr = dayBuckets.get(key) ?? [];
      arr.push(item);
      dayBuckets.set(key, arr);
    }
  }

  const buckets: LookaheadBucket[] = [];

  if (overdueItems.length > 0) {
    buckets.push({
      label: 'Overdue',
      dateKey: 'overdue',
      isOverdue: true,
      items: overdueItems.sort((a, b) => a.nextReviewDate - b.nextReviewDate),
    });
  }

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(todayMidnight);
    d.setDate(d.getDate() + i);
    const key = d.toDateString();

    const items = (dayBuckets.get(key) ?? []).sort((a, b) =>
      a.subjectName.localeCompare(b.subjectName)
    );

    const label =
      i === 0
        ? 'Today'
        : i === 1
          ? 'Tomorrow'
          : d.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            });

    buckets.push({ label, dateKey: key, isOverdue: false, items });
  }

  return buckets;
}
