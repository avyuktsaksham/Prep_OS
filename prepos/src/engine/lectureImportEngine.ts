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
  confidence: 'high' | 'medium' | 'low';
}

function getSubject(subjectId: string): GateSubject | undefined {
  const data = gateData as { subjects: GateSubject[] };
  return data.subjects.find((s) => s.id === subjectId);
}

function stripCodeFence(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

/**
 * Sends a screenshot (e.g. a course platform's lecture list) to Gemini and
 * asks it to extract every visible lecture title, then map each one to the
 * closest-matching topic within the given GATE subject. Nothing is written
 * to the database here — this only proposes a list for the person to
 * review, edit, and confirm before anything is actually added.
 */
export async function extractLecturesFromScreenshot(
  subjectId: string,
  image: GeminiImage
): Promise<ProposedLecture[]> {
  const subject = getSubject(subjectId);
  if (!subject) {
    throw new Error('Unknown subject.');
  }

  const topicList = subject.topics.map((t) => `- ${t.id}: ${t.name}`).join('\n');

  const prompt = `You are looking at a screenshot from a course platform (e.g. a lecture list, video course page, or chapter list). Extract every individual lecture/video title visible in the image.

For each lecture title you find, pick the single best-matching topic from this list (these are the only valid topic IDs for the "${subject.name}" subject in a GATE CSE syllabus):

${topicList}

Ignore anything that is not an actual lecture/video title (ads, navigation menus, unrelated UI text, subject-level overview cards with no individual lecture name).

Respond with ONLY a raw JSON array, no markdown, no code fences, no explanation. Each item must look exactly like this:
{"title": "<lecture title as seen>", "topicId": "<one of the topic IDs above>", "confidence": "high" | "medium" | "low"}

If you cannot confidently match a lecture to any topic in the list, skip that lecture entirely rather than guessing wildly. If the image contains no readable lecture titles at all, respond with an empty array: []`;

  const raw = await askGeminiWithImage(prompt, image);
  const cleaned = stripCodeFence(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Could not read a lecture list from that screenshot. Try a clearer image.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Unexpected response format from Gemini.');
  }

  const topicNameById = new Map(subject.topics.map((t) => [t.id, t.name]));

  const results: ProposedLecture[] = [];
  for (const item of parsed) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as any).title === 'string' &&
      typeof (item as any).topicId === 'string' &&
      topicNameById.has((item as any).topicId)
    ) {
      const confidence = (item as any).confidence;
      results.push({
        title: (item as any).title,
        topicId: (item as any).topicId,
        topicName: topicNameById.get((item as any).topicId)!,
        confidence: confidence === 'high' || confidence === 'medium' || confidence === 'low' ? confidence : 'medium',
      });
    }
  }

  return results;
}
