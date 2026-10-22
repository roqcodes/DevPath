"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Play, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DsaLessonContent } from "@/lib/curriculum/types";
import { loadDraft, saveDraft } from "@/lib/dsa-workspace/editor-drafts";
import { usePracticeTimer } from "@/hooks/use-practice-timer";
import { useJudgeSubmission } from "@/hooks/use-judge-submission";
import { SimpleCodeEditor } from "@/components/practice/simple-code-editor";
import { JudgeResultPanel } from "@/components/practice/judge-result-panel";
import { starterForLanguage } from "@/lib/practice/default-starter";
import type { SupportedLanguage } from "@/lib/questions/types";
import { cn } from "@/lib/utils";

const LANGS: SupportedLanguage[] = ["python", "java", "cpp"];

export function LessonPlayground({
  lesson,
  moduleSlug,
}: {
  lesson: DsaLessonContent;
  moduleSlug: string;
}) {
  const problemId = lesson.practiceProblemIds[0];
  const [language, setLanguage] = useState<SupportedLanguage>("python");

  const starterCode = useMemo(
    () => starterForLanguage(language, lesson.sandbox?.starterCode[language]),
    [language, lesson.sandbox]
  );

  const [code, setCode] = useState(() => loadDraft(lesson.id, language) ?? starterCode);
  const { result, execute, isBusy } = useJudgeSubmission();

  usePracticeTimer(true, lesson.id, "lesson");

  useEffect(() => {
    const draft = loadDraft(lesson.id, language);
    const next = draft ?? lesson.sandbox?.starterCode[language] ?? starterForLanguage(language);
    setCode(next);
  }, [language, lesson.id, lesson.sandbox]);

  useEffect(() => {
    const t = window.setTimeout(() => saveDraft(lesson.id, language, code), 400);
    return () => window.clearTimeout(t);
  }, [code, language, lesson.id]);

  const isDirty = code !== starterCode;
  const [sandboxNote, setSandboxNote] = useState<string | null>(null);

  const onRun = () => {
    if (!problemId) {
      setSandboxNote(
        lesson.sandbox?.samples?.length
          ? "Sandbox lesson: compare your trace to the samples above. No remote judge runs in this mode."
          : "No public tests or sandbox samples for this lesson."
      );
      return;
    }
    setSandboxNote(null);
    execute({ problemId, language, sourceCode: code, mode: "run" });
  };

  const onSubmit = () => {
    if (!problemId) return;
    setSandboxNote(null);
    execute({ problemId, language, sourceCode: code, mode: "submit" });
  };

  const resetCode = () => {
    if (!window.confirm("Reset editor to starter code? Your draft will be replaced.")) return;
    setCode(starterCode);
    saveDraft(lesson.id, language, starterCode);
  };

  const returnTo = `/learn/${moduleSlug}/${lesson.slug}`;

  return (
    <div className="flex h-full min-h-0 flex-col border-t border-border bg-[#1e1e1e] text-[#d4d4d4]">
      <div className="flex items-center justify-between gap-2 border-b border-[#333] px-3 py-2 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#ccc]">Playground</span>
          <select
            className="rounded border border-[#444] bg-[#2d2d2d] px-2 py-0.5 text-xs"
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            aria-label="Language"
            disabled={isBusy}
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          {isDirty && <span className="text-[10px] text-amber-400/90">Unsaved draft (auto-saved)</span>}
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-7 text-xs"
            onClick={onRun}
            disabled={isBusy}
          >
            <Play className="h-3 w-3" />
            {isBusy ? "…" : "Run"}
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs"
            onClick={onSubmit}
            disabled={isBusy || !problemId}
            title={problemId ? "Full judge + progress" : "No linked judged problem"}
          >
            <Send className="h-3 w-3" />
            Submit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-[#ccc]"
            onClick={resetCode}
            aria-label="Reset to starter code"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <SimpleCodeEditor dark value={code} onChange={setCode} className="flex-1 border-0 rounded-none" />

      <div className="border-t border-[#333] max-h-[45%] min-h-[100px] overflow-y-auto p-3 shrink-0">
        <p className="text-[#888] mb-2 text-[11px]">
          {problemId ? (
            <>
              Judged problem:{" "}
              <Link
                href={`/practice/${problemId}?returnTo=${encodeURIComponent(returnTo)}`}
                className="text-accent underline"
              >
                {problemId}
              </Link>
              . Run = public tests only (no progress). Submit = full suite.
            </>
          ) : (
            <>
              <span className="text-amber-400/90">Sandbox / concept</span> — trace samples in the Practice tab; no
              judged Submit for this lesson.
            </>
          )}
        </p>
        {!problemId && lesson.sandbox?.samples?.length ? (
          <div className={cn("mb-2 text-xs text-[#aaa] space-y-2")}>
            {lesson.sandbox.samples.map((s, i) => (
              <div key={i} className="rounded border border-[#333] p-2 font-mono">
                <p className="font-sans font-medium text-[#ccc]">{s.label ?? `Sample ${i + 1}`}</p>
                <p className="text-[10px] uppercase opacity-70">Input</p>
                <pre className="whitespace-pre-wrap">{s.input}</pre>
                <p className="text-[10px] uppercase opacity-70">Expected</p>
                <pre className="whitespace-pre-wrap">{s.expectedOutput}</pre>
              </div>
            ))}
            <p>Run executes locally against these traces only — not the remote judge.</p>
          </div>
        ) : null}
        {sandboxNote && <p className="text-xs text-[#aaa] mb-2">{sandboxNote}</p>}
        <JudgeResultPanel result={result} dark />
      </div>
    </div>
  );
}
