import type { ParsedResume } from '@/types/core';

export function cleanText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripPunctuation(s: string): string {
  return s
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"’“”–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function verifyExcerpt(rawText: string, excerpt: string): boolean {
  if (!rawText || !excerpt) return false;
  const cleanRaw = cleanText(rawText);
  const cleanEx = cleanText(excerpt);
  if (!cleanEx) return false;

  // Direct substring check
  if (cleanRaw.includes(cleanEx)) {
    return true;
  }

  // Punctuation-insensitive check
  const strippedRaw = stripPunctuation(cleanRaw);
  const strippedEx = stripPunctuation(cleanEx);
  if (strippedEx.length > 0 && strippedRaw.includes(strippedEx)) {
    return true;
  }

  return false;
}

export function verifyParsedResume(
  rawText: string,
  parsed: ParsedResume
): { verifiedResume: ParsedResume; unsupportedClaims: string[] } {
  const unsupportedClaims: string[] = [];

  const verifiedSkills = (parsed.skills || []).map((skill) => {
    const verified = verifyExcerpt(rawText, skill.excerpt);
    if (!verified) {
      unsupportedClaims.push(
        `Skill claim "${skill.name}" has no valid excerpt in resume`
      );
    }
    return {
      ...skill,
      verified,
    };
  });

  const verifiedExperience = (parsed.experience || []).map((exp) => {
    const verified = verifyExcerpt(rawText, exp.excerpt);
    if (!verified) {
      unsupportedClaims.push(
        `Experience claim at "${exp.company}" (${exp.title}) excerpt not found in resume`
      );
    }
    return exp;
  });

  const verifiedProjects = (parsed.projects || []).map((proj) => {
    const verified = verifyExcerpt(rawText, proj.excerpt);
    if (!verified) {
      unsupportedClaims.push(
        `Project claim "${proj.name}" excerpt not found in resume`
      );
    }
    return proj;
  });

  const verifiedEducation = (parsed.education || []).map((edu) => {
    const verified = verifyExcerpt(rawText, edu.excerpt);
    if (!verified) {
      unsupportedClaims.push(
        `Education claim at "${edu.institution}" excerpt not found in resume`
      );
    }
    return edu;
  });

  return {
    verifiedResume: {
      ...parsed,
      skills: verifiedSkills,
      experience: verifiedExperience,
      projects: verifiedProjects,
      education: verifiedEducation,
    },
    unsupportedClaims,
  };
}
