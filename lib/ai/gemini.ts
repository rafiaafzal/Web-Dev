import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const embeddingModelName = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
const fallbackModelName = process.env.GEMINI_FALLBACK_MODEL;

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment variables.');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const TRANSIENT_PATTERNS = [
  '503',
  'unavailable',
  'high demand',
  'overloaded',
  '500',
  'internal',
  '429',
  'resource_exhausted',
  'fetch failed',
  'etimedout',
  'econnreset',
];

function isTransientError(error: unknown): boolean {
  const errStr = String(error).toLowerCase();
  return TRANSIENT_PATTERNS.some((p) => errStr.includes(p));
}

const RETRY_DELAYS = [2000, 5000, 10000];

async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 4
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      if (!isTransientError(err) || attempt === maxAttempts) {
        throw err;
      }
      const baseDelay = RETRY_DELAYS[attempt - 1] ?? 10000;
      const jitter = Math.floor(Math.random() * 500);
      await new Promise((resolve) => setTimeout(resolve, baseDelay + jitter));
    }
  }
  throw lastErr;
}

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

export async function generateJSON<T>(
  prompt: string,
  schema: z.ZodType<T>
): Promise<T> {
  const ai = getAI();

  async function executeSingleAttempt(targetModel: string): Promise<T> {
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const cleaned = cleanJsonString(text);
    const parsed = JSON.parse(cleaned);
    return schema.parse(parsed);
  }

  // Handles 1 retry on JSON parse or zod validation error
  async function executeWithParseRetry(targetModel: string): Promise<T> {
    try {
      return await executeSingleAttempt(targetModel);
    } catch (err: unknown) {
      const isParseOrZodError =
        err instanceof SyntaxError ||
        err instanceof z.ZodError ||
        (err instanceof Error && err.name === 'ZodError');

      if (isParseOrZodError) {
        console.warn('Gemini JSON parsing/validation failed on first try, retrying once...');
        return await executeSingleAttempt(targetModel);
      }
      throw err;
    }
  }

  // Primary model execution with central retry
  try {
    return await callWithRetry(() => executeWithParseRetry(modelName), 4);
  } catch (primaryErr: unknown) {
    if (isTransientError(primaryErr)) {
      // Model fallback if GEMINI_FALLBACK_MODEL is configured and different
      if (fallbackModelName && fallbackModelName !== modelName) {
        try {
          return await callWithRetry(() => executeWithParseRetry(fallbackModelName), 2);
        } catch (fallbackErr: unknown) {
          console.error('Gemini fallback model call failed:', fallbackErr);
          if (isTransientError(fallbackErr)) {
            throw new Error('The AI service is busy right now. Please try again in a few seconds.');
          }
          throw fallbackErr;
        }
      }

      console.error('Gemini primary model call failed after retries:', primaryErr);
      throw new Error('The AI service is busy right now. Please try again in a few seconds.');
    }
    throw primaryErr;
  }
}

export async function embed(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  const ai = getAI();

  try {
    return await callWithRetry(async () => {
      const response = await ai.models.embedContent({
        model: embeddingModelName,
        contents: texts,
        config: {
          outputDimensionality: 768,
        },
      });

      const respAny = response as unknown as {
        embeddings?: { values?: number[] }[];
        embedding?: { values?: number[] };
      };

      if (respAny.embeddings && respAny.embeddings.length > 0) {
        return respAny.embeddings.map((e) => e.values || []);
      }

      if (respAny.embedding?.values) {
        return [respAny.embedding.values];
      }

      // Fallback: handle individual calls if needed
      const results: number[][] = [];
      for (const text of texts) {
        const single = await ai.models.embedContent({
          model: embeddingModelName,
          contents: text,
          config: {
            outputDimensionality: 768,
          },
        });
        const singleAny = single as unknown as {
          embeddings?: { values?: number[] }[];
          embedding?: { values?: number[] };
        };
        const vals =
          singleAny.embeddings?.[0]?.values ||
          singleAny.embedding?.values ||
          new Array(768).fill(0);
        results.push(vals);
      }
      return results;
    }, 4);
  } catch (err: unknown) {
    if (isTransientError(err)) {
      console.error('Gemini embed call failed after retries:', err);
      throw new Error('The AI service is busy right now. Please try again in a few seconds.');
    }
    throw err;
  }
}
