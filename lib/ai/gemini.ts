import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const embeddingModelName = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';

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

async function retryOn429<T>(fn: () => Promise<T>, retries = 1, delayMs = 1500): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const errorStr = String(err);
    if ((errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return retryOn429(fn, retries - 1, delayMs * 2);
    }
    throw err;
  }
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

  return retryOn429(async () => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const cleaned = cleanJsonString(text);
    const parsed = JSON.parse(cleaned);
    return schema.parse(parsed);
  });
}

export async function embed(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  const ai = getAI();

  return retryOn429(async () => {
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
  });
}
