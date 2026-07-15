// src/lib/geminiClient.ts

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Sends a prompt to Gemini and returns the plain-text response.
 * Throws a readable error if the key is missing, rate-limited, or the call fails.
 */
export async function askGemini(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is missing. Add VITE_GEMINI_API_KEY to .env.local.');
  }

  const response = await fetch(GEMINI_ENDPOINT, {
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
