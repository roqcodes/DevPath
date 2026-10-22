"use client";

import Link from "next/link";
import { use } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getModule } from "@/lib/data/dsa-syllabus";
import { useApp } from "@/lib/context/app-context";
import { CheckCircle2, ChevronLeft, Circle } from "lucide-react";

export default function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = use(params);
  const mod = getModule(moduleSlug);
  const { state } = useApp();

  if (!mod) {
    return (
      <AppLayout>
        <p>Module not found.</p>
        <Link href="/learn" className="text-accent underline">Back to syllabus</Link>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Syllabus
        </Link>
        <h1 className="text-2xl font-semibold mt-2">{mod.title}</h1>
        <p className="text-muted-foreground mt-1">{mod.description}</p>
      </div>

      <div className="space-y-3">
        {mod.lessons.map((lesson, index) => {
          const done = state.progress.completedLessons.includes(lesson.id);
          return (
            <Card key={lesson.id}>
              <CardHeader className="py-4">
                <div className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" aria-label="Completed" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" aria-label="Not completed" />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium">
                      <Link href={`/learn/${moduleSlug}/${lesson.slug}`} className="hover:text-accent">
                        Lesson {index + 1}: {lesson.title}
                      </Link>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{lesson.estimatedMinutes} min</p>
                  </div>
                  {lesson.practiceProblemIds.length > 0 && (
                    <Badge variant="outline">{lesson.practiceProblemIds.length} problems</Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
