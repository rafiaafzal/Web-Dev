"use client";

import { useState } from "react";
import { Search, Sparkles, Loader2, User, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { talentSearch } from "@/app/actions/search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchResult {
  resumeId: string;
  candidateName: string;
  candidateEmail: string | null;
  fileName?: string;
  similarity: number;
  matchingChunks: { id: string; kind: string; content: string; similarity: number }[];
}

export function TalentSearchWidget() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await talentSearch(query);
      if (res.ok) {
        setResults(res.data);
      } else {
        setError(res.error);
      }
    } catch {
      setError("An unexpected error occurred during search.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              Natural Language Talent Search
            </h3>
            <Badge variant="outline" className="text-[10px] font-medium border-indigo-200 bg-indigo-50/70 text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-300">
              <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
              AI Semantic Vector
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Query across verified candidate resumes using natural semantic descriptions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Python backend developer with PostgreSQL and Docker experience..."
            className="pl-10 h-10 text-sm bg-slate-50/50 border-slate-200 focus:bg-white dark:bg-zinc-950 dark:border-zinc-800"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !query.trim()}
          className="h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs dark:bg-indigo-600 dark:hover:bg-indigo-700"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              Searching...
            </>
          ) : (
            "Search Candidates"
          )}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {results !== null && (
        <div className="mt-5 space-y-3">
          <div className="text-xs font-medium text-slate-500">
            {results.length === 0
              ? "No candidate resumes matched this query."
              : `Found ${results.length} matched candidate profiles:`}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((r) => (
              <div
                key={r.resumeId}
                className="p-4 rounded-lg border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs dark:bg-indigo-950 dark:border-indigo-900 dark:text-indigo-300">
                      {r.candidateName.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        {r.candidateName}
                      </p>
                      {r.candidateEmail && (
                        <p className="text-xs text-slate-500">{r.candidateEmail}</p>
                      )}
                    </div>
                  </div>

                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                    {r.similarity}% Match
                  </span>
                </div>

                {r.matchingChunks && r.matchingChunks.length > 0 && (
                  <div className="mt-2.5 space-y-1.5 border-t border-slate-200/60 pt-2 dark:border-zinc-800">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      Relevant Evidence:
                    </p>
                    {r.matchingChunks.map((chunk, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-zinc-900 p-2 rounded border border-slate-200/60 dark:border-zinc-800 italic"
                      >
                        &ldquo;{chunk.content}&rdquo;
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
