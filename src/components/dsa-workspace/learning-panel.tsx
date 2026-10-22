"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import type { DsaLessonContent, WorkspaceTabId } from "@/lib/curriculum/types";
import { TopicVisualizer } from "./visualizers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/context/app-context";

const TABS: { id: WorkspaceTabId; label: string }[] = [
  { id: "learn", label: "Learn" },
  { id: "visualize", label: "Visualize" },
  { id: "examples", label: "Examples" },
  { id: "complexity", label: "Complexity" },
  { id: "practice", label: "Practice" },
  { id: "review", label: "Review" },
];

export function LearningPanel({
  lesson,
  moduleSlug,
}: {
  lesson: DsaLessonContent;
  moduleSlug: string;
}) {
  const [tab, setTab] = useState<WorkspaceTabId>("learn");
  const { state, submitLessonQuiz, confirmLessonCheckpoint } = useApp();
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSummary, setQuizSummary] = useState<{
    passed: boolean;
    correct: number;
    total: number;
    min: number;
    breakdown: { ok: boolean; prompt: string; explanation: string }[];
  } | null>(null);

  const completed = state.progress.completedLessons.includes(lesson.id);
  const quiz = lesson.completion.quiz;

  const submitQuiz = () => {
    if (!quiz?.length) return;
    let correct = 0;
    for (const q of quiz) {
      if (quizAnswers[q.id] === q.correctOptionId) correct++;
    }
    const min = lesson.completion.minQuizScore ?? 1;
    const passed = submitLessonQuiz(lesson.id, correct, min);
    const breakdown = quiz.map((q) => {
      const chosen = quizAnswers[q.id];
      const ok = chosen === q.correctOptionId;
      return { ok, prompt: q.prompt, explanation: q.explanation };
    });
    setQuizSummary({ passed, correct, total: quiz.length, min, breakdown });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div
        className="flex gap-1.5 overflow-x-auto border-b border-slate-200/80 bg-slate-50/60 px-3 py-2 shrink-0"
        role="tablist"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              tab === t.id
                ? "bg-white text-indigo-700 shadow-xs font-semibold ring-1 ring-slate-200/60"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed min-h-0">
        {tab === "learn" && (
          <div className="space-y-4">
            <p className="text-base font-medium">{lesson.learn.hook}</p>
            <div>
              <h3 className="font-semibold mb-1">Objectives</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {lesson.learn.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
            <p><span className="font-medium">When useful:</span> {lesson.learn.whenUseful}</p>
            <p><span className="font-medium">Mental model:</span> {lesson.learn.mentalModel}</p>
            {lesson.learn.tradeoffs && (
              <p><span className="font-medium">Trade-offs:</span> {lesson.learn.tradeoffs}</p>
            )}
            <div>
              <h3 className="font-semibold mb-1">Terminology</h3>
              <dl className="space-y-1">
                {lesson.learn.terminology.map((t) => (
                  <div key={t.term}>
                    <dt className="font-medium inline">{t.term}:</dt>
                    <dd className="inline text-muted-foreground ml-1">{t.definition}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Common mistakes</h3>
              <ul className="list-disc pl-5 text-muted-foreground">
                {lesson.learn.commonMistakes.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
            <p className="border-t pt-3 font-medium">{lesson.learn.summary}</p>
          </div>
        )}

        {tab === "visualize" && (
          <div>
            <p className="text-muted-foreground mb-3">Interactive model for this topic. Use step controls to move forward and back.</p>
            <TopicVisualizer kind={lesson.visualizer} />
          </div>
        )}

        {tab === "examples" && (
          <div className="space-y-3">
            <h3 className="font-semibold">{lesson.examples.title}</h3>
            <p><span className="font-medium">Input:</span> {lesson.examples.input}</p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              {lesson.examples.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <p><span className="font-medium">Output:</span> {lesson.examples.output}</p>
            <p>{lesson.examples.why}</p>
            {lesson.examples.analogy && <p className="text-muted-foreground italic">Analogy: {lesson.examples.analogy}</p>}
            {lesson.examples.codeSnippet && (
              <pre className="rounded-md bg-[#1e1e1e] text-[#d4d4d4] p-3 text-xs overflow-x-auto">
                {lesson.examples.codeSnippet.code}
              </pre>
            )}
          </div>
        )}

        {tab === "complexity" && (
          <div className="space-y-3">
            <p><span className="font-medium">Time:</span> {lesson.complexity.time}</p>
            <p><span className="font-medium">Auxiliary space:</span> {lesson.complexity.auxiliarySpace}</p>
            <p>{lesson.complexity.explanation}</p>
            {lesson.complexity.naiveComparison && <p className="text-muted-foreground">{lesson.complexity.naiveComparison}</p>}
            <p className="text-xs border rounded p-2 bg-muted/30">{lesson.complexity.measured}</p>
          </div>
        )}

        {tab === "practice" && (
          <div className="space-y-3">
            <p>{lesson.practice.warmup}</p>
            <p className="text-muted-foreground">{lesson.practice.conceptCheck}</p>
            <p className="text-xs">Difficulty: {lesson.practice.difficultyLabel}</p>
            {lesson.practiceProblemIds.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-accent">Judged practice (full test suite on Submit)</p>
                <div className="flex flex-wrap gap-2">
                  {lesson.practiceProblemIds.map((id) => (
                    <Button key={id} variant="outline" size="sm" asChild>
                      <Link
                        href={`/practice/${id}?returnTo=${encodeURIComponent(`/learn/${moduleSlug}/${lesson.slug}`)}`}
                      >
                        Open {id}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs rounded-md border border-dashed p-2 text-muted-foreground">
                Sandbox / concept exercise — use the playground below for samples. No judged problem is linked yet.
              </p>
            )}
          </div>
        )}

        {tab === "review" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Takeaways</h3>
              <ul className="list-disc pl-5">
                {lesson.review.takeaways.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Misconceptions</h3>
              <ul className="list-disc pl-5 text-muted-foreground">
                {lesson.review.misconceptions.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>

            {lesson.completion.type === "checkpoint" && (
              <div className="border rounded-md p-3 space-y-2">
                <p className="font-medium">Checkpoint</p>
                <p className="text-muted-foreground">{lesson.completion.checkpointPrompt}</p>
                <Button type="button" size="sm" disabled={completed} onClick={() => confirmLessonCheckpoint(lesson.id)}>
                  {completed ? "Checkpoint recorded" : "I completed this checkpoint"}
                </Button>
              </div>
            )}

            {lesson.completion.type === "quiz" && quiz && (
              <div className="border rounded-md p-3 space-y-3">
                <p className="font-medium">Knowledge check</p>
                {quiz.map((q) => (
                  <fieldset key={q.id} className="space-y-1">
                    <legend className="text-sm font-medium">{q.prompt}</legend>
                    {q.options.map((o) => (
                      <label key={o.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={q.id}
                          value={o.id}
                          checked={quizAnswers[q.id] === o.id}
                          onChange={() => setQuizAnswers((a) => ({ ...a, [q.id]: o.id }))}
                        />
                        {o.label}
                      </label>
                    ))}
                  </fieldset>
                ))}
                <Button type="button" size="sm" onClick={submitQuiz} disabled={completed}>
                  Submit answers
                </Button>
                {quizSummary && (
                  <div className="space-y-2 text-sm">
                    <p
                      className={cn(
                        "font-medium",
                        quizSummary.passed ? "text-emerald-700" : "text-amber-800"
                      )}
                    >
                      {quizSummary.passed
                        ? `Passed (${quizSummary.correct}/${quizSummary.total}). Lesson marked complete.`
                        : `Need at least ${quizSummary.min} correct — you scored ${quizSummary.correct}/${quizSummary.total}.`}
                    </p>
                    <ul className="space-y-1.5">
                      {quizSummary.breakdown.map((item) => (
                        <li key={item.prompt} className="flex gap-2 text-muted-foreground">
                          {item.ok ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-rose-500" aria-hidden />
                          )}
                          <span>
                            <span className="font-medium text-foreground">{item.prompt}</span>
                            {" — "}
                            {item.explanation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {lesson.review.nextLessonSlug && (
              <Button variant="ghost" className="px-0 h-auto" asChild>
                <Link
                  href={`/learn/${moduleSlug}/${lesson.review.nextLessonSlug}`}
                  className="inline-flex items-center gap-1"
                >
                  Next lesson
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
