import { describe, it, expect } from 'vitest';
import { normalizeSkill, normalizeSkills } from '../lib/ai/normalize';

describe('Skill Normalization', () => {
  it('normalizes common programming language aliases', () => {
    expect(normalizeSkill('js')).toBe('JavaScript');
    expect(normalizeSkill('javascript')).toBe('JavaScript');
    expect(normalizeSkill('py')).toBe('Python');
    expect(normalizeSkill('python3')).toBe('Python');
    expect(normalizeSkill('ts')).toBe('TypeScript');
    expect(normalizeSkill('golang')).toBe('Go');
  });

  it('normalizes database and infrastructure aliases', () => {
    expect(normalizeSkill('postgres')).toBe('PostgreSQL');
    expect(normalizeSkill('postgresql')).toBe('PostgreSQL');
    expect(normalizeSkill('k8s')).toBe('Kubernetes');
    expect(normalizeSkill('docker')).toBe('Docker');
    expect(normalizeSkill('mongo')).toBe('MongoDB');
    expect(normalizeSkill('node')).toBe('Node.js');
    expect(normalizeSkill('nodejs')).toBe('Node.js');
  });

  it('deduplicates and preserves order across mixed aliases', () => {
    const input = ['js', 'JavaScript', 'PYTHON', 'py', 'Docker', 'docker', 'PostgreSQL', 'postgres'];
    const result = normalizeSkills(input);
    expect(result).toEqual(['JavaScript', 'Python', 'Docker', 'PostgreSQL']);
  });

  it('handles unknown skills gracefully', () => {
    expect(normalizeSkill('GraphQL Apollo')).toBe('GraphQL Apollo');
  });
});
