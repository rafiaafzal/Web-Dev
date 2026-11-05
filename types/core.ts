export type Role = 'recruiter' | 'candidate';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  email: string | null;
  created_at?: string;
};

export type ApplicationStatus =
  | 'submitted'
  | 'parsed'
  | 'assessed'
  | 'review'
  | 'shortlisted'
  | 'rejected'
  | 'interview'
  | 'selected';

export type ParsedResume = {
  name: string;
  email: string | null;
  phone: string | null;
  skills: { name: string; excerpt: string; verified: boolean }[];
  education: { degree: string; institution: string; year: string | null; excerpt: string }[];
  experience: { title: string; company: string; years: number; summary: string; excerpt: string }[];
  projects: { name: string; description: string; tech: string[]; excerpt: string }[];
  total_experience_years: number;
};

export type Resume = {
  id: string;
  candidate_id: string;
  file_name: string;
  file_path?: string | null;
  raw_text?: string | null;
  status: 'parsed' | 'failed' | 'empty';
  error: string | null;
  parsed: ParsedResume | null;
  created_at: string;
};

export type Assessment = {
  total_score: number; // 0-100
  breakdown: {
    skills: number;
    experience: number;
    projects: number;
    qualifications: number;
  }; // each 0-100
  matched_skills: { skill: string; similarity: number; excerpt: string }[];
  gaps: {
    skill: string;
    status: 'missing_evidence' | 'confirmed_absent';
    note: string;
  }[];
  summary: string;
  learning_suggestions: string[];
  unsupported_claims: string[]; // claims with no resume excerpt, need manual review
};

export type Application = {
  id: string;
  job_id: string;
  candidate_id: string;
  resume_id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  job?: {
    id: string;
    title: string;
    department: string | null;
    location: string | null;
    type: string | null;
    salary: string | null;
    description: string;
  };
  interview?: {
    interviewer_name: string;
    scheduled_at: string;
    duration_min: number;
    type: string;
  } | null;
  assessment?: Assessment;
};
