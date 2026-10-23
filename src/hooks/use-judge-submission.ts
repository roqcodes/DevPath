"use client";

import { useCallback, useRef, useState } from "react";
import type { JudgeResultView } from "@/components/practice/judge-result-panel";
import type { SubmissionResult } from "@/lib/services/submission-service";

export function useJudgeSubmission(options?: {
  onAfterSubmit?: (result: SubmissionResult) => void;
}) {
  const [result, setResult] = useState<JudgeResultView>({ phase: "idle" });
  const pendingRef = useRef(false);

  const execute = useCallback(
    async (payload: { problemId: string; language: string; sourceCode: string; mode: "run" | "submit" }) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setResult({ phase: "running", mode: payload.mode });

      try {
        const res = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        let data: SubmissionResult & { error?: string };
        try {
          data = await res.json();
        } catch {
          setResult({
            phase: "error",
            mode: payload.mode,
            errorMessage: "Invalid response from server.",
          });
          return;
        }

        if (res.status === 401) {
          setResult({
            phase: "error",
            mode: payload.mode,
            errorMessage: "Sign in required to use the judge.",
          });
          return;
        }

        if (!res.ok) {
          setResult({
            phase: "error",
            mode: payload.mode,
            errorMessage: data.error ?? `Request failed (${res.status}).`,
          });
          return;
        }

        setResult({
          phase: "done",
          mode: data.mode ?? payload.mode,
          verdict: data.verdict,
          accepted: data.accepted,
          passedTests: data.passedTests,
          totalTests: data.totalTests,
          runtimeMs: data.runtimeMs,
          memoryKb: data.memoryKb,
          message: data.message,
          debugHint: data.debugHint,
          tests: data.tests,
        });

        if (payload.mode === "submit") {
          options?.onAfterSubmit?.(data);
        }
      } catch {
        setResult({
          phase: "error",
          mode: payload.mode,
          errorMessage: "Network error. Check your connection and try again.",
        });
      } finally {
        pendingRef.current = false;
      }
    },
    [options]
  );

  const isBusy = result.phase === "running";

  return { result, execute, isBusy, setResult };
}
