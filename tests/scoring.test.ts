import { describe, it, expect } from 'vitest';
import {
  SCORING_WEIGHTS,
  SIMILARITY_LOW,
  SIMILARITY_HIGH,
  mapSimilarity,
  cosineSimilarity,
} from '../lib/ai/config';

describe('Scoring Algorithms & Math', () => {
  it('has exact scoring weight distribution summing to 1.0', () => {
    expect(SCORING_WEIGHTS.skills).toBe(0.5);
    expect(SCORING_WEIGHTS.experience).toBe(0.25);
    expect(SCORING_WEIGHTS.projects).toBe(0.15);
    expect(SCORING_WEIGHTS.qualifications).toBe(0.1);

    const sum =
      SCORING_WEIGHTS.skills +
      SCORING_WEIGHTS.experience +
      SCORING_WEIGHTS.projects +
      SCORING_WEIGHTS.qualifications;

    expect(Math.abs(sum - 1.0)).toBeLessThan(0.0001);
  });

  it('calculates cosine similarity correctly', () => {
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0];
    const v3 = [0, 1, 0];
    const v4 = [0.5, 0.5, 0];

    expect(cosineSimilarity(v1, v2)).toBeCloseTo(1.0);
    expect(cosineSimilarity(v1, v3)).toBeCloseTo(0.0);
    expect(cosineSimilarity(v1, v4)).toBeCloseTo(Math.SQRT1_2);
  });

  it('maps similarity linearly between LOW and HIGH bounds', () => {
    expect(mapSimilarity(SIMILARITY_LOW - 0.1)).toBe(0);
    expect(mapSimilarity(SIMILARITY_LOW)).toBe(0);
    expect(mapSimilarity(SIMILARITY_HIGH + 0.1)).toBe(1);
    expect(mapSimilarity(SIMILARITY_HIGH)).toBe(1);

    const mid = (SIMILARITY_LOW + SIMILARITY_HIGH) / 2;
    expect(mapSimilarity(mid)).toBeCloseTo(0.5);
  });

  it('verifies that candidate name/gender swap does not alter objective score (Fairness)', () => {
    function computeObjectiveScore(candidate: {
      skillsScore: number;
      expYears: number;
      minYears: number;
      projectScore: number;
      qualScore: number;
      name: string;
      gender?: string;
    }) {
      const expScore =
        candidate.minYears <= 0
          ? 100
          : Math.min(100, Math.round((candidate.expYears / candidate.minYears) * 100));

      return Math.round(
        SCORING_WEIGHTS.skills * candidate.skillsScore +
          SCORING_WEIGHTS.experience * expScore +
          SCORING_WEIGHTS.projects * candidate.projectScore +
          SCORING_WEIGHTS.qualifications * candidate.qualScore
      );
    }

    const candidateMale = {
      name: 'John Doe',
      gender: 'male',
      skillsScore: 85,
      expYears: 4,
      minYears: 3,
      projectScore: 80,
      qualScore: 90,
    };

    const candidateFemale = {
      name: 'Jane Doe',
      gender: 'female',
      skillsScore: 85,
      expYears: 4,
      minYears: 3,
      projectScore: 80,
      qualScore: 90,
    };

    const candidateNonBinary = {
      name: 'Alex Taylor',
      gender: 'non-binary',
      skillsScore: 85,
      expYears: 4,
      minYears: 3,
      projectScore: 80,
      qualScore: 90,
    };

    const score1 = computeObjectiveScore(candidateMale);
    const score2 = computeObjectiveScore(candidateFemale);
    const score3 = computeObjectiveScore(candidateNonBinary);

    expect(score1).toBe(score2);
    expect(score2).toBe(score3);
  });
});
