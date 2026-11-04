'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Award,
  Loader2,
  FileCheck,
  Star,
} from 'lucide-react';
import {
  getInterviewForApplication,
  scheduleInterview,
  saveFeedback,
  recordDecision,
} from '@/app/actions/scheduling';
import type { ApplicationStatus } from '@/types/core';
import type { Interview, InterviewFeedback } from '@/types/recruiter';
import { cn } from '@/lib/utils';

interface InterviewPanelProps {
  applicationId: string;
  status: ApplicationStatus;
}

export function InterviewPanel({ applicationId, status }: InterviewPanelProps) {
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  // Scheduling Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [type, setType] = useState<'technical' | 'hr' | 'managerial'>('technical');
  const [durationMin, setDurationMin] = useState('45');
  const [isScheduling, setIsScheduling] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Feedback Form State
  const [technical, setTechnical] = useState(4);
  const [communication, setCommunication] = useState(4);
  const [problemSolving, setProblemSolving] = useState(4);
  const [recommendation, setRecommendation] = useState<'hire' | 'hold' | 'no_hire'>('hire');
  const [comments, setComments] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  // Decision State
  const [decisionAction, setDecisionAction] = useState<'selected' | 'rejected' | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const fetchInterview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInterviewForApplication(applicationId);
      if (res.ok) {
        setInterview(res.data);
        if (res.data?.feedback) {
          setTechnical(res.data.feedback.technical);
          setCommunication(res.data.feedback.communication);
          setProblemSolving(res.data.feedback.problem_solving);
          setRecommendation(res.data.feedback.recommendation);
          setComments(res.data.feedback.comments);
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchInterview();
  }, [fetchInterview]);

  const handleSchedule = async (force = false) => {
    if (!date || !time) {
      toast.error('Please specify both an interview date and time');
      return;
    }
    if (!interviewerName.trim()) {
      toast.error('Please enter the interviewer name');
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    setIsScheduling(true);
    const toastId = toast.loading('Scheduling interview...');

    try {
      const res = await scheduleInterview({
        application_id: applicationId,
        interviewer_name: interviewerName.trim(),
        scheduled_at: scheduledAt,
        duration_min: Number(durationMin),
        type,
        force,
      });

      if (res.ok) {
        if (!res.data.saved && 'conflict' in res.data) {
          setConflictWarning(res.data.conflict);
          toast.warning('Schedule conflict detected', { id: toastId });
        } else if (res.data.saved) {
          toast.success(res.data.message, { id: toastId });
          setInterview(res.data.interview);
          setConflictWarning(null);
          router.refresh();
        }
      } else {
        toast.error(res.error, { id: toastId });
      }
    } catch {
      toast.error('Failed to schedule interview', { id: toastId });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSaveFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interview) return;
    if (!comments.trim()) {
      toast.error('Please provide interview evaluation comments');
      return;
    }

    setIsSavingFeedback(true);
    const toastId = toast.loading('Saving evaluation feedback...');

    try {
      const res = await saveFeedback(interview.id, {
        technical,
        communication,
        problem_solving: problemSolving,
        recommendation,
        comments: comments.trim(),
      });

      if (res.ok) {
        toast.success('Interview feedback saved successfully', { id: toastId });
        setInterview(res.data);
        router.refresh();
      } else {
        toast.error(res.error, { id: toastId });
      }
    } catch {
      toast.error('Failed to save feedback', { id: toastId });
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const handleDecisionSubmit = async () => {
    if (!decisionAction) return;

    setIsSubmittingDecision(true);
    const toastId = toast.loading(`Recording final hiring decision (${decisionAction})...`);

    try {
      const res = await recordDecision(
        applicationId,
        decisionAction,
        decisionNote.trim() ? decisionNote.trim() : undefined
      );

      if (res.ok) {
        toast.success(res.data.message, { id: toastId });
        setDecisionAction(null);
        setDecisionNote('');
        if (interview) {
          setInterview({ ...interview, decision: res.data.decision });
        }
        router.refresh();
      } else {
        toast.error(res.error, { id: toastId });
      }
    } catch {
      toast.error('Failed to record decision', { id: toastId });
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const isShortlistedOrBeyond = [
    'shortlisted',
    'interview',
    'selected',
    'rejected',
  ].includes(status);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 text-center py-8">
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-500 mb-2" />
        <span className="text-xs text-slate-400">Loading interview details...</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Interview & Evaluation Pipeline
            </h3>
            <p className="text-xs text-slate-500">
              Schedule sessions, record structured feedback, and make final hiring decisions
            </p>
          </div>
        </div>

        {interview?.decision && (
          <Badge
            variant="outline"
            className={cn(
              'capitalize text-xs font-bold px-3 py-1',
              interview.decision === 'selected'
                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
            )}
          >
            Decision: {interview.decision}
          </Badge>
        )}
      </div>

      {!interview ? (
        /* No Interview Scheduled Yet */
        <div className="space-y-4">
          {!isShortlistedOrBeyond && (
            <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-semibold block">Candidate Not Shortlisted Yet</span>
                Shortlist the candidate first using the action bar below before scheduling an interview.
              </div>
            </div>
          )}

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-zinc-800/40 dark:border-zinc-800 space-y-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              Schedule New Interview Session
            </h4>

            {conflictWarning && (
              <div className="rounded-lg bg-amber-100/70 p-3 border border-amber-300 text-xs text-amber-900 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>{conflictWarning}</span>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setConflictWarning(null)}
                    className="h-7 text-xs bg-white"
                  >
                    Adjust Time
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSchedule(true)}
                    className="h-7 text-xs bg-amber-700 hover:bg-amber-800 text-white"
                  >
                    Schedule Anyway
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Time
                </label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Interviewer Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Interview Type
                </label>
                <Select
                  value={type}
                  onValueChange={(val) => {
                    if (val === 'technical' || val === 'hr' || val === 'managerial') {
                      setType(val);
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="hr">HR / Culture</SelectItem>
                    <SelectItem value="managerial">Managerial / Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Duration
                </label>
                <Select
                  value={durationMin}
                  onValueChange={(val) => {
                    if (val) setDurationMin(val);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={() => handleSchedule(false)}
                disabled={isScheduling || !isShortlistedOrBeyond}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-4 inline-flex items-center gap-1.5"
              >
                {isScheduling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Checking conflicts & scheduling...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Schedule Interview</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Scheduled Interview Details & Feedback */
        <div className="space-y-6">
          {/* Scheduled Details Card */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 dark:bg-zinc-800/40 dark:border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="capitalize font-semibold text-xs bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300"
                >
                  {interview.type} Interview
                </Badge>
                {interview.decision && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'capitalize text-xs font-bold',
                      interview.decision === 'selected'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    )}
                  >
                    Outcome: {interview.decision}
                  </Badge>
                )}
              </div>

              <span className="text-xs text-slate-400">
                Duration: {interview.duration_min} minutes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Date:</strong>{' '}
                  {new Date(interview.scheduled_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Time:</strong>{' '}
                  {new Date(interview.scheduled_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 sm:col-span-2">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Assigned Interviewer:</strong> {interview.interviewer_name}
                </span>
              </div>
            </div>
          </div>

          {/* Structured Feedback Form */}
          <form
            onSubmit={handleSaveFeedbackSubmit}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-indigo-600" />
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                  Structured Interview Evaluation Rubric
                </h4>
              </div>
              {interview.feedback && (
                <span className="text-[11px] text-emerald-600 font-medium">
                  Feedback recorded
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Technical */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Technical Depth (1-5)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{technical}/5</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setTechnical(score)}
                      className={cn(
                        'flex-1 py-1.5 rounded text-xs font-semibold border transition-all',
                        technical >= score
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Communication */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Communication (1-5)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{communication}/5</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setCommunication(score)}
                      className={cn(
                        'flex-1 py-1.5 rounded text-xs font-semibold border transition-all',
                        communication >= score
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Solving */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Problem Solving (1-5)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{problemSolving}/5</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setProblemSolving(score)}
                      className={cn(
                        'flex-1 py-1.5 rounded text-xs font-semibold border transition-all',
                        problemSolving >= score
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Overall Recommendation
              </label>
              <Select
                value={recommendation}
                onValueChange={(val) => {
                  if (val === 'hire' || val === 'hold' || val === 'no_hire') {
                    setRecommendation(val);
                  }
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hire">Hire (Strong Recommendation)</SelectItem>
                  <SelectItem value="hold">Hold (Needs Second Opinion / Additional Probes)</SelectItem>
                  <SelectItem value="no_hire">No Hire (Does Not Meet Bar)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comments Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Interviewer Assessment Comments
              </label>
              <Textarea
                placeholder="Detail technical strengths, answers to project probes, communication style, and cultural signals..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isSavingFeedback || !comments.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 inline-flex items-center gap-1.5"
              >
                {isSavingFeedback ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                <span>Save Interview Feedback</span>
              </Button>
            </div>
          </form>

          {/* Final Hiring Decision Buttons - Available when status === 'interview' */}
          {status === 'interview' && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                    Make Final Hiring Decision
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Candidate is in active interview stage. Final decisions trigger audit events and simulated notifications.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setDecisionAction('selected')}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-9 px-4 inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Award className="h-4 w-4" />
                  <span>Select Candidate (Offer)</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => setDecisionAction('rejected')}
                  className="text-xs h-9 px-4 inline-flex items-center gap-1.5"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject Candidate</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Decision Confirmation Dialog */}
      <Dialog
        open={decisionAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDecisionAction(null);
            setDecisionNote('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Confirm Final Decision: {decisionAction === 'selected' ? 'Select Candidate for Offer' : 'Reject Candidate'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {decisionAction === 'selected'
                ? 'This moves the candidate to the "selected" stage and simulates sending an official job offer letter.'
                : 'This declines the application and logs the final audit status change.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Decision Note (Optional)
            </label>
            <Textarea
              placeholder="Add final hiring summary or reason for audit trail..."
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSubmittingDecision}
              onClick={() => setDecisionAction(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmittingDecision}
              onClick={handleDecisionSubmit}
              className={cn(
                'text-xs inline-flex items-center gap-1.5 text-white',
                decisionAction === 'selected'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-red-600 hover:bg-red-700'
              )}
            >
              {isSubmittingDecision ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <span>Confirm {decisionAction === 'selected' ? 'Selection' : 'Rejection'}</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
