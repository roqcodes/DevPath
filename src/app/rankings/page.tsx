"use client";

import { useCallback, useEffect, useState } from "react";
import { Award, Sparkles, Trophy, Users } from "lucide-react";
import { RankBadge } from "@/components/shared/rank-badge";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader, PageScroll } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RANKING_RULES } from "@/lib/services/ranking-service";
import { cn } from "@/lib/utils";
import type { LeaderboardRow } from "@/lib/types/rankings";

type Scope = "batch" | "department" | "cohort" | "college";
type Period = "weekly" | "monthly" | "all-time";
type Category = "practice_points" | "unique_solved" | "consistency";

const CATEGORY_LABELS: Record<Category, string> = {
  practice_points: "Practice Points",
  unique_solved: "Problems Solved",
  consistency: "Current Streak",
};

export default function RankingsPage() {
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope>("batch");
  const [period, setPeriod] = useState<Period>("weekly");
  const [category, setCategory] = useState<Category>("practice_points");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [viewerRank, setViewerRank] = useState<number | null>(null);
  const [periodLabel, setPeriodLabel] = useState("");
  const [emptyReason, setEmptyReason] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ scope, period, category });
      const res = await fetch(`/api/rankings?${q}`);
      if (res.status === 401) throw new Error("Sign in to view rankings.");
      if (!res.ok) throw new Error("Failed to load rankings");
      const data = await res.json();
      setRows(data.rows ?? []);
      setViewerRank(data.viewerRank ?? null);
      setPeriodLabel(data.periodLabel ?? "");
      setEmptyReason(data.emptyReason);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [scope, period, category]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setViewerId(d?.user?.id ?? null))
      .catch(() => undefined);
  }, []);

  const scoreHeader = CATEGORY_LABELS[category];

  return (
    <AppLayout wideContent>
      <PageHeader
        eyebrow="CUSAT peer leaderboard"
        icon={Trophy}
        title="Rankings & leaderboard"
        description="Compare practice points, problems solved, and streaks across your batch, department, or college."
      />
      <PageScroll>
        <div className="rounded-2xl border border-indigo-100/80 bg-indigo-50/40 px-4 py-3">
          <p className="copy-body text-xs md:text-sm">{RANKING_RULES.description}</p>
          <p className="mt-2 text-xs font-medium text-indigo-800/90">
            Formula: {RANKING_RULES.scoreFormula}
          </p>
        </div>

        {viewerRank != null && (
          <div className="flex items-center gap-3.5 rounded-2xl border border-purple-200/80 bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-100">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Your current rank</p>
              <p className="text-xl font-bold text-slate-900">
                #{viewerRank}{" "}
                <span className="text-xs font-normal text-slate-400">in this view</span>
              </p>
            </div>
          </div>
        )}

        {/* Filter Controls segmented tabs */}
        <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
          {/* Scope selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Leaderboard Scope
            </span>
            <div className="inline-flex flex-wrap gap-1.5 rounded-xl bg-slate-100/80 p-1">
              {(["batch", "department", "cohort", "college"] as Scope[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                    scope === s
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {s === "college" ? "All CUSAT" : s === "cohort" ? "My Cohort" : `My ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Period & Category selectors */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Period:
              </span>
              <div className="inline-flex gap-1 rounded-lg bg-slate-100/80 p-1">
                {(["weekly", "monthly", "all-time"] as Period[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all",
                      period === p
                        ? "bg-white text-slate-900 shadow-xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Metric:
              </span>
              <div className="inline-flex gap-1 rounded-lg bg-slate-100/80 p-1">
                {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                      category === c
                        ? "bg-white text-indigo-600 shadow-xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {periodLabel && (
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>Period Active: <strong className="text-slate-700">{periodLabel}</strong> (Asia/Kolkata timezone)</span>
            <span>Total on leaderboard: {rows.length}</span>
          </div>
        )}

        {/* Leaderboard Table Card */}
        <Card className="border-slate-200/80 bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-indigo-600" />
                Rankings Table — {scoreHeader}
              </CardTitle>
              <Badge variant="outline" className="text-xs font-mono font-medium">
                Scope: {scope}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-3" />
                <p className="text-sm font-medium text-slate-600">Calculating rank standing…</p>
              </div>
            )}

            {error && (
              <div className="p-6 text-center text-sm font-medium text-rose-600">
                {error}
              </div>
            )}

            {!loading && !error && rows.length === 0 && (
              <div className="p-12 text-center">
                <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">No Eligible Students Found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {emptyReason ??
                    "No eligible students in this scope yet. Complete onboarding and solve practice problems to appear on the board."}
                </p>
              </div>
            )}

            {rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5 w-20">Rank</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Batch</th>
                      <th className="py-3 px-5 text-right font-bold text-slate-700">
                        {scoreHeader}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((r) => {
                      const isYou = viewerId != null && r.userId === viewerId;
                      return (
                        <tr
                          key={r.userId}
                          className={cn(
                            "transition-colors hover:bg-slate-50/80",
                            isYou && "bg-indigo-50/60 font-semibold text-indigo-950"
                          )}
                        >
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <RankBadge rank={r.rank} />
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span>{r.displayName}</span>
                              {isYou && (
                                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                            {r.department}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                            {r.academicYear}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px]">
                              {r.batch}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                            {r.score.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </PageScroll>
    </AppLayout>
  );
}
