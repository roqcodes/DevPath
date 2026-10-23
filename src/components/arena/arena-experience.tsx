"use client";

import { useCallback, useMemo, useState } from "react";
import { Swords, Shield, Sparkles, ChevronRight, RotateCcw } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CompanionNote } from "@/components/companion";
import { LevelBadge } from "@/components/progression";
import { dispatchEngine } from "@/lib/engine";
import { celebrate } from "@/lib/motion/confetti";
import { cn } from "@/lib/utils";
import { ARENA_BOSSES, MAX_ROUND_SCORE, type ArenaBoss } from "./constants";
import { postAiGenerate } from "./ai-generate";
import type { InterviewGradeData, InterviewRoundData } from "@/lib/companion/types";

type Phase = "intro" | "fight" | "grading" | "result" | "victory";

const ACCENT_RING: Record<ArenaBoss["accent"], string> = {
  indigo: "from-indigo-500/30 to-indigo-900/80 ring-indigo-400/40",
  cyan: "from-cyan-500/30 to-slate-900/80 ring-cyan-400/40",
  amber: "from-amber-500/30 to-orange-950/80 ring-amber-400/40",
};

export function ArenaExperience() {
  const [bossIndex, setBossIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState<InterviewRoundData | null>(null);
  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<InterviewGradeData | null>(null);
  const [source, setSource] = useState<"live" | "demo">("demo");
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  const boss = ARENA_BOSSES[bossIndex];
  const bossProgress = ((bossIndex + (phase === "victory" ? 1 : 0)) / ARENA_BOSSES.length) * 100;

  const kipMood = useMemo(() => {
    if (loading || phase === "grading") return "thinking" as const;
    if (phase === "result" && grade && grade.score >= 7) return "proud" as const;
    if (phase === "victory") return "excited" as const;
    if (phase === "fight") return "focused" as const;
    return "idle" as const;
  }, [loading, phase, grade]);

  const kipLine = useMemo(() => {
    if (phase === "intro") return "Three bosses. Three rounds. No IDE — just you and the rubric.";
    if (loading) return "Pulling a question from the interview graph…";
    if (phase === "fight") return `Round ${bossIndex + 1}: ${boss.name} is listening. Hit every rubric point.`;
    if (phase === "grading") return "Grading against the rubric…";
    if (phase === "result" && grade) return grade.verdict;
    if (phase === "victory") return "Arena cleared. Your mock loop is officially scary-good.";
    return "";
  }, [phase, loading, boss, bossIndex, grade]);

  const startRound = useCallback(async () => {
    setLoading(true);
    setGrade(null);
    setAnswer("");
    try {
      const res = await postAiGenerate<"interview_round">(
        {
          kind: "interview_round",
          context: {
            surface: "arena",
            subject: boss.topic,
            detail: `boss:${boss.id}; mock interview round ${bossIndex + 1}`,
          },
        },
        boss,
      );
      setRound(res.data);
      setSource(res.source);
      setPhase("fight");
    } finally {
      setLoading(false);
    }
  }, [boss, bossIndex]);

  const submitAnswer = useCallback(async () => {
    if (!round || !answer.trim()) return;
    setPhase("grading");
    setLoading(true);
    try {
      const res = await postAiGenerate<"interview_grade">(
        {
          kind: "interview_grade",
          context: { surface: "arena", subject: boss.topic, detail: `boss:${boss.id}` },
          input: {
            question: round.question,
            answer: answer.trim(),
            rubric: round.rubric,
          },
        },
        boss,
      );
      const g = res.data;
      setGrade(g);
      setSource(res.source);
      setScores((prev) => [...prev, g.score]);

      dispatchEngine({
        type: "interview_round",
        roundId: boss.roundId,
        score: g.score,
        maxScore: MAX_ROUND_SCORE,
      });

      if (g.score >= 7) {
        celebrate({ kind: g.score >= 9 ? "big" : "small", origin: { x: 0.5, y: 0.35 } });
      }

      setPhase("result");
    } finally {
      setLoading(false);
    }
  }, [answer, boss, round]);

  const nextBoss = () => {
    if (bossIndex >= ARENA_BOSSES.length - 1) {
      celebrate({ kind: "big", origin: { x: 0.5, y: 0.25 } });
      setPhase("victory");
      return;
    }
    setBossIndex((i) => i + 1);
    setRound(null);
    setGrade(null);
    setAnswer("");
    setPhase("intro");
  };

  const resetArena = () => {
    setBossIndex(0);
    setPhase("intro");
    setRound(null);
    setGrade(null);
    setAnswer("");
    setScores([]);
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl lg:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" aria-hidden />
          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/10 text-indigo-100 ring-1 ring-white/15 hover:bg-white/10">
                  <Swords className="mr-1 h-3 w-3" />
                  Arena
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white/80">
                  Mock interview · 3 rounds
                </Badge>
                {source === "demo" && (
                  <Badge className="bg-amber-500/20 text-amber-100 ring-1 ring-amber-300/30">Local grader</Badge>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight lg:text-3xl">Boss Fight Interview</h1>
              <p className="mt-1 max-w-xl text-sm text-indigo-200/90">
                Face three DSA bosses. Each round dispatches an <code className="text-cyan-300">interview_round</code> event
                into the engine — XP included.
              </p>
            </div>
            <LevelBadge className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15" />
          </div>
          <div className="relative z-10 mt-6">
            <div className="mb-2 flex justify-between text-[11px] font-bold uppercase tracking-wider text-indigo-200/80">
              <span>Campaign progress</span>
              <span>{Math.min(ARENA_BOSSES.length, bossIndex + (phase === "victory" ? 1 : 0))} / {ARENA_BOSSES.length}</span>
            </div>
            <Progress value={bossProgress} className="h-2 bg-white/10" />
          </div>
        </div>

        <CompanionNote
          mood={kipMood}
          className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
          actions={
            phase === "intro" && bossIndex === 0 && scores.length === 0
              ? [{ label: "Enter arena", onClick: () => void startRound() }]
              : undefined
          }
        >
          <p className="text-sm text-slate-700">{kipLine}</p>
        </CompanionNote>

        {phase !== "victory" && (
          <Card className="overflow-hidden border-slate-200/80">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{boss.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{boss.title}</p>
                </div>
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-2",
                    ACCENT_RING[boss.accent],
                  )}
                >
                  <Shield className="h-7 w-7 text-white/90" />
                </div>
              </div>
              <p className="text-sm text-slate-600">{boss.tagline}</p>
              <Badge variant="outline">{boss.topic}</Badge>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {phase === "intro" && (
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => void startRound()} disabled={loading}>
                    {bossIndex === 0 && scores.length === 0 ? "Start round 1" : `Fight ${boss.name}`}
                  </Button>
                </div>
              )}

              {(phase === "fight" || phase === "grading" || phase === "result") && round && (
                <>
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Question</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-800">{round.question}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rubric</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                      {round.rubric.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  {phase !== "result" && (
                    <div>
                      <label className="text-sm font-medium text-slate-700" htmlFor="arena-answer">
                        Your answer
                      </label>
                      <textarea
                        id="arena-answer"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={phase === "grading" || loading}
                        rows={6}
                        placeholder="Talk through approach, complexity, and edge cases…"
                        className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                      />
                      <Button
                        className="mt-3"
                        onClick={() => void submitAnswer()}
                        disabled={phase === "grading" || loading || answer.trim().length < 20}
                      >
                        Submit to grader
                      </Button>
                    </div>
                  )}
                  {phase === "result" && grade && (
                    <div className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-800">Score</span>
                        <span className="text-2xl font-bold tabular-nums text-emerald-700">
                          {grade.score}/{MAX_ROUND_SCORE}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{grade.verdict}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Strengths</p>
                          <ul className="mt-1 list-disc pl-4 text-sm text-slate-600">
                            {grade.strengths.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Improve</p>
                          <ul className="mt-1 list-disc pl-4 text-sm text-slate-600">
                            {grade.improvements.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <Button onClick={nextBoss} className="gap-1">
                        {bossIndex >= ARENA_BOSSES.length - 1 ? "Claim victory" : "Next boss"}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {phase === "victory" && (
          <Card className="border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50">
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <Sparkles className="h-10 w-10 text-indigo-600" />
              <h2 className="text-xl font-bold tracking-tight">Arena cleared</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Three bosses down. Average score:{" "}
                <span className="font-semibold text-slate-800">
                  {scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—"}
                </span>{" "}
                / {MAX_ROUND_SCORE}
              </p>
              <Button variant="outline" onClick={resetArena} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Run it again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
