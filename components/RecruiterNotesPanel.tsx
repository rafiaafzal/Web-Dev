'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lock, MessageSquare, Send, Loader2 } from 'lucide-react';
import { addNote } from '@/app/actions/recruiter';
import type { RecruiterNote } from '@/types/recruiter';

interface RecruiterNotesPanelProps {
  applicationId: string;
  initialNotes: RecruiterNote[];
}

export function RecruiterNotesPanel({
  applicationId,
  initialNotes,
}: RecruiterNotesPanelProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<RecruiterNote[]>(initialNotes);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Adding note...');

    try {
      const res = await addNote(applicationId, content);
      if (res.ok) {
        toast.success('Note added successfully', { id: toastId });
        setNotes([res.data, ...notes]);
        setContent('');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to add note', { id: toastId });
      }
    } catch {
      toast.error('An unexpected error occurred', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
      {/* Header with private badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            Recruiter Notes
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900">
          <Lock className="h-2.5 w-2.5" />
          Private, only recruiters see this
        </span>
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <Textarea
          placeholder="Write a private candidate evaluation note, interview observations, or salary alignment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="text-xs resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !content.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 inline-flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>Save Note</span>
          </Button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-3 pt-2">
        {notes.length === 0 ? (
          <p className="text-center py-4 text-xs text-slate-400 italic">
            No notes added yet. Use the form above to record internal observations.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl bg-slate-50 p-3.5 text-xs border border-slate-100 dark:bg-zinc-800/50 dark:border-zinc-800 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {note.author_name || 'Recruiter'}
                </span>
                <span>
                  {new Date(note.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {note.note}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
