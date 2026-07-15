// src/engine/todayTaskEngine.ts
import gateData from '../data/gate.json';
import { getAllLectures } from '../db/lectureService';
import { getAllNotes } from '../db/notesService';
import { getAllPyqs } from '../db/pyqService';
import { getAllRevisions } from '../db/revisionService';
import { extractAllMistakes } from './mistakeEngine';
import { calculateLectureSetProgress, areAllLecturesCompleted } from './lectureProgress';
import type { TodayTask } from '../types';
import {
  estimateLecture,
  estimateNotes,
  estimatePyq,
  estimateRevision,
  estimateMistake,
} from "./estimateEngine";

interface TopicMeta {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  subjectWeightage: number;
}

// Utility to flatten the static curriculum for iteration
function getAllTopics(): TopicMeta[] {
  const topics: TopicMeta[] = [];
  const data = gateData as { subjects: { id: string; name: string; weightage: number; topics: { id: string; name: string }[] }[] };
  
  data.subjects.forEach((subject) => {
    subject.topics.forEach((topic) => {
      topics.push({
        topicId: topic.id,
        topicName: topic.name,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectWeightage: subject.weightage || 0,
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
  const lectureMap = new Map<string, typeof allLectures>();
  allLectures.forEach(l => {
    const existing = lectureMap.get(l.topicId) ?? [];
    existing.push(l);
    lectureMap.set(l.topicId, existing);
  });
  const notesMap = new Map(allNotes.map(r => [r.topicId, r]));
  const pyqMap = new Map(allPyqs.map(r => [r.topicId, r]));
  const revisionMap = new Map(allRevisions.map(r => [r.topicId, r]));

  // Store calculated yield scores for sorting later
  const topicYieldScore = new Map<string, number>();

  const dueRevisions: TodayTask[] = [];
  const pendingLectures: TodayTask[] = [];
  const missingNotes: TodayTask[] = [];
  const pendingPyqs: TodayTask[] = [];
  const dueMistakes: TodayTask[] = [];

  for (const t of topics) {
    const lectures = lectureMap.get(t.topicId) ?? [];
    const notes = notesMap.get(t.topicId);
    const pyq = pyqMap.get(t.topicId);
    const revision = revisionMap.get(t.topicId);

    // --- WEIGHTAGE-AWARE PRIORITY CALCULATION (40/30/30) ---
    // 1. Lecture Progress (averaged across all lectures for this topic)
    const lectureProgressPct = calculateLectureSetProgress(lectures);
    const isLectureCompleted = areAllLecturesCompleted(lectures);
    let topicProgress = lectureProgressPct * 0.4;
    
    // 2. Notes Progress
    if (notes) topicProgress += 30;
    
    // 3. PYQ Progress (accuracy is already stored 0-100 on the resource)
    if (pyq && (pyq.totalQuestions || 0) > 0) {
      topicProgress += 30 * ((pyq.accuracy || 0) / 100);
    }
    
    // Formula: Weightage * Remaining Progress
    const yieldScore = t.subjectWeightage * (100 - topicProgress);
    topicYieldScore.set(t.topicId, yieldScore);
    // -------------------------------------------------------

    // 1. Due Revisions
    if (revision && revision.nextReviewDate <= now) {
      dueRevisions.push({
        id: `${t.topicId}-REVISION`,
        ...t,
        type: 'REVISION',
        priority: 1,
        title: 'Spaced Repetition Due',
        actionLabel: 'Review Now',
        estimatedMinutes: estimateRevision()
      });
    }

    // 2. Pending Lectures
    const isActive = lectures.length > 0 || !!notes || !!pyq || !!revision;

    if (isActive) {
      if (lectures.length === 0) {
        pendingLectures.push({
          id: `${t.topicId}-LECTURE`,
          ...t,
          type: "LECTURE",
          priority: 2,
          title: "Start Lecture",
          actionLabel: "Start",
          estimatedMinutes: estimateLecture(undefined)
        });
      } else if (!isLectureCompleted) {
        // Find the first incomplete lecture to base the estimate/label on
        const incomplete = lectures.find((l) => !(l.completed || ((l.durationMinutes || 0) > 0 && (l.watchedMinutes || 0) >= (l.durationMinutes || 0))));
        pendingLectures.push({
          id: `${t.topicId}-LECTURE`,
          ...t,
          type: "LECTURE",
          priority: 2,
          title: lectures.length > 1 ? "Resume Lectures" : "Resume Lecture",
          actionLabel: "Continue",
          estimatedMinutes: estimateLecture(incomplete)
        });
      }
    }

    // 3. Missing Notes
    if (isLectureCompleted && !notes) {
      missingNotes.push({
        id: `${t.topicId}-NOTES`,
        ...t,
        type: 'NOTES',
        priority: 3,
        title: 'Notes Missing',
        actionLabel: 'Add Notes',
        estimatedMinutes: estimateNotes()
      });
    }

    // 4. Pending PYQs
    if (isLectureCompleted && notes && (!pyq || (pyq.totalQuestions || 0) === 0)) {
      pendingPyqs.push({
        id: `${t.topicId}-PYQ`,
        ...t,
        type: 'PYQ',
        priority: 4,
        title: 'PYQs Pending',
        actionLabel: 'Solve PYQs',
        estimatedMinutes: estimatePyq(pyq)
      });
    }
  }

  // 5. Due Mistakes
  const extractedMistakes = extractAllMistakes(allPyqs);

  for (const mistake of extractedMistakes) {
    if (mistake.status === "PENDING" && mistake.nextReviewDate <= now) {
      const topic = topics.find(t => t.topicId === mistake.topicId);
      if (!topic) continue;

      dueMistakes.push({
        id: `${mistake.id}-MISTAKE`,
        ...topic,
        type: "MISTAKE",
        priority: 2,
        title: "Review Mistake",
        actionLabel: "Review",
        estimatedMinutes: estimateMistake()
      });
    }
  }

  const mistakeTopicIds = new Set(dueMistakes.map(task => task.topicId));
  const filteredLectures = pendingLectures.filter(task => !mistakeTopicIds.has(task.topicId));

  const allTasks = [
    ...dueRevisions,
    ...filteredLectures,
    ...dueMistakes,
    ...missingNotes,
    ...pendingPyqs
  ];
  
  // FINAL SORTING
  return allTasks.sort((a, b) => {
    // Primary Sort: By static priority (1 > 2 > 3 > 4)
    if (a.priority !== b.priority) {
      return a.priority - b.priority; 
    }

    // Secondary Sort: The Magic Formula (Weightage * Remaining Progress)
    const yieldA = topicYieldScore.get(a.topicId) ?? 0;
    const yieldB = topicYieldScore.get(b.topicId) ?? 0;

    if (yieldB !== yieldA) {
      return yieldB - yieldA; // Descending: Highest yield comes first
    }

    // Fallback: Alphabetical
    return a.subjectName.localeCompare(b.subjectName);
  });
}