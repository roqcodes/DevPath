"use client";

import type { ClientTestFeedback } from "@/lib/judge/public-result";
import type { NormalizedVerdict } from "@/lib/questions/types";
import { cn } from "@/lib/utils";

export interface JudgeResultView {
  phase: "idle" | "running" | "done" | "error";
  mode?: "run" | "submit";
  verdict?: NormalizedVerdict;
  accepted?: boolean;
  passedTests?: number;
  totalTests?: number;
  runtimeMs?: number;
  memoryKb?: number;
  message?: string;
  debugHint?: string;
  tests?: ClientTestFeedback[];
  errorMessage?: string;
}

const VERDICT_LABEL: Record<NormalizedVerdict, string> = {
  accepted: "Accepted",
  wrong_answer: "Wrong answer",
  compilation_error: "Compilation error",
  runtime_error: "Runtime error",
  time_limit_exceeded: "Time limit exceeded",
  memory_limit_exceeded: "Memory limit exceeded",
  internal_error: "Error",
  judge_unavailable: "Judge unavailable",
};

function statusTone(verdict?: NormalizedVerdict, accepted?: boolean): string {
  if (!verdict) return "text-muted-foreground";
  if (verdict === "judge_unavailable" || verdict === "internal_error") return "text-amber-600 dark:text-amber-400";
  if (accepted) return "text-emerald-600 dark:text-emerald-400";
  if (verdict === "accepted") return "text-sky-600 dark:text-sky-400";
  return "text-destructive";
}

export function JudgeResultPanel({
  result,
  dark = false,
  className,
}: {
  result: JudgeResultView;
  dark?: boolean;
  className?: string;
}) {
  if (result.phase === "idle") {
    return (
      <p className={cn("text-xs", dark ? "text-[#888]" : "text-muted-foreground", className)}>
        Output will appear here after Run or Submit.
      </p>
    );
  }

  if (result.phase === "running") {
    return (
      <p className={cn("text-xs animate-pulse", dark ? "text-[#aaa]" : "text-muted-foreground", className)}>
        Running on the judge…
      </p>
    );
  }

  if (result.phase === "error") {
    return (
      <div className={cn("space-y-2 text-xs", className)}>
        <p className="text-amber-600 dark:text-amber-400 font-medium">Request failed</p>
        <p className={dark ? "text-[#ccc]" : "text-muted-foreground"}>
          {result.errorMessage ?? "Network or server error. Your code is still in the editor."}
        </p>
      </div>
    );
  }

  const verdict = result.verdict ?? "internal_error";
  const label = VERDICT_LABEL[verdict] ?? verdict;
  const failing = result.tests?.find((t) => !t.passed && !t.hidden);

  return (
    <div className={cn("space-y-2 text-xs", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("font-semibold", statusTone(verdict, result.accepted))}>
          {result.mode === "run" ? "Run" : "Submit"}: {label}
          {result.accepted ? " (counts toward progress)" : ""}
        </span>
        {result.totalTests != null && result.totalTests > 0 && (
          <span className={dark ? "text-[#888]" : "text-muted-foreground"}>
            {result.passedTests ?? 0}/{result.totalTests} tests
          </span>
        )}
        {result.runtimeMs != null && (
          <span className={dark ? "text-[#888]" : "text-muted-foreground"}>{result.runtimeMs} ms</span>
        )}
        {result.memoryKb != null && (
          <span className={dark ? "text-[#888]" : "text-muted-foreground"}>{result.memoryKb} KB</span>
        )}
      </div>

      {result.message && (
        <p className={cn(dark ? "text-[#ccc]" : "text-muted-foreground", "whitespace-pre-wrap")}>{result.message}</p>
      )}

      {failing?.hidden && (
        <p className={dark ? "text-[#aaa]" : "text-muted-foreground"}>
          A hidden test failed. Public samples are not shown for that case.
        </p>
      )}

      {failing && !failing.hidden && (
        <div
          className={cn(
            "rounded-md border p-2 space-y-1 font-mono overflow-x-auto",
            dark ? "border-[#444] bg-[#252526]" : "border-border bg-muted/40"
          )}
        >
          <p className="font-sans font-medium text-[11px]">Failing sample ({failing.testId})</p>
          {failing.input != null && (
            <div>
              <span className="font-sans text-[10px] uppercase opacity-70">Input</span>
              <pre className="whitespace-pre-wrap">{failing.input}</pre>
            </div>
          )}
          {failing.expectedOutput != null && (
            <div>
              <span className="font-sans text-[10px] uppercase opacity-70">Expected</span>
              <pre className="whitespace-pre-wrap">{failing.expectedOutput}</pre>
            </div>
          )}
          {failing.actualOutput != null && (
            <div>
              <span className="font-sans text-[10px] uppercase opacity-70">Your output</span>
              <pre className="whitespace-pre-wrap">{failing.actualOutput || "(empty)"}</pre>
            </div>
          )}
          {failing.compileOutput && (
            <div>
              <span className="font-sans text-[10px] uppercase opacity-70">Compiler</span>
              <pre className="whitespace-pre-wrap text-amber-200/90">{failing.compileOutput}</pre>
            </div>
          )}
          {failing.stderr && (
            <div>
              <span className="font-sans text-[10px] uppercase opacity-70">Stderr</span>
              <pre className="whitespace-pre-wrap">{failing.stderr}</pre>
            </div>
          )}
        </div>
      )}

      {result.debugHint && (
        <p className={cn("border-t pt-2", dark ? "border-[#333] text-[#aaa]" : "border-border text-muted-foreground")}>
          <span className="font-medium">Next step:</span> {result.debugHint}
        </p>
      )}
    </div>
  );
}
