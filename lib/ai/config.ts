export const SCORING_WEIGHTS = {
  skills: 0.5,
  experience: 0.25,
  projects: 0.15,
  qualifications: 0.1,
} as const;

export const SIMILARITY_LOW = 0.45;
export const SIMILARITY_HIGH = 0.82;

export function mapSimilarity(
  sim: number,
  low = SIMILARITY_LOW,
  high = SIMILARITY_HIGH
): number {
  if (sim <= low) return 0;
  if (sim >= high) return 1;
  return (sim - low) / (high - low);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
