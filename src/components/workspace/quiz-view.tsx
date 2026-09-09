"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/shared/logo";
import { getMockQuiz, getMockModule } from "@/lib/mock/modules";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

interface QuizViewProps {
  moduleSlug: string;
}

export function QuizView({ moduleSlug }: QuizViewProps) {
  const router = useRouter();
  const { setQuizScore, completeCheckpoint } = useApp();
  const module = getMockModule(moduleSlug);
  const questions = getMockQuiz(moduleSlug.endsWith("quiz") ? moduleSlug : `${moduleSlug}-quiz`);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  const score = submitted
    ? questions.reduce((s, qu) => s + (answers[qu.id] === qu.correctIndex ? 1 : 0), 0)
    : 0;
  const passed = score >= 3;

  const handleSubmit = () => {
    setSubmitted(true);
    setQuizScore(moduleSlug, score);
  };

  const handleContinue = () => {
    if (module) completeCheckpoint(module.id);
    router.push("/journey");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="flex h-12 items-center border-b border-border px-4">
          <Logo href="/dashboard" size="sm" />
        </header>
        <div className="mx-auto max-w-2xl px-4 py-12 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold">Checkpoint Quiz Results</h1>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              Score: {score} / {questions.length}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {questions.map((qu, i) => {
              const correct = answers[qu.id] === qu.correctIndex;
              return (
                <div key={qu.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start gap-2">
                    {correct ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Q{i + 1}. {qu.question}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{qu.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {passed ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle2 className="h-6 w-6" />
                <span className="text-lg font-semibold">Checkpoint passed</span>
              </div>
              <Button size="lg" onClick={handleContinue}>Continue</Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Let&apos;s reinforce this concept.</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => { setSubmitted(false); setCurrent(0); setAnswers({}); }}>
                  Review Concept
                </Button>
                <Button onClick={handleContinue}>Continue anyway</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-12 items-center justify-between border-b border-border px-4">
        <Logo href="/dashboard" size="sm" />
        <span className="text-sm text-muted-foreground">Checkpoint Quiz</span>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Question {current + 1} of {questions.length}</span>
          </div>
          <Progress value={progress} />
        </div>

        <h2 className="text-xl font-semibold mb-6">{q.question}</h2>

        <div className="space-y-3 mb-8">
          {q.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAnswers({ ...answers, [q.id]: i })}
              className={cn(
                "w-full rounded-lg border p-4 text-left text-sm transition-colors",
                answers[q.id] === i
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50 hover:bg-muted/30"
              )}
            >
              <span className="font-mono text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          {current < questions.length - 1 ? (
            <Button
              disabled={answers[q.id] === undefined}
              onClick={() => setCurrent((c) => c + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              disabled={Object.keys(answers).length < questions.length}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
