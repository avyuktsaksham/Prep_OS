// src/engine/todayTaskEngine.ts
import gateData from '../data/gate.json';
import { getAllLectures } from '../db/lectureService';
import { getAllNotes } from '../db/notesService';
import { getAllPyqs } from '../db/pyqService';
import { getAllRevisions } from '../db/revisionService';
import { extractAllMistakes } from './mistakeEngine';
import type { TodayTask } from '../types';


interface TopicMeta {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
}

// Utility to flatten the static curriculum for iteration
function getAllTopics(): TopicMeta[] {
  const topics: TopicMeta[] = [];
  const data = gateData as { subjects: { id: string; name: string; topics: { id: string; name: string }[] }[] };
  
  data.subjects.forEach((subject) => {
    subject.topics.forEach((topic) => {
      topics.push({
        topicId: topic.id,
        topicName: topic.name,
        subjectId: subject.id,
        subjectName: subject.name,
      });
    });
  });
  
  return topics;
}

export async function getTodayTasks(): Promise<TodayTask[]> {
  const topics = getAllTopics();
  const now = Date.now();
  
  // Bulk fetch all data upfront to prevent N+1 queries
  const [allLectures, allNotes, allPyqs, allRevisions] = await Promise.all([
    getAllLectures(),
    getAllNotes(),
    getAllPyqs(),
    getAllRevisions()
  ]);

  // Create fast lookup maps
  const lectureMap = new Map(allLectures.map(r => [r.topicId, r]));
  const notesMap = new Map(allNotes.map(r => [r.topicId, r]));
  const pyqMap = new Map(allPyqs.map(r => [r.topicId, r]));
  const revisionMap = new Map(allRevisions.map(r => [r.topicId, r]));

  const dueRevisions: TodayTask[] = [];
  const pendingLectures: TodayTask[] = [];
  const missingNotes: TodayTask[] = [];
  const pendingPyqs: TodayTask[] = [];
  const dueMistakes: TodayTask[] = [];

  for (const t of topics) {
    const lecture = lectureMap.get(t.topicId);
    const notes = notesMap.get(t.topicId);
    const pyq = pyqMap.get(t.topicId);
    const revision = revisionMap.get(t.topicId);

    // 1. Due Revisions
    if (revision && revision.nextReviewDate <= now) {
      dueRevisions.push({
        id: `${t.topicId}-REVISION`,
        ...t,
        type: 'REVISION',
        priority: 1,
        title: 'Spaced Repetition Due',
        actionLabel: 'Review Now'
      });
    }

    // 2. Pending Lectures
    const isActive =
  !!lecture ||
  !!notes ||
  !!pyq ||
  !!revision;

if (isActive) {
  if (!lecture) {
    pendingLectures.push({
      id: `${t.topicId}-LECTURE`,
      ...t,
      type: "LECTURE",
      priority: 2,
      title: "Start Lecture",
      actionLabel: "Start",
    });
  } else {
    const duration = lecture.durationMinutes || 0;
    const watched = lecture.watchedMinutes || 0;

    const isCompleted =
      lecture.completed ||
      (duration > 0 && watched >= duration);

    if (!isCompleted) {
      pendingLectures.push({
        id: `${t.topicId}-LECTURE`,
        ...t,
        type: "LECTURE",
        priority: 2,
        title: "Resume Lecture",
        actionLabel: "Continue",
      });
    }
  }
}

    // 3. Missing Notes
    // Only flag missing notes if the topic has been actively started
    if (
    lecture?.completed &&
    !notes
) {
      missingNotes.push({
        id: `${t.topicId}-NOTES`,
        ...t,
        type: 'NOTES',
        priority: 3,
        title: 'Notes Missing',
        actionLabel: 'Add Notes'
      });
    }

    // 4. Pending PYQs
    // Only flag pending PYQs if the topic is active but PYQ is missing or 0
    if (
    lecture?.completed &&
    notes &&
    (!pyq || pyq.totalQuestions === 0)
) {
      pendingPyqs.push({
        id: `${t.topicId}-PYQ`,
        ...t,
        type: 'PYQ',
        priority: 4,
        title: 'PYQs Pending',
        actionLabel: 'Solve PYQs'
      });
    }
  }
  // 5. Due Mistakes
const extractedMistakes = extractAllMistakes(allPyqs);

for (const mistake of extractedMistakes) {
  if (
    mistake.status === "PENDING" &&
    mistake.nextReviewDate <= now
  ) {
    const topic = topics.find(
      t => t.topicId === mistake.topicId
    );

    if (!topic) continue;

    dueMistakes.push({
      id: `${mistake.id}-MISTAKE`,
      ...topic,
      type: "MISTAKE",
      priority: 2,
      title: "Review Mistake",
      actionLabel: "Review",
    });
  }
}

// --------------------------------------------
// Remove duplicate lecture tasks if a mistake
// review already exists for the same topic.
// --------------------------------------------

const mistakeTopicIds = new Set(
  dueMistakes.map(task => task.topicId)
);

const filteredLectures = pendingLectures.filter(
  task => !mistakeTopicIds.has(task.topicId)
);

  const allTasks = [
  ...dueRevisions,
  ...filteredLectures,
  ...dueMistakes,
  ...missingNotes,
  ...pendingPyqs
];
  
  // Ascending sort (1 is highest priority)
  return allTasks
.sort((a,b)=>a.priority-b.priority);
}