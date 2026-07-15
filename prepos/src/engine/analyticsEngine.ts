// src/engine/analyticsEngine.ts
import gateData from '../data/gate.json';
import { getAllLectures } from '../db/lectureService';
import { getAllNotes } from '../db/notesService';
import { getAllPyqs } from '../db/pyqService';
import { getAllRevisions } from '../db/revisionService';
import { extractAllMistakes } from './mistakeEngine';
import { calculateLectureSetProgress, sumWatchedMinutes } from './lectureProgress';
import type { 
  AnalyticsSnapshot, 
  SubjectMetrics, 
  AnalyticsInsights, 
  Resource, 
  Revision 
} from '../types';

interface GateSubject {
  id: string;
  name: string;
  weightage: number;
  topics: { id: string; name: string }[];
}

function buildResourceMaps(
  lectures: Resource[], 
  notes: Resource[], 
  pyqs: Resource[], 
  revisions: Revision[]
) {
  const lectureMap = new Map<string, Resource[]>();
  const notesMap = new Map<string, Resource>();
  const pyqMap = new Map<string, Resource>();
  const revisionMap = new Map<string, Revision>();

  lectures.forEach(l => {
    const existing = lectureMap.get(l.topicId) ?? [];
    existing.push(l);
    lectureMap.set(l.topicId, existing);
  });
  notes.forEach(n => notesMap.set(n.topicId, n));
  pyqs.forEach(p => pyqMap.set(p.topicId, p));
  revisions.forEach(r => revisionMap.set(r.topicId, r));

  return { lectureMap, notesMap, pyqMap, revisionMap };
}

function getOverdueRevisionsCount(revisions: Revision[]): number {
  const now = Date.now();
  return revisions.filter(r => r.nextReviewDate <= now).length;
}

function calculateSubjectMetrics(
  subject: GateSubject, 
  maps: ReturnType<typeof buildResourceMaps>
): SubjectMetrics {
  const totalTopics = subject.topics.length;
  let completedTopics = 0;
  let sumSubjectProgress = 0;
  let sumLectureProgress = 0;
  let sumNotesProgress = 0;
  let sumPyqProgress = 0;
  let totalQuestions = 0;
  let correctQuestions = 0;
  let studyTimeMinutes = 0;

  subject.topics.forEach(topic => {
    const lecture = maps.lectureMap.get(topic.id) ?? [];
    const notes = maps.notesMap.get(topic.id);
    const pyq = maps.pyqMap.get(topic.id);

    // Compute component progress using existing Resource fields
    // Matches docs/04_FORMULAS.md and topicProgressEngine.ts exactly
    const lecProg = calculateLectureSetProgress(lecture);
    const notProg = notes ? 100 : 0;
    const pyqProg = pyq?.accuracy || 0;

    // Standard PrepOS weightage: Lecture (40%), Notes (30%), PYQ (30%)
    const topicProg = Math.round((lecProg * 0.4) + (notProg * 0.3) + (pyqProg * 0.3));

    sumSubjectProgress += topicProg;
    sumLectureProgress += lecProg;
    sumNotesProgress += notProg;
    sumPyqProgress += pyqProg;

    if (topicProg === 100) {
      completedTopics++;
    }

    studyTimeMinutes += sumWatchedMinutes(lecture);

    if (pyq) {
      totalQuestions += pyq.totalQuestions || 0;
      correctQuestions += pyq.correct || 0;
    }
  });

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    weightage: subject.weightage ?? 0,
    totalTopics,
    completedTopics,
    subjectProgress: totalTopics > 0 ? Math.round(sumSubjectProgress / totalTopics) : 0,
    lectureProgress: totalTopics > 0 ? Math.round(sumLectureProgress / totalTopics) : 0,
    notesProgress: totalTopics > 0 ? Math.round(sumNotesProgress / totalTopics) : 0,
    pyqProgress: totalTopics > 0 ? Math.round(sumPyqProgress / totalTopics) : 0,
    accuracy: totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0,
    studyTimeMinutes
  };
}

function calculateInsights(metrics: SubjectMetrics[]): AnalyticsInsights {
  const validMetrics = metrics.filter(m => m.totalTopics > 0);

  if (validMetrics.length === 0) {
    return {
      strongestSubject: null,
      weakestSubject: null,
      mostStudiedSubject: null,
      leastStudiedSubject: null
    };
  }

  const sortedByStrength = [...validMetrics].sort((a, b) => {
    const scoreA = a.subjectProgress + a.accuracy;
    const scoreB = b.subjectProgress + b.accuracy;
    return scoreB - scoreA;
  });

  const sortedByTime = [...validMetrics].sort((a, b) => {
    return b.studyTimeMinutes - a.studyTimeMinutes;
  });

  return {
    strongestSubject: sortedByStrength[0]?.subjectName || null,
    weakestSubject: sortedByStrength[sortedByStrength.length - 1]?.subjectName || null,
    mostStudiedSubject: sortedByTime[0]?.subjectName || null,
    leastStudiedSubject: sortedByTime[sortedByTime.length - 1]?.subjectName || null,
  };
}

export async function generateAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const [lectures, notes, pyqs, revisions] = await Promise.all([
    getAllLectures(),
    getAllNotes(),
    getAllPyqs(),
    getAllRevisions()
  ]);

  const maps = buildResourceMaps(lectures, notes, pyqs, revisions);
  const data = gateData as { subjects: GateSubject[] };
  
  const subjectMetrics: SubjectMetrics[] = [];
  
  let totalSubjects = data.subjects.length;
  let completedSubjects = 0;
  let totalTopics = 0;
  let completedTopics = 0;
  let totalStudyTimeMinutes = 0;
  let totalPyqsSolved = 0;
  let totalCorrectPyqs = 0;
  let sumWeightedTopicProgress = 0;

  data.subjects.forEach(subject => {
    const metrics = calculateSubjectMetrics(subject, maps);
    subjectMetrics.push(metrics);

    if (metrics.subjectProgress === 100) {
      completedSubjects++;
    }

    totalTopics += metrics.totalTopics;
    completedTopics += metrics.completedTopics;
    totalStudyTimeMinutes += metrics.studyTimeMinutes;
    sumWeightedTopicProgress += (metrics.subjectProgress * metrics.totalTopics);
  });

  pyqs.forEach(pyq => {
    totalPyqsSolved += pyq.totalQuestions || 0;
    totalCorrectPyqs += pyq.correct || 0;
  });

  const overallProgress = totalTopics > 0 ? Math.round(sumWeightedTopicProgress / totalTopics) : 0;
  const overallAccuracy = totalPyqsSolved > 0 ? Math.round((totalCorrectPyqs / totalPyqsSolved) * 100) : 0;
  const dueRevisionsCount = getOverdueRevisionsCount(revisions);
  // ----- Mistake Analytics -----
const extractedMistakes = extractAllMistakes(pyqs);

const totalMistakes = extractedMistakes.length;

const pendingMistakes = extractedMistakes.filter(
  m => m.status === "PENDING"
).length;

const resolvedMistakes = extractedMistakes.filter(
  m => m.status === "RESOLVED"
).length;

const mistakeResolutionRate =
  totalMistakes > 0
    ? Math.round((resolvedMistakes / totalMistakes) * 100)
    : 0;

const averageAttempts =
  totalMistakes > 0
    ? Math.round(
        (extractedMistakes.reduce(
          (sum, m) => sum + m.attempts,
          0
        ) /
          totalMistakes) *
          10
      ) / 10
    : 0;

const dueMistakesToday = extractedMistakes.filter(
  m =>
    m.status === "PENDING" &&
    m.nextReviewDate <= Date.now()
).length;
// -----------------------------
  const insights = calculateInsights(subjectMetrics);

  return {
    overallProgress,
    totalSubjects,
    completedSubjects,
    totalTopics,
    completedTopics,
    totalStudyTimeMinutes,
    totalPyqsSolved,
    overallAccuracy,
    dueRevisionsCount,
    totalMistakes,
    pendingMistakes, 
    resolvedMistakes,
    mistakeResolutionRate,
    averageAttempts,
    dueMistakesToday,
    subjectMetrics,
    insights
  };
}