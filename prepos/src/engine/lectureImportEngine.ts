// src/engine/lectureImportEngine.ts
import gateData from '../data/gate.json';
import { askGeminiWithImage } from '../lib/geminiClient';
import type { GeminiImage } from '../lib/geminiClient';

interface GateSubject {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
}

export interface ProposedLecture {
  title: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  confidence: 'high' | 'medium' | 'low';
  durationMinutes?: number;
}

const subjects = (gateData as { subjects: GateSubject[] }).subjects;

function stripCodeFence(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

/**
 * Reads ONE screenshot and proposes lectures across ALL GATE subjects —
 * Gemini picks the best-matching topic (and therefore subject) for each
 * lecture. Nothing is saved here; the person reviews before committing.
 */
async function extractFromOneScreenshot(image: GeminiImage): Promise<ProposedLecture[]> {
  const topicMeta = new Map<string, { topicName: string; subjectName: string }>();
  const topicList = subjects
    .map((s) => {
      s.topics.forEach((t) => topicMeta.set(t.id, { topicName: t.name, subjectName: s.name }));
      return `${s.name}:\n${s.topics.map((t) => `  - ${t.id}: ${t.name}`).join('\n')}`;
    })
    .join('\n\n');

  const prompt = `You are looking at a screenshot from a course platform (a lecture list, chapter list, video grid, or lecture planner document). Extract every individual lecture/video title visible.

For each lecture, also look for a duration next to it (often beside a clock icon, HH:MM:SS or MM:SS — the video's total length, not a date). If found, convert to total minutes (rounded). If not visible, omit the field.

Then pick the single best-matching topic ID for each lecture from this GATE CSE syllabus (grouped by subject). Only use topic IDs from this list:

${topicList}

Ignore anything that is not an actual lecture title (ads, menus, dates, instructor names, attachment/notes buttons, subject-level overview cards showing only counts).

Respond with ONLY a raw JSON array — no markdown, no code fences, no explanation. Each item:
{"title": "<lecture title as seen>", "topicId": "<topic ID from the list>", "confidence": "high" | "medium" | "low", "durationMinutes": <number, omit if not visible>}

If a lecture clearly belongs to no topic in the list, skip it rather than guessing wildly. If there are no lecture titles at all, respond with: []`;

  const raw = await askGeminiWithImage(prompt, image);

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(raw));
  } catch {
    throw new Error('Could not read a lecture list from that screenshot. Try a clearer image.');
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Unexpected response format from Gemini.');
  }

  const results: ProposedLecture[] = [];
  for (const item of parsed) {
    const it = item as Record<string, unknown> | null;
    if (
      it &&
      typeof it.title === 'string' &&
      typeof it.topicId === 'string' &&
      topicMeta.has(it.topicId)
    ) {
      const meta = topicMeta.get(it.topicId)!;
      const c = it.confidence;
      const d = it.durationMinutes;
      results.push({
        title: it.title,
        topicId: it.topicId,
        topicName: meta.topicName,
        subjectName: meta.subjectName,
        confidence: c === 'high' || c === 'medium' || c === 'low' ? c : 'medium',
        durationMinutes: typeof d === 'number' && d > 0 ? Math.round(d) : undefined,
      });
    }
  }
  return results;
}

/** Runs extraction over one or more screenshots (sequentially, for rate limits). */
export async function extractLecturesFromScreenshots(images: GeminiImage[]): Promise<ProposedLecture[]> {
  const all: ProposedLecture[] = [];
  for (const image of images) {
    all.push(...(await extractFromOneScreenshot(image)));
  }
  return all;
}
