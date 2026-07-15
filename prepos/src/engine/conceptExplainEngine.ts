// src/engine/conceptExplainEngine.ts
import { askGemini } from '../lib/geminiClient';

export async function explainConcept(topicName: string, subjectName: string): Promise<string> {
  const prompt = `You are a GATE CSE exam tutor. Explain the topic "${topicName}" (from ${subjectName}) to a student in Hinglish (mix of Hindi and English), casual and clear tone.

Cover in under 150 words:
1. The core idea in plain terms (no jargon dump)
2. Why it matters for GATE (what kind of questions test this)
3. One common mistake students make with this topic

Keep it tight and exam-focused, not a textbook definition.`;

  return askGemini(prompt);
}
