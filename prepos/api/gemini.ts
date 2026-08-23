// api/gemini.ts
// Vercel serverless function — keeps the Gemini API key server-side.
// The browser never sees GEMINI_API_KEY; it only talks to this endpoint.

export const config = { runtime: 'edge' };

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // Access environment variable without referencing the Node 'process' symbol
  // directly (not available in all runtimes, e.g. Edge). Falls back safely.
  const apiKey = (globalThis as any).process?.env?.GEMINI_API_KEY || (globalThis as any).GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server is missing GEMINI_API_KEY. Add it in Vercel project settings.' }),
      { status: 500 }
    );
  }

  let prompt: string;
  let model: string;
  try {
    const body = await req.json();
    prompt = body.prompt;
    model = typeof body.model === 'string' && body.model ? body.model : DEFAULT_MODEL;
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Missing prompt');
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), { status: 400 });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini request failed (${geminiRes.status}): ${errText}` }),
        { status: geminiRes.status }
      );
    }

    const data = await geminiRes.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Gemini returned an empty response.' }), { status: 502 });
    }

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown server error.' }),
      { status: 500 }
    );
  }
}
