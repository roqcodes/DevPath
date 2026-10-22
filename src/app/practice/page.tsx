"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Code2,
  Filter,
  Search,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProblemListRow } from "@/components/practice/problem-list-row";
import { useApp } from "@/lib/context/app-context";
import type { PublicProblemView } from "@/lib/questions/types";
import { DIFFICULTY_LABELS } from "@/lib/questions/difficulty-config";
type StatusFilter = "all" | "solved" | "attempted" | "unsolved" | "bookmarked";

export default function PracticePage() {
  const { state, toggleBookmark } = useApp();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<"title" | "difficulty">("title");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PublicProblemView[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        sort: sort === "difficulty" ? "difficulty" : "title",
      });
      if (search) params.set("q", search);
      if (topic !== "all") params.set("topic", topic);
      if (difficulty !== "all") params.set("difficulty", difficulty);
      const res = await fetch(`/api/problems?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError("Could not load problems. Try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, topic, difficulty, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => p.topics.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const solved = state.progress.solvedProblems.includes(p.id);
      const attempted = state.progress.attemptedProblems.includes(p.id);
      if (status === "solved" && !solved) return false;
      if (status === "attempted" && !attempted) return false;
      if (status === "unsolved" && (solved || attempted)) return false;
      if (status === "bookmarked" && !state.progress.bookmarks.includes(p.id)) return false;
      return true;
    });
  }, [items, status, state.progress]);

  const pages = Math.max(1, Math.ceil(total / 20));
  const totalSolvedCount = state.progress.solvedProblems.length;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header Banner */}
        <div className="flex flex-col gap-6 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 p-6 lg:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  Peer Problem Bank
                </span>
                <span className="text-xs font-medium text-slate-500">Judge0 Live Judge</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                DSA Problem Practice
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
                Sharpen algorithmic execution with curated interview and coursework problems.
                Test with custom inputs and submit against test suites.
              </p>
            </div>

            {/* Quick stats pill */}
            <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Solved / Bank</p>
                <p className="text-xl font-bold text-slate-900">
                  {totalSolvedCount}{" "}
                  <span className="text-xs font-normal text-slate-400">/ {total}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs md:grid-cols-12">
          {/* Search */}
          <div className="relative md:col-span-4">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white"
              placeholder="Search problems by name or tag..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              aria-label="Search problems"
            />
          </div>

          {/* Difficulty select */}
          <div className="md:col-span-2">
            <select
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              aria-label="Difficulty filter"
            >
              <option value="all">All Difficulties</option>
              {DIFFICULTY_LABELS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Topics select */}
          <div className="md:col-span-2">
            <select
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setPage(1);
              }}
              aria-label="Topic filter"
            >
              <option value="all">All Topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Status select */}
          <div className="md:col-span-2">
            <select
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              aria-label="Status filter"
            >
              <option value="all">All Statuses</option>
              <option value="solved">Solved</option>
              <option value="attempted">Attempted</option>
              <option value="unsolved">Unsolved</option>
              <option value="bookmarked">Bookmarked</option>
            </select>
          </div>

          {/* Sort select */}
          <div className="md:col-span-2">
            <select
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={sort}
              onChange={(e) => setSort(e.target.value as "title" | "difficulty")}
              aria-label="Sort"
            >
              <option value="title">Sort: Title (A-Z)</option>
              <option value="difficulty">Sort: Difficulty</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading problem bank…</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-center text-sm font-medium text-rose-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <Filter className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-base font-semibold text-slate-800">No matching problems</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              We couldn’t find any questions matching your current filters. Try resetting the search
              query or topic filters.
            </p>
          </div>
        )}

        {/* Problem list */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-1.5">
            {filtered.map((p) => (
              <ProblemListRow
                key={p.id}
                problem={p}
                solved={state.progress.solvedProblems.includes(p.id)}
                attempted={state.progress.attemptedProblems.includes(p.id)}
                bookmarked={state.progress.bookmarks.includes(p.id)}
                onToggleBookmark={() => toggleBookmark(p.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {pages > 1 && (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-xs">
            <span className="text-xs text-slate-500">
              Showing page <strong className="text-slate-800">{page}</strong> of{" "}
              <strong className="text-slate-800">{pages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
