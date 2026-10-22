"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Code2,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/context/app-context";
import { usePracticeTimer } from "@/hooks/use-practice-timer";
import { useJudgeSubmission } from "@/hooks/use-judge-submission";
import { SimpleCodeEditor } from "@/components/practice/simple-code-editor";
import { JudgeResultPanel } from "@/components/practice/judge-result-panel";
import { SubmissionHistoryList } from "@/components/practice/submission-history-list";
import { loadProblemDraft, saveProblemDraft } from "@/lib/dsa-workspace/editor-drafts";
import { starterForLanguage } from "@/lib/practice/default-starter";
import type { PublicProblemView, SupportedLanguage } from "@/lib/questions/types";
import type { SubmissionRecord } from "@/lib/types/sait";
import { cn } from "@/lib/utils";

interface Props {
  problem: PublicProblemView;
  returnTo?: string;
}

function mapVerdict(v: string): SubmissionRecord["verdict"] {
  if (v === "accepted") return "accepted";
  if (v === "compilation_error") return "compile_error";
  if (v === "time_limit_exceeded") return "time_limit";
  if (v === "runtime_error") return "runtime_error";
  if (v === "judge_unavailable" || v === "internal_error") return "judge_unavailable";
  return "wrong_answer";
}

export function ProblemWorkspace({ problem, returnTo }: Props) {
  const { state, toggleBookmark, revealHint, recordSubmission, setLastActiveProblem } = useApp();
  const langs = problem.execution.languages;
  const [language, setLanguage] = useState<SupportedLanguage>(langs[0] ?? "python");
  const starter = useMemo(() => starterForLanguage(language), [language]);
  const [code, setCode] = useState(() => loadProblemDraft(problem.id, language) ?? starter);
  const [panel, setPanel] = useState<"problem" | "editor">("problem");
  const { result, execute, isBusy } = useJudgeSubmission({
    onAfterSubmit: (data) => {
      const submission: SubmissionRecord = {
        id: data.submissionId || crypto.randomUUID(),
        problemId: problem.id,
        problemRevision: problem.revision,
        language,
        verdict: mapVerdict(String(data.verdict)),
        passedTests: data.passedTests ?? 0,
        totalTests: data.totalTests ?? 0,
        runtimeMs: data.runtimeMs,
        createdAt: new Date().toISOString(),
      };
      recordSubmission(submission, data.accepted === true);
    },
  });

  usePracticeTimer(true, problem.id);
  useEffect(() => {
    setLastActiveProblem(problem.id);
  }, [problem.id, setLastActiveProblem]);

  useEffect(() => {
    const draft = loadProblemDraft(problem.id, language);
    setCode(draft ?? starterForLanguage(language));
  }, [language, problem.id]);

  useEffect(() => {
    const t = window.setTimeout(() => saveProblemDraft(problem.id, language, code), 400);
    return () => window.clearTimeout(t);
  }, [code, language, problem.id]);

  const hintsShown = state.progress.hintsRevealed[problem.id] ?? 0;
  const solved = state.progress.solvedProblems.includes(problem.id);
  const bookmarked = state.progress.bookmarks.includes(problem.id);
  const canSeeEditorial = solved;
  const isDirty = code !== starter;

  const onRun = () =>
    execute({ problemId: problem.id, language, sourceCode: code, mode: "run" });
  const onSubmit = () =>
    execute({ problemId: problem.id, language, sourceCode: code, mode: "submit" });

  const resetCode = () => {
    if (!window.confirm("Reset to starter template? Your draft will be replaced.")) return;
    const s = starterForLanguage(language);
    setCode(s);
    saveProblemDraft(problem.id, language, s);
  };

  const backHref = returnTo && returnTo.startsWith("/") ? returnTo : "/practice";
  const backLabel = returnTo?.startsWith("/learn/") ? "Back to lesson workspace" : "Back to problem bank";

  const localHistory = state.progress.submissions
    .filter((s) => s.problemId === problem.id)
    .map((s) => ({ id: s.id, verdict: s.verdict, createdAt: s.createdAt, language: s.language }));

  const getDifficultyBadge = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes("easy") || lower.includes("foundation")) {
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          {label}
        </span>
      );
    }
    if (lower.includes("med") || lower.includes("intermediate")) {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
          {label}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors mr-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          {getDifficultyBadge(problem.difficulty.label)}
          {problem.topics.map((t) => (
            <span
              key={t}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
            >
              {t}
            </span>
          ))}
          {solved && (
            <Badge variant="success" dot className="text-xs">
              Solved
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            onClick={() => toggleBookmark(problem.id)}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark problem"}
          >
            <Bookmark className={cn("h-3.5 w-3.5", bookmarked && "fill-indigo-600 text-indigo-600")} />
            {bookmarked ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex rounded-xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors",
            panel === "problem" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
          )}
          onClick={() => setPanel("problem")}
        >
          Problem Description
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors",
            panel === "editor" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
          )}
          onClick={() => setPanel("editor")}
        >
          Code & Execution
        </button>
      </div>

      {/* 2-Column Split */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: Problem Details */}
        <Card
          className={cn(
            "border-slate-200/80 bg-white shadow-xs overflow-hidden",
            panel !== "problem" && "hidden lg:block"
          )}
        >
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-xl font-bold text-slate-900">{problem.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6 text-sm">
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-sans">
              {problem.statement}
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                  Input Format
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {problem.io_format.input_description}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                  Output Format
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {problem.io_format.output_description}
                </p>
              </div>
            </div>

            {/* Examples */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                Examples
              </h3>
              <div className="space-y-2.5">
                {problem.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200/80 bg-slate-900 p-3.5 text-xs font-mono text-slate-200 shadow-xs"
                  >
                    <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-indigo-400 mb-1">
                      Example {i + 1}
                    </p>
                    <div className="space-y-1">
                      <p>
                        <span className="text-slate-400">Input: </span>
                        {ex.input}
                      </p>
                      <p>
                        <span className="text-slate-400">Output: </span>
                        <span className="text-emerald-400">{ex.output}</span>
                      </p>
                      {ex.explanation && (
                        <p className="text-[11px] text-slate-400 font-sans pt-1">
                          Explanation: {ex.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                Constraints
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                {problem.constraints.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            {problem.complexity && (
              <div className="rounded-lg bg-indigo-50/60 p-2.5 text-xs text-indigo-900 flex items-center justify-between">
                <span className="font-semibold">Target Complexity</span>
                <span>
                  Time: <code className="font-bold">{problem.complexity.time ?? "—"}</code> · Space:{" "}
                  <code className="font-bold">{problem.complexity.space ?? "—"}</code>
                </span>
              </div>
            )}

            {/* Progressive Hints */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                Problem Hints ({hintsShown}/{problem.hints.length})
              </h3>
              <div className="space-y-2">
                {problem.hints.slice(0, hintsShown).map((h) => (
                  <div
                    key={h.order}
                    className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-xs text-amber-900 leading-relaxed"
                  >
                    <strong>Hint {h.order}:</strong> {h.text}
                  </div>
                ))}
              </div>
              {hintsShown < problem.hints.length && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2.5 text-xs h-8"
                  onClick={() => revealHint(problem.id)}
                >
                  <HelpCircle className="h-3.5 w-3.5 mr-1" />
                  Reveal next hint
                </Button>
              )}
            </div>

            {/* Editorial if Solved */}
            {canSeeEditorial && problem.editorial && (
              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Official Editorial
                </h3>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {problem.editorial}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Code Editor & Execution */}
        <div className={cn("space-y-5", panel !== "editor" && "hidden lg:block")}>
          <Card className="border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 py-2.5 px-4 gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-indigo-600" />
                <CardTitle className="text-sm font-bold text-slate-900">Code Editor</CardTitle>
                {isDirty && (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    Draft auto-saved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  aria-label="Language"
                  disabled={isBusy}
                >
                  {langs.map((l) => (
                    <option key={l} value={l}>
                      {l.toUpperCase()}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
                  onClick={resetCode}
                  title="Reset to starter code"
                  aria-label="Reset starter"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <SimpleCodeEditor value={code} onChange={setCode} className="min-h-[300px]" />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 px-4 font-semibold text-xs border-slate-200 gap-1.5"
                    onClick={onRun}
                    disabled={isBusy}
                  >
                    <Play className="h-3.5 w-3.5 text-slate-600" />
                    {isBusy ? "Running…" : "Run Sample Tests"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 px-5 font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 shadow-xs gap-1.5"
                    onClick={onSubmit}
                    disabled={isBusy}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isBusy ? "Submitting…" : "Submit Solution"}
                  </Button>
                </div>
                <span className="text-[11px] text-slate-400">
                  {problem.public_test_count} sample test{problem.public_test_count === 1 ? "" : "s"}
                </span>
              </div>

              <JudgeResultPanel result={result} />
            </CardContent>
          </Card>

          {/* Authoritative Submission History */}
          <Card className="border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Submission History & Trace Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <SubmissionHistoryList
                problemId={problem.id}
                localFallback={localHistory}
                onLoadCode={(src) => setCode(src)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
