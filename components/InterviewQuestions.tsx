'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  RotateCw,
  Loader2,
  Check,
  X,
  Briefcase,
  Layers,
} from 'lucide-react';
import {
  listQuestions,
  generateQuestions,
  updateQuestion,
  deleteQuestion,
  regenerateQuestion,
} from '@/app/actions/questions';
import type { InterviewQuestion } from '@/types/recruiter';
import { cn } from '@/lib/utils';

interface InterviewQuestionsProps {
  applicationId: string;
}

export function InterviewQuestions({ applicationId }: InterviewQuestionsProps) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({});

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editGuide, setEditGuide] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listQuestions(applicationId);
      if (res.ok) {
        setQuestions(res.data);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Failed to load interview questions');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleGenerate = async () => {
    setGenerating(true);
    const toastId = toast.loading('Generating tailored interview questions with AI...');
    try {
      const res = await generateQuestions(applicationId);
      if (res.ok) {
        setQuestions(res.data.questions);
        if (res.data.note) {
          toast.info(res.data.note, { id: toastId });
        } else {
          toast.success('Interview questions generated successfully', { id: toastId });
        }
      } else {
        toast.error(res.error, { id: toastId });
      }
    } catch {
      toast.error('An unexpected error occurred', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const handleStartEdit = (q: InterviewQuestion) => {
    setEditingId(q.id);
    setEditQuestion(q.question);
    setEditGuide(q.answer_guide);
    setExpandedGuides((prev) => ({ ...prev, [q.id]: true }));
  };

  const handleSaveEdit = async (q: InterviewQuestion) => {
    if (!editQuestion.trim() || !editGuide.trim()) {
      toast.error('Question and answer guide cannot be empty');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await updateQuestion(q.id, {
        question: editQuestion.trim(),
        answer_guide: editGuide.trim(),
        difficulty: q.difficulty,
      });

      if (res.ok) {
        toast.success('Question updated');
        setQuestions((prev) =>
          prev.map((item) => (item.id === q.id ? res.data : item))
        );
        setEditingId(null);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Failed to update question');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteQuestion(deletingId);
      if (res.ok) {
        toast.success('Question removed');
        setQuestions((prev) => prev.filter((q) => q.id !== deletingId));
        setDeletingId(null);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Failed to delete question');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegenerate = async (id: string) => {
    setRegeneratingId(id);
    const toastId = toast.loading('Regenerating replacement question...');
    try {
      const res = await regenerateQuestion(id);
      if (res.ok) {
        toast.success('Question refreshed', { id: toastId });
        setQuestions((prev) =>
          prev.map((item) => (item.id === id ? res.data : item))
        );
      } else {
        toast.error(res.error, { id: toastId });
      }
    } catch {
      toast.error('Failed to regenerate question', { id: toastId });
    } finally {
      setRegeneratingId(null);
    }
  };

  const toggleGuide = (id: string) => {
    setExpandedGuides((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return (
          <Badge
            variant="outline"
            className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
          >
            Beginner
          </Badge>
        );
      case 'intermediate':
        return (
          <Badge
            variant="outline"
            className="text-[10px] font-semibold bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
          >
            Intermediate
          </Badge>
        );
      case 'advanced':
        return (
          <Badge
            variant="outline"
            className="text-[10px] font-semibold bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300"
          >
            Advanced
          </Badge>
        );
      default:
        return null;
    }
  };

  // Group questions by difficulty
  const difficulties: Array<'beginner' | 'intermediate' | 'advanced'> = [
    'beginner',
    'intermediate',
    'advanced',
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              AI-Generated Interview Questions
            </h3>
            <p className="text-xs text-slate-500">
              Role & project probes generated from the candidate&apos;s verified skills and gaps
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-4 inline-flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-sm"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating questions...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>{questions.length > 0 ? 'Regenerate All' : 'Generate questions'}</span>
            </>
          )}
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
          Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-zinc-800">
          <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2 dark:text-zinc-600" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No questions yet
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Click &ldquo;Generate questions&rdquo; to create structured interview questions tailored specifically to this applicant&apos;s projects and identified skill gaps.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
            className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Generate questions
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {difficulties.map((diff) => {
            const group = questions.filter((q) => q.difficulty === diff);
            if (group.length === 0) return null;

            return (
              <div key={diff} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {diff} Level ({group.length})
                  </h4>
                </div>

                <div className="space-y-3">
                  {group.map((q) => {
                    const isEditing = editingId === q.id;
                    const isRegenerating = regeneratingId === q.id;
                    const isExpanded = !!expandedGuides[q.id];

                    return (
                      <div
                        key={q.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-800/40 space-y-3"
                      >
                        {/* Top row: badges and actions */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {getDifficultyBadge(q.difficulty)}
                            {q.category === 'project' && (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 inline-flex items-center gap-1"
                              >
                                <Briefcase className="h-2.5 w-2.5" />
                                Project Question
                              </Badge>
                            )}
                          </div>

                          {/* Row actions */}
                          <div className="flex items-center gap-1">
                            {!isEditing ? (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRegenerate(q.id)}
                                  disabled={isRegenerating || generating}
                                  title="Regenerate this question"
                                  className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-600"
                                >
                                  {isRegenerating ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <RotateCw className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStartEdit(q)}
                                  disabled={isRegenerating}
                                  title="Edit question"
                                  className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingId(q.id)}
                                  disabled={isRegenerating}
                                  title="Delete question"
                                  className="h-7 w-7 p-0 text-slate-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSaveEdit(q)}
                                  disabled={savingEdit}
                                  className="h-7 px-2 text-[11px] text-emerald-600 hover:bg-emerald-50 inline-flex items-center gap-1"
                                >
                                  {savingEdit ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                  <span>Save</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingId(null)}
                                  disabled={savingEdit}
                                  className="h-7 px-2 text-[11px] text-slate-400 hover:text-slate-700"
                                >
                                  <X className="h-3.5 w-3.5 mr-0.5" />
                                  <span>Cancel</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Question Content / Edit textarea */}
                        {isEditing ? (
                          <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                              Question:
                            </label>
                            <Textarea
                              value={editQuestion}
                              onChange={(e) => setEditQuestion(e.target.value)}
                              rows={2}
                              className="text-xs bg-white dark:bg-zinc-900"
                            />
                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block pt-1">
                              Answer Guide (Evaluation Criteria):
                            </label>
                            <Textarea
                              value={editGuide}
                              onChange={(e) => setEditGuide(e.target.value)}
                              rows={3}
                              className="text-xs bg-white dark:bg-zinc-900"
                            />
                          </div>
                        ) : (
                          <p className="font-medium text-slate-900 dark:text-white leading-relaxed">
                            {q.question}
                          </p>
                        )}

                        {/* Collapsible Answer Guide */}
                        {!isEditing && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => toggleGuide(q.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 transition-colors"
                            >
                              <span>{isExpanded ? 'Hide' : 'View'} Answer Guide</span>
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 rounded-lg bg-white p-3 text-xs text-slate-600 border border-slate-200/80 shadow-xs dark:bg-zinc-900 dark:text-slate-300 dark:border-zinc-700/60 leading-relaxed">
                                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1 text-[11px] uppercase tracking-wider">
                                  Expected Response & Signals:
                                </span>
                                {q.answer_guide}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove this interview question from the evaluation set?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeletingId(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="text-xs"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
