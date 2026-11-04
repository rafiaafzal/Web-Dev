'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  getMyResume,
  uploadResume,
  updateParsedResume,
} from '@/app/actions/resumes';
import type { Resume, ParsedResume } from '@/types/core';

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
        if (res.data.status === 'empty') {
          setMessage({
            type: 'info',
            text: 'Scanned or image-based PDF detected. Low text found. Please update details manually below.',
          });
        } else {
          setMessage({
            type: 'success',
            text: 'Resume uploaded and successfully parsed by Gemini AI!',
          });
        }
      } else {
        setMessage({ type: 'error', text: res.error });
      }
    });
  }

  async function handleSaveCorrections(e: React.FormEvent) {
    e.preventDefault();
    if (!editableParsed) return;

    startTransition(async () => {
      const res = await updateParsedResume(editableParsed);
      if (res.ok) {
        setResume(res.data);
        setEditableParsed(res.data.parsed);
        setIsEditing(false);
        setMessage({
          type: 'success',
          text: 'Parsed resume fields updated and re-verified successfully!',
        });
      } else {
        setMessage({ type: 'error', text: res.error });
      }
    });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Title & Upload Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Resume & Skills Profile
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Upload your PDF resume. Our AI extracts evidence, checks for hallucinations, and matches you to roles.
            </p>
          </div>

          <div>
            <label className="relative inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm transition">
              <span>{isPending ? 'Processing...' : 'Upload New PDF'}</span>
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
            className={`mt-4 p-4 rounded-lg text-sm border flex items-center justify-between ${
              message.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            <span>{message.text}</span>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="text-xs font-semibold underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-slate-500 mt-3">Loading resume profile...</p>
        </div>
      ) : !resume ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 mx-auto text-slate-400 mb-3">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No resume uploaded yet
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Upload your PDF resume to automatically parse skills, projects, and work experience.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resume Overview Header */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-slate-900">
                  {resume.file_name}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    resume.status === 'parsed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : resume.status === 'empty'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {resume.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Uploaded on {new Date(resume.created_at).toLocaleDateString()}
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Parsed Fields'}
              </button>
            </div>
          </div>

          {/* Parsed Resume Details / Form */}
          {editableParsed && (
            <form onSubmit={handleSaveCorrections} className="space-y-6">
              {/* Basic Candidate Info */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Basic Candidate Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editableParsed.name}
                        onChange={(e) =>
                          setEditableParsed({
                            ...editableParsed,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    ) : (
                      <div className="text-sm font-medium text-slate-900">
                        {editableParsed.name || 'N/A'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editableParsed.email || ''}
                        onChange={(e) =>
                          setEditableParsed({
                            ...editableParsed,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    ) : (
                      <div className="text-sm font-medium text-slate-900">
                        {editableParsed.email || 'N/A'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editableParsed.phone || ''}
                        onChange={(e) =>
                          setEditableParsed({
                            ...editableParsed,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    ) : (
                      <div className="text-sm font-medium text-slate-900">
                        {editableParsed.phone || 'N/A'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Total Experience (Years)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={editableParsed.total_experience_years}
                        onChange={(e) =>
                          setEditableParsed({
                            ...editableParsed,
                            total_experience_years: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    ) : (
                      <div className="text-sm font-bold text-blue-600">
                        {editableParsed.total_experience_years} years
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills with Evidence and Verification Badges */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Extracted & Verified Skills
                  </h2>
                  <span className="text-xs text-slate-500">
                    {editableParsed.skills.length} skills found
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {editableParsed.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium bg-slate-50 border-slate-200 text-slate-800"
                    >
                      <span>{skill.name}</span>
                      {skill.verified ? (
                        <span
                          title={`Verified excerpt: "${skill.excerpt}"`}
                          className="inline-flex items-center text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold"
                        >
                          ✓ Verified
                        </span>
                      ) : (
                        <span
                          title="No exact excerpt match in raw text (hallucination flag)"
                          className="inline-flex items-center text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold"
                        >
                          ⚠ Unverified
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Work Experience
                </h2>
                {editableParsed.experience.length === 0 ? (
                  <p className="text-xs text-slate-500">No experience records detected.</p>
                ) : (
                  <div className="space-y-4">
                    {editableParsed.experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">
                            {exp.title}
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                            {exp.years} years
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-700">
                          {exp.company}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {exp.summary}
                        </p>
                        {exp.excerpt && (
                          <div className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                            &quot;{exp.excerpt}&quot;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Projects */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Projects & Technical Work
                </h2>
                {editableParsed.projects.length === 0 ? (
                  <p className="text-xs text-slate-500">No projects detected.</p>
                ) : (
                  <div className="space-y-4">
                    {editableParsed.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2"
                      >
                        <div className="text-sm font-bold text-slate-900">
                          {proj.name}
                        </div>
                        <p className="text-xs text-slate-600">
                          {proj.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(proj.tech || []).map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 border border-blue-100 font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Education & Qualifications
                </h2>
                {editableParsed.education.length === 0 ? (
                  <p className="text-xs text-slate-500">No education entries found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editableParsed.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border border-slate-100 bg-slate-50/50"
                      >
                        <div className="text-sm font-bold text-slate-900">
                          {edu.degree}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          {edu.institution} {edu.year ? `(${edu.year})` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button when Editing */}
              {isEditing && (
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : 'Save & Re-verify Fields'}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
