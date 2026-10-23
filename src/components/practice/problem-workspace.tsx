"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Code2,
  HelpCircle,
  History,
  Lightbulb,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function DifficultyBadge({ label }: { label: string }) {
  const lower = label.toLowerCase();
  if (lower.includes("easy") || lower.includes("foundation")) {
    return (
      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
        {label}
      </span>
    );
  }
  if (lower.includes("med") || lower.includes("intermediate")) {
    return (
      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-600/15">
        {label}
      </span>
    );
  }
  return (
    <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-800 ring-1 ring-rose-600/15">
      {label}
    </span>
  );
}

type BottomTab = "results" | "history";

export function ProblemWorkspace({ problem, returnTo }: Props) {
  const { state, toggleBookmark, revealHint, recordSubmission, setLastActiveProblem } = useApp();
  const langs = problem.execution.languages;
  const [language, setLanguage] = useState<SupportedLanguage>(langs[0] ?? "python");
  const starter = useMemo(() => starterForLanguage(language), [language]);
  const [code, setCode] = useState(() => loadProblemDraft(problem.id, language) ?? starter);
  const [panel, setPanel] = useState<"problem" | "editor">("problem");
  const [bottomTab, setBottomTab] = useState<BottomTab>("results");
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
      setBottomTab("results");
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

  useEffect(() => {
    if (result.phase !== "idle") setBottomTab("results");
  }, [result.phase]);

  const hintsShown = state.progress.hintsRevealed[problem.id] ?? 0;
  const solved = state.progress.solvedProblems.includes(problem.id);
  const bookmarked = state.progress.bookmarks.includes(problem.id);
  const canSeeEditorial = solved;
  const isDirty = code !== starter;

  const onRun = () => {
    setBottomTab("results");
    execute({ problemId: problem.id, language, sourceCode: code, mode: "run" });
  };
  const onSubmit = () => {
    setBottomTab("results");
    execute({ problemId: problem.id, language, sourceCode: code, mode: "submit" });
  };

  const resetCode = () => {
    if (!window.confirm("Reset to starter template? Your draft will be replaced.")) return;
    const s = starterForLanguage(language);
    setCode(s);
    saveProblemDraft(problem.id, language, s);
  };

  const backHref = returnTo && returnTo.startsWith("/") ? returnTo : "/practice";
  const backLabel = returnTo?.startsWith("/learn/") ? "Lesson" : "Problem bank";

  const localHistory = state.progress.submissions
    .filter((s) => s.problemId === problem.id)
    .map((s) => ({ id: s.id, verdict: s.verdict, createdAt: s.createdAt, language: s.language }));

  const paneShell = "flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200/80 pb-2">
        <Link
          href={backHref}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
        <div className="hidden h-4 w-px bg-slate-200 sm:block" />
        <h1 className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900 sm:text-base">
          {problem.title}
        </h1>
        <div className="flex flex-wrap items-center gap-1.5">
          <DifficultyBadge label={problem.difficulty.label} />
          {problem.topics.slice(0, 2).map((t) => (
            <span
              key={t}
              className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 sm:inline"
            >
              {t}
            </span>
          ))}
          {solved && (
            <Badge variant="success" dot className="text-[10px]">
              Solved
            </Badge>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-[11px]"
            onClick={() => toggleBookmark(problem.id)}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark problem"}
          >
            <Bookmark className={cn("h-3 w-3", bookmarked && "fill-indigo-600 text-indigo-600")} />
            {bookmarked ? "Saved" : "Save"}
          </Button>
        </div>
      </header>

      <div className="flex shrink-0 rounded-lg border border-slate-200 bg-white p-0.5 md:hidden">
        <button
          type="button"
          className={cn(
            "flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors",
            panel === "problem" ? "bg-indigo-600 text-white" : "text-slate-600"
          )}
          onClick={() => setPanel("problem")}
        >
          Problem
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors",
            panel === "editor" ? "bg-indigo-600 text-white" : "text-slate-600"
          )}
          onClick={() => setPanel("editor")}
        >
          Code
        </button>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 overflow-hidden md:grid-cols-2 md:gap-4">
        <section
          className={cn(paneShell, panel !== "problem" && "hidden md:flex")}
          aria-label="Problem description"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 text-sm md:p-5">
            <div className="whitespace-pre-wrap leading-relaxed text-slate-700">{problem.statement}</div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 space-y-2.5">
              <div>
                <h3 className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Input
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  {problem.io_format.input_description}
                </p>
              </div>
              <div>
                <h3 className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Output
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  {problem.io_format.output_description}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Examples
              </h3>
              <div className="space-y-2">
                {problem.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-slate-800/80 bg-slate-900 p-3 font-mono text-[11px] text-slate-200"
                  >
                    <p className="mb-1 font-sans text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Example {i + 1}
                    </p>
                    <p>
                      <span className="text-slate-500">In: </span>
                      {ex.input}
                    </p>
                    <p>
                      <span className="text-slate-500">Out: </span>
                      <span className="text-emerald-400">{ex.output}</span>
                    </p>
                    {ex.explanation && (
                      <p className="pt-1 font-sans text-[10px] text-slate-400">{ex.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Constraints
              </h3>
              <ul className="list-disc space-y-0.5 pl-4 text-xs text-slate-600">
                {problem.constraints.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            {problem.complexity && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-indigo-50/70 px-3 py-2 text-[11px] text-indigo-950">
                <span className="font-semibold">Target complexity</span>
                <span>
                  Time <code className="font-bold">{problem.complexity.time ?? "—"}</code> · Space{" "}
                  <code className="font-bold">{problem.complexity.space ?? "—"}</code>
                </span>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3">
              <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                Hints ({hintsShown}/{problem.hints.length})
              </h3>
              <div className="space-y-2">
                {problem.hints.slice(0, hintsShown).map((h) => (
                  <div
                    key={h.order}
                    className="rounded-lg border border-amber-200/70 bg-amber-50/60 p-2.5 text-xs leading-relaxed text-amber-950"
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
                  className="mt-2 h-7 text-[11px]"
                  onClick={() => revealHint(problem.id)}
                >
                  <HelpCircle className="mr-1 h-3 w-3" />
                  Reveal hint
                </Button>
              )}
            </div>

            {canSeeEditorial && problem.editorial && (
              <div className="border-t border-slate-100 pt-3">
                <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Editorial
                </h3>
                <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-3 text-xs leading-relaxed whitespace-pre-wrap text-slate-700">
                  {problem.editorial}
                </div>
              </div>
            )}
          </div>
        </section>

        <section
          className={cn(
            "flex min-h-0 flex-col gap-2 overflow-hidden",
            panel !== "editor" && "hidden md:flex"
          )}
          aria-label="Code and submissions"
        >
          <div className={cn(paneShell, "min-h-0 flex-[1.15]")}>
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <Code2 className="h-4 w-4 shrink-0 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">Editor</span>
                {isDirty && (
                  <span className="truncate text-[10px] font-medium text-amber-700">Draft saved</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  className="h-7 max-w-[7rem] rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="h-7 w-7 p-0 text-slate-400"
                  onClick={resetCode}
                  title="Reset starter"
                  aria-label="Reset starter"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <SimpleCodeEditor
              value={code}
              onChange={setCode}
              className="min-h-0 flex-1 rounded-none border-0 border-t border-slate-100"
            />

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 px-3 text-[11px] font-semibold"
                  onClick={onRun}
                  disabled={isBusy}
                >
                  <Play className="h-3 w-3" />
                  {isBusy ? "Running…" : "Run samples"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 gap-1 px-3 text-[11px] font-semibold"
                  onClick={onSubmit}
                  disabled={isBusy}
                >
                  <Send className="h-3 w-3" />
                  {isBusy ? "Submitting…" : "Submit"}
                </Button>
              </div>
              <span className="text-[10px] text-slate-400">
                {problem.public_test_count} sample{problem.public_test_count === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className={cn(paneShell, "min-h-0 flex-1 max-h-[42%] md:max-h-none")}>
            <div className="flex shrink-0 border-b border-slate-100">
              <button
                type="button"
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 py-2 text-[11px] font-semibold transition-colors",
                  bottomTab === "results"
                    ? "border-b-2 border-indigo-600 text-indigo-700"
                    : "text-slate-500 hover:text-slate-800"
                )}
                onClick={() => setBottomTab("results")}
              >
                <Terminal className="h-3.5 w-3.5" />
                Results
              </button>
              <button
                type="button"
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 py-2 text-[11px] font-semibold transition-colors",
                  bottomTab === "history"
                    ? "border-b-2 border-indigo-600 text-indigo-700"
                    : "text-slate-500 hover:text-slate-800"
                )}
                onClick={() => setBottomTab("history")}
              >
                <History className="h-3.5 w-3.5" />
                History
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
              {bottomTab === "results" ? (
                result.phase === "idle" ? (
                  <p className="text-xs text-slate-500">Run samples or submit to see output here.</p>
                ) : (
                  <JudgeResultPanel result={result} />
                )
              ) : (
                <SubmissionHistoryList
                  problemId={problem.id}
                  localFallback={localHistory}
                  onLoadCode={(src) => setCode(src)}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
