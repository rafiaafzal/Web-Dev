import { describe, it, expect } from 'vitest';
import { verifyExcerpt, verifyParsedResume } from '../lib/ai/verify';
import type { ParsedResume } from '../types/core';

describe('Hallucination & Evidence Verification', () => {
  const sampleRawText = `
    Jane Doe
    Senior Software Engineer with 5 years of experience building scalable backend APIs.
    Core Skills: Python, Django, PostgreSQL, Docker, and Kubernetes.
    Experience:
    Backend Engineer at TechCorp from 2021 to 2024. Architected high-throughput microservices.
    Projects:
    E-Commerce API: Built an inventory management system using Django and PostgreSQL.
    Education:
    B.S. in Computer Science, University of Technology, 2020.
  `;

  it('verifies exact and case/whitespace-insensitive excerpts', () => {
    expect(
      verifyExcerpt(
        sampleRawText,
        'Senior Software Engineer with 5 years of experience'
      )
    ).toBe(true);

    expect(
      verifyExcerpt(
        sampleRawText,
        'senior  software   engineer with 5 years of experience'
      )
    ).toBe(true);

    expect(
      verifyExcerpt(
        sampleRawText,
        'Built an inventory management system using Django and PostgreSQL.'
      )
    ).toBe(true);
  });

  it('rejects hallucinated or absent claims', () => {
    expect(
      verifyExcerpt(sampleRawText, 'Lead AI Researcher at OpenAI')
    ).toBe(false);

    expect(
      verifyExcerpt(sampleRawText, '10 years of Rust development')
    ).toBe(false);

    expect(verifyExcerpt(sampleRawText, '')).toBe(false);
  });

  it('flags unverified skills and populates unsupported claims list', () => {
    const parsed: ParsedResume = {
      name: 'Jane Doe',
      email: null,
      phone: null,
      skills: [
        {
          name: 'Python',
          excerpt: 'Core Skills: Python, Django',
          verified: false,
        },
        {
          name: 'Rust',
          excerpt: 'Expertise in Rust compiler optimizations', // Not in sample text
          verified: false,
        },
      ],
      education: [],
      experience: [],
      projects: [],
      total_experience_years: 5,
    };

    const { verifiedResume, unsupportedClaims } = verifyParsedResume(
      sampleRawText,
      parsed
    );

    expect(verifiedResume.skills[0].verified).toBe(true);
    expect(verifiedResume.skills[1].verified).toBe(false);
    expect(unsupportedClaims.length).toBe(1);
    expect(unsupportedClaims[0]).toContain('Rust');
  });
});
