// types/recruiter.ts (Dev B owned)
import type { ActionResult, ApplicationStatus, Profile, Assessment, ParsedResume } from '@/types/core';

export type { ActionResult, ApplicationStatus, Profile, Assessment, ParsedResume };

export type SkillRequirement = {
  name: string;
  importance: 1 | 2 | 3 | 4 | 5;
  required: boolean;
};

export type JobInput = {
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: string;
  description: string;
  skills: SkillRequirement[];
  min_experience_years: number;
  qualifications: string;
};

export type Job = JobInput & {
  id: string;
  recruiter_id: string;
  status: 'open' | 'closed';
  created_at: string;
  applicant_count?: number;
};

export type ApplicantRow = {
  application_id: string;
  candidate_name: string;
  status: ApplicationStatus;
  total_score: number | null;
  breakdown: {
    skills: number;
    experience: number;
    projects: number;
    qualifications: number;
  } | null;
  top_matched: string[];
  top_gaps: string[];
  created_at: string;
};

export type ApplicationEventItem = {
  id: string;
  application_id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  changed_by_name?: string | null;
  note: string | null;
  created_at: string;
};

export type RecruiterNote = {
  id: string;
  application_id: string;
  recruiter_id: string;
  note: string;
  created_at: string;
  author_name?: string | null;
};

export type ApplicationDetail = {
  application: {
    id: string;
    job_id: string;
    candidate_id: string;
    resume_id: string;
    status: ApplicationStatus;
    created_at: string;
    updated_at: string;
  };
  job: Job | null;
  candidate: Profile | null;
  resume: ParsedResume | null;
  assessment: Assessment | null;
  events: ApplicationEventItem[];
  notes: RecruiterNote[];
};

export type InterviewQuestion = {
  id: string;
  application_id: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'role' | 'project';
  question: string;
  answer_guide: string;
};

export type InterviewFeedback = {
  technical: number;
  communication: number;
  problem_solving: number;
  recommendation: 'hire' | 'hold' | 'no_hire';
  comments: string;
};

export type Interview = {
  id: string;
  application_id: string;
  interviewer_name: string;
  scheduled_at: string;
  duration_min: number;
  type: 'technical' | 'hr' | 'managerial';
  feedback: InterviewFeedback | null;
  decision: 'selected' | 'rejected' | null;
};

export type Analytics = {
  totals: {
    active_jobs: number;
    applications: number;
    shortlisted: number;
    pending_reviews: number;
    interviews: number;
  };
  by_job: { job_title: string; applications: number }[];
  by_stage: { stage: ApplicationStatus; count: number }[];
  shortlist_rate: number;
  avg_processing_hours: number;
  common_gaps: { skill: string; count: number }[];
};
