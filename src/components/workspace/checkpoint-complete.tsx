"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { JourneyProgressHeader } from "@/components/shared/journey-progress-header";
import { getMockModule } from "@/lib/mock/modules";
import { useApp } from "@/lib/context/app-context";

interface CheckpointCompleteProps {
  moduleSlug: string;
}

export function CheckpointComplete({ moduleSlug }: CheckpointCompleteProps) {
  const { state } = useApp();
  const module = getMockModule(moduleSlug);
  const hintsUsed = state.progress.hintsUsed[module?.id ?? ""] ?? 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <JourneyProgressHeader />
      <header className="flex h-11 items-center border-b border-border px-4">
        <Logo href="/dashboard" size="sm" />
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-1.5">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-xs font-bold uppercase tracking-widest text-success">
              Checkpoint Complete
            </span>
          </div>

          <h1 className="text-xl font-semibold mb-1">
            Branching fundamentals demonstrated
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {module?.challenge?.successMessage}
          </p>

          <Card className="mb-6 border-success/20 hover-lift">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center justify-center gap-2 text-warning">
                <Zap className="h-5 w-5" />
                <span className="text-2xl font-bold tabular-nums">+120 XP</span>
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Skills improved
                </p>
                <div className="flex justify-between">
                  <span>Git Branching</span>
                  <span className="font-medium text-success">+8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Git Workflow</span>
                  <span className="font-medium text-success">+5%</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Hints used</span>
                  <span>{hintsUsed}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-border bg-muted/30 p-4 mb-6 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Next</p>
            <p className="font-medium">Remote Collaboration</p>
            <p className="text-xs text-muted-foreground mt-0.5">Push, pull, and resolve conflicts</p>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link href="/journey">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
