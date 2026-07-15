// src/engine/mistakePatternEngine.ts
import gateData from '../data/gate.json';
import { askGemini } from '../lib/geminiClient';
import type { ExtractedMistake } from './mistakeEngine';

interface GateSubject {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
}

function getTopicName(topicId: string): string {
  const data = gateData as { subjects: GateSubject[] };
  for (const subject of data.subjects) {
    const topic = subject.topics.find((t) => t.id === topicId);
    if (topic) return `${topic.name} (${subject.name})`;
  }
  return topicId;
}

function buildMistakePatternPrompt(mistakes: ExtractedMistake[]): string {
  const lines = mistakes.map((m) => {
    const topicName = getTopicName(m.topicId);
    const lastConfidence = m.confidenceHistory[m.confidenceHistory.length - 1] ?? 'not reviewed yet';
    return (
      `- Topic: ${topicName} | Question: ${m.questionReference} | ` +
      `Difficulty: ${m.difficulty ?? 'unrated'} | Status: ${m.status} | ` +
      `Attempts: ${m.attempts} | Last confidence: ${lastConfidence} | ` +
      `Notes: ${m.notes || 'none'}`
    );
  });

  return `You are a no-nonsense study coach for a student preparing for the GATE CSE exam (targeting AIR 100). Speak in Hinglish, casual "bhai" tone, direct and specific — no generic advice.

Here is the student's full mistake log from their Mistake Vault (each entry is a PYQ they got wrong or want to track):

${lines.join('\n')}

Analyze this and answer in under 180 words:
1. What recurring PATTERN do you see across these mistakes? (e.g. a specific concept, a topic cluster, a type of error like silly calculation mistakes vs conceptual gaps — be specific, name the actual topics/concepts, don't be vague)
2. Which 1-2 topics need the most urgent re-study based on repeated attempts or low confidence?
3. One specific, actionable tip to fix the pattern (not generic "practice more")

If there isn't enough data to find a real pattern, say so honestly instead of making one up.`;
}

export async function analyzeMistakePatterns(mistakes: ExtractedMistake[]): Promise<string> {
  if (mistakes.length === 0) {
    return "Abhi Mistake Vault mein koi mistake log nahi hai. Kuch PYQs solve karke galtiyan log kar, phir pattern analysis karwa sakte hain.";
  }
  const prompt = buildMistakePatternPrompt(mistakes);
  return askGemini(prompt);
}
