// src/lib/geminiClient.ts

const GEMINI_MODEL = 'gemini-flash-latest';
const DIRECT_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_RETRIES = 2;
const RETRY_DELAYS_MS = [1000, 3000];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends a prompt to Gemini and returns the plain-text response.
 *
 * - In local dev (`npm run dev`), calls Google directly using the
 *   VITE_GEMINI_API_KEY from .env.local — simplest for local testing.
 * - In production builds, calls our own `/api/gemini` serverless proxy
 *   instead, so the real API key stays server-side and is never bundled
 *   into the browser JS that gets deployed publicly.
 *
 * Transient errors (503 "model overloaded", network hiccups) are retried
 * automatically with backoff before surfacing an error to the person.
 */
export async function askGemini(prompt: string): Promise<string> {
  const call = import.meta.env.DEV ? askGeminiDirect : askGeminiViaProxy;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await call(prompt);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      lastError = error;

      const isRetryable = /503|UNAVAILABLE|overloaded|high demand/i.test(error.message);
      if (!isRetryable || attempt === MAX_RETRIES) {
        throw error;
      }

      await sleep(RETRY_DELAYS_MS[attempt] ?? 3000);
    }
  }

  throw lastError ?? new Error('Gemini request failed.');
}

async function askGeminiDirect(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is missing. Add VITE_GEMINI_API_KEY to .env.local.');
  }

  const response = await fetch(DIRECT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Gemini free-tier rate limit hit. Try again in a bit.');
    }
    const errBody = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return text;
}

async function askGeminiViaProxy(prompt: string): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Gemini free-tier rate limit hit. Try again in a bit.');
    }
    throw new Error(data?.error || `Gemini request failed (${response.status}).`);
  }

  if (!data?.text) {
    throw new Error('Gemini returned an empty response.');
  }

  return data.text;
}
