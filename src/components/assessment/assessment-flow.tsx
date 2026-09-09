"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/logo";
import { getMockAssessment } from "@/lib/mock/assessment";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";
import { TOPIC_LABELS } from "@/lib/data/devops-topics";
import type { SkillDomain } from "@/lib/types/app";

const DOMAIN_MAP: Record<SkillDomain, string> = {
  git: TOPIC_LABELS.git,
  docker: TOPIC_LABELS.docker,
  ci_cd: TOPIC_LABELS.ci_cd,
  testing: TOPIC_LABELS.testing,
  deployment: TOPIC_LABELS.deployment,
};

export function AssessmentFlow() {
  const router = useRouter();
  const { state, setAssessmentAnswer, submitAssessment } = useApp();
  const questions = getMockAssessment();
  const [current, setCurrent] = useState(0);

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  const handleSubmit = () => {
    submitAssessment();
    router.push("/assessment/results");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo />
          <span className="text-sm text-muted-foreground">DevOps Diagnostic</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {current + 1} of {questions.length}
            </span>
            <div className="flex gap-2">
              <Badge variant="secondary">{DOMAIN_MAP[q.domain]}</Badge>
              <Badge variant="outline">{q.difficulty}</Badge>
            </div>
          </div>
          <Progress value={progress} />
        </div>

        <h2 className="text-xl font-semibold mb-8 leading-relaxed">{q.question}</h2>

        <div className="space-y-3 mb-8">
          {q.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAssessmentAnswer(q.id, i)}
              className={cn(
                "w-full rounded-lg border p-4 text-left text-sm transition-colors",
                state.assessmentAnswers[q.id] === i
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50 hover:bg-muted/30"
              )}
            >
              <span className="font-mono text-muted-foreground mr-3">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          {current < questions.length - 1 ? (
            <Button
              disabled={state.assessmentAnswers[q.id] === undefined}
              onClick={() => setCurrent((c) => c + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              disabled={Object.keys(state.assessmentAnswers).length < questions.length}
              onClick={handleSubmit}
            >
              Submit Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
