'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  Eye,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { setApplicationStatus } from '@/app/actions/recruiter';
import type { ApplicationStatus } from '@/types/recruiter';

const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ['parsed', 'assessed'],
  parsed: ['assessed'],
  assessed: ['review', 'shortlisted', 'rejected', 'assessed'],
  review: ['shortlisted', 'rejected', 'interview'],
  shortlisted: ['interview', 'rejected', 'review'],
  interview: ['selected', 'rejected', 'shortlisted'],
  rejected: ['review', 'shortlisted'],
  selected: ['review', 'interview'],
};

interface TransitionMeta {
  label: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
  icon: typeof CheckCircle;
  colorClass: string;
  description: string;
}

const TRANSITION_DETAILS: Record<ApplicationStatus, TransitionMeta> = {
  submitted: {
    label: 'Mark Submitted',
    variant: 'secondary',
    icon: RotateCcw,
    colorClass: 'text-slate-600',
    description: 'Reset application back to submitted status.',
  },
  parsed: {
    label: 'Mark Parsed',
    variant: 'secondary',
    icon: RotateCcw,
    colorClass: 'text-slate-600',
    description: 'Mark resume text extraction as parsed.',
  },
  assessed: {
    label: 'Re-assess',
    variant: 'outline',
    icon: RotateCcw,
    colorClass: 'text-amber-600 border-amber-300 hover:bg-amber-50',
    description: 'Keep or refresh assessment results.',
  },
  review: {
    label: 'Start Review',
    variant: 'default',
    icon: Eye,
    colorClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    description: 'Move application to active review stage.',
  },
  shortlisted: {
    label: 'Shortlist Candidate',
    variant: 'default',
    icon: CheckCircle,
    colorClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    description: 'Shortlist candidate for further evaluation. Triggers candidate notification.',
  },
  interview: {
    label: 'Move to Interview',
    variant: 'default',
    icon: Calendar,
    colorClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    description: 'Invite candidate for technical or cultural interview.',
  },
  selected: {
    label: 'Select for Offer',
    variant: 'default',
    icon: Award,
    colorClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    description: 'Make final hiring decision and select candidate for offer.',
  },
  rejected: {
    label: 'Reject',
    variant: 'destructive',
    icon: XCircle,
    colorClass: 'bg-red-600 hover:bg-red-700 text-white',
    description: 'Decline candidate application with optional audit note.',
  },
};

interface PipelineActionBarProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  candidateName: string;
}

export function PipelineActionBar({
  applicationId,
  currentStatus,
  candidateName,
}: PipelineActionBarProps) {
  const router = useRouter();
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transitions allowed from current status (excluding transitioning to the exact same status unless reassess)
  const transitions = (ALLOWED_TRANSITIONS[currentStatus] || []).filter(
    (s) => s !== currentStatus || s === 'assessed'
  );

  const handleOpenDialog = (status: ApplicationStatus) => {
    setTargetStatus(status);
    setNote('');
  };

  const handleConfirmTransition = async () => {
    if (!targetStatus) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Updating pipeline status...');

    try {
      const res = await setApplicationStatus(
        applicationId,
        targetStatus,
        note.trim() ? note.trim() : undefined
      );

      if (res.ok) {
        toast.success(res.data.notification || 'Status updated. Candidate notified.', {
          id: toastId,
        });
        setTargetStatus(null);
        setNote('');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update status', { id: toastId });
      }
    } catch {
      toast.error('An unexpected error occurred', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-40 mt-8 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/95">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pipeline Stage:
            </span>
            <Badge
              variant="outline"
              className="text-xs font-bold capitalize px-3 py-1 bg-slate-50 dark:bg-zinc-800"
            >
              {currentStatus}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {transitions.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                No further actions available at this stage
              </span>
            ) : (
              transitions.map((status) => {
                const meta = TRANSITION_DETAILS[status] || {
                  label: status,
                  variant: 'outline',
                  icon: CheckCircle,
                  colorClass: '',
                  description: '',
                };
                const Icon = meta.icon;

                return (
                  <Button
                    key={status}
                    size="sm"
                    variant={meta.variant}
                    onClick={() => handleOpenDialog(status)}
                    className={`h-9 px-3.5 text-xs font-medium inline-flex items-center gap-1.5 ${meta.colorClass}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{meta.label}</span>
                  </Button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Confirm Status Dialog */}
      <Dialog
        open={targetStatus !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTargetStatus(null);
            setNote('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {targetStatus && TRANSITION_DETAILS[targetStatus]?.label}
            </DialogTitle>
            <DialogDescription>
              {targetStatus && TRANSITION_DETAILS[targetStatus]?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="text-xs text-slate-500">
              Moving <strong className="text-slate-800 dark:text-slate-200">{candidateName}</strong> to{' '}
              <Badge variant="outline" className="capitalize text-[11px] ml-1">
                {targetStatus}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Audit Note (Optional)
              </label>
              <Textarea
                placeholder="Add reasoning, feedback or internal instructions for the audit trail..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setTargetStatus(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={handleConfirmTransition}
              className={`text-xs inline-flex items-center gap-1.5 ${
                targetStatus && TRANSITION_DETAILS[targetStatus]?.colorClass
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Confirm Status</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
