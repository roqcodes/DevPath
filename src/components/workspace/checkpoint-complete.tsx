"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
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
      <header className="flex h-12 items-center border-b border-border px-4">
        <Logo href="/dashboard" size="sm" />
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>

          <h1 className="text-2xl font-semibold mb-2">Checkpoint completed</h1>
          <p className="text-muted-foreground mb-8">
            {module?.challenge?.successMessage ?? "Great work on this checkpoint."}
          </p>

          <Card className="mb-8">
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Concept understood
                </span>
                <span className="text-success">Yes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Practical task completed
                </span>
                <span className="text-success">Yes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Lightbulb className="h-4 w-4 text-warning" />
                  Hints used
                </span>
                <span>{hintsUsed}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/journey">
                Next checkpoint
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
