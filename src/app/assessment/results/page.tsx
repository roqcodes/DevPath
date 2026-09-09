"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/logo";
import { SkillBars } from "@/components/shared/skill-bars";
import { useApp } from "@/lib/context/app-context";
import { getMockAssessmentResult } from "@/lib/mock/assessment";

export default function AssessmentResultsPage() {
  const { state } = useApp();
  const result = state.assessmentResult ?? getMockAssessmentResult();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Logo />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Your DevOps baseline</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-muted-foreground">Overall readiness:</span>
            <Badge variant="default">{result.overallReadiness}</Badge>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <SkillBars skills={result.skills} />
          </CardContent>
        </Card>

        <div className="rounded-lg border border-border bg-muted/20 p-5 mb-8">
          <p className="text-sm font-medium text-accent mb-2">AI Analysis</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
        </div>

        <Button size="lg" asChild>
          <Link href="/preferences">
            Personalize My Journey
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
