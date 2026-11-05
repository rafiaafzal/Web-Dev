'use client';

export const maxDuration = 60;

import React, { useState, useEffect, useTransition } from 'react';
import {
  getMyResume,
  uploadResume,
  updateParsedResume,
} from '@/app/actions/resumes';
import type { Resume, ParsedResume } from '@/types/core';
import { FileText, Upload, Sparkles, CheckCircle2, AlertCircle, Edit2, Save, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function CandidateResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Edit state for parsed fields
  const [editableParsed, setEditableParsed] = useState<ParsedResume | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadResume();
  }, []);

  async function loadResume() {
    setIsLoading(true);
    const res = await getMyResume();
    if (res.ok) {
      setResume(res.data);
      if (res.data?.parsed) {
        setEditableParsed(res.data.parsed);
      }
    } else {
      setMessage({ type: 'error', text: res.error });
    }
    setIsLoading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setMessage({
        type: 'error',
        text: 'Please upload a PDF document (.pdf format only).',
      });
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'File size exceeds the 4 MB limit.',
      });
      return;
    }

    setMessage({
      type: 'info',
      text: 'Extracting text and analyzing resume with Gemini AI... Please wait.',
    });

    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      const res = await uploadResume(formData);
      if (res.ok) {
        setResume(res.data);
        if (res.data.parsed) {
          setEditableParsed(res.data.parsed);
        }
        setMessage({
          type: 'success',
          text: 'Resume successfully parsed, verified against raw text, and embedded with 768-dim vectors.',
        });
      } else {
        setMessage({
          type: 'error',
          text: res.error,
        });
      }
    });
  }

  async function handleSaveEdits() {
    if (!resume || !editableParsed) return;

    startTransition(async () => {
      const res = await updateParsedResume(editableParsed);
      if (res.ok) {
        setResume(res.data);
        setIsEditing(false);
        setMessage({
          type: 'success',
          text: 'Profile corrections saved successfully.',
        });
      } else {
        setMessage({
          type: 'error',
          text: res.error,
        });
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Resume & Skills Dossier
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload your PDF resume. AI extracts verified evidence, eliminates hallucinations, and matches you to roles.
            </p>
          </div>

          <div>
            <label className="relative inline-flex items-center justify-center h-10 px-4 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 cursor-pointer shadow-xs transition">
              <Upload className="h-4 w-4 mr-2" />
              <span>{isPending ? 'Processing...' : 'Upload PDF Resume'}</span>
              <input
                type="file"
                accept="application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={isPending}
              />
            </label>
          </div>
        </div>

        {/* Status Alerts */}
        {message && (
          <div
            className={cn(
              "mt-4 p-3.5 rounded-lg text-xs border flex items-center justify-between",
              message.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300"
                : message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300"
                : "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-300"
            )}
          >
            <span>{message.text}</span>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="text-xs font-semibold underline ml-4 hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Loading resume profile...</p>
        </div>
      ) : !resume ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200/80 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
          <FileText className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No resume uploaded yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Upload your PDF resume to automatically parse skills, projects, and work experience with verified evidence.
          </p>
          <label className="relative inline-flex items-center justify-center h-9 px-4 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 cursor-pointer shadow-xs transition">
            <Upload className="h-3.5 w-3.5 mr-2" />
            <span>Select PDF File</span>
            <input
              type="file"
              accept="application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={isPending}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resume Overview Header */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs dark:bg-zinc-900 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {resume.file_name}
                </span>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium border capitalize",
                    resume.status === 'parsed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                      : resume.status === 'empty'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  )}
                >
                  {resume.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Uploaded {new Date(resume.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 text-xs border-slate-200 text-slate-700 dark:border-zinc-800 dark:text-zinc-300"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                {isEditing ? 'Cancel Edit' : 'Edit Fields'}
              </Button>

              {isEditing && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveEdits}
                  disabled={isPending}
                  className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>

          {/* Parsed Resume Details */}
          {editableParsed && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Personal info & Skills */}
              <div className="space-y-6">
                {/* Candidate Overview Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Contact & Experience
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500">Name</label>
                      {isEditing ? (
                        <Input
                          value={editableParsed.name}
                          onChange={(e) =>
                            setEditableParsed({ ...editableParsed, name: e.target.value })
                          }
                          className="h-8 text-xs mt-1"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {editableParsed.name || 'Not extracted'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-500">Email</label>
                      {isEditing ? (
                        <Input
                          value={editableParsed.email || ''}
                          onChange={(e) =>
                            setEditableParsed({ ...editableParsed, email: e.target.value })
                          }
                          className="h-8 text-xs mt-1"
                        />
                      ) : (
                        <p className="text-xs text-slate-700 dark:text-zinc-300">
                          {editableParsed.email || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-500">Total Experience</label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editableParsed.total_experience_years}
                          onChange={(e) =>
                            setEditableParsed({
                              ...editableParsed,
                              total_experience_years: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="h-8 text-xs mt-1"
                        />
                      ) : (
                        <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                          {editableParsed.total_experience_years} years
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Verified Skills ({editableParsed.skills?.length || 0})
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(editableParsed.skills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border",
                          skill.verified
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                        title={skill.excerpt ? `Verified quote: "${skill.excerpt}"` : undefined}
                      >
                        {skill.name}
                        {skill.verified && <CheckCircle2 className="h-3 w-3 ml-1 text-emerald-600" />}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Columns (2/3): Experience & Projects */}
              <div className="lg:col-span-2 space-y-6">
                {/* Experience */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Work Experience
                  </h3>
                  <div className="space-y-4">
                    {(editableParsed.experience || []).map((exp, idx) => (
                      <div key={idx} className="border-l-2 border-slate-200 dark:border-zinc-800 pl-3.5 py-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {exp.title} • <span className="font-normal text-slate-500">{exp.company}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{exp.years} years</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                          {exp.summary}
                        </p>
                        {exp.excerpt && (
                          <p className="text-[11px] italic text-slate-400 mt-1 bg-slate-50 dark:bg-zinc-950 p-2 rounded border border-slate-100 dark:border-zinc-800">
                            &ldquo;{exp.excerpt}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Key Projects
                  </h3>
                  <div className="space-y-4">
                    {(editableParsed.projects || []).map((proj, idx) => (
                      <div key={idx} className="border-l-2 border-slate-200 dark:border-zinc-800 pl-3.5 py-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {proj.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {proj.description}
                        </p>
                        {proj.tech && proj.tech.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {proj.tech.map((t, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-zinc-800 dark:text-zinc-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
