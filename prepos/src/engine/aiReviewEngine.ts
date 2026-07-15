// src/engine/aiReviewEngine.ts
import { askGemini } from '../lib/geminiClient';
import type { AnalyticsSnapshot } from '../types';

function buildWeeklyReviewPrompt(snapshot: AnalyticsSnapshot): string {
  const subjectLines = snapshot.subjectMetrics
    .map(
      (s) =>
        `- ${s.subjectName} (${s.weightage} marks): ${s.subjectProgress}% progress, ` +
        `${s.completedTopics}/${s.totalTopics} topics done, ${s.accuracy}% PYQ accuracy, ` +
        `${Math.round(s.studyTimeMinutes)} min studied`
    )
    .join('\n');

  return `You are a no-nonsense study coach for a student preparing for the GATE CSE exam (targeting AIR 100, IIT Bombay). Speak directly to the student in a mix of Hindi and English (Hinglish), casual "bhai" tone, no fluff or generic motivational filler.

Here is the student's current data:

Overall progress: ${snapshot.overallProgress}%
Topics completed: ${snapshot.completedTopics}/${snapshot.totalTopics}
Total study time logged: ${Math.round(snapshot.totalStudyTimeMinutes)} minutes
PYQs solved: ${snapshot.totalPyqsSolved}, overall accuracy: ${snapshot.overallAccuracy}%
Revisions due right now: ${snapshot.dueRevisionsCount}
Mistakes logged: ${snapshot.totalMistakes} (${snapshot.pendingMistakes} still pending, ${snapshot.mistakeResolutionRate}% resolved)
Strongest subject: ${snapshot.insights.strongestSubject ?? 'not enough data yet'}
Weakest subject: ${snapshot.insights.weakestSubject ?? 'not enough data yet'}

Per-subject breakdown:
${subjectLines}

Write a short weekly review (under 200 words) covering:
1. One honest observation about what's going well
2. One honest, direct callout of the biggest risk/gap right now (be specific with subject/topic names and numbers, not vague)
3. Two concrete, specific actions for next week (not generic advice like "study more")

Keep it tight, data-driven, and actionable. No generic motivational quotes.`;
}

export async function generateWeeklyReview(snapshot: AnalyticsSnapshot): Promise<string> {
  const prompt = buildWeeklyReviewPrompt(snapshot);
  return askGemini(prompt);
}
