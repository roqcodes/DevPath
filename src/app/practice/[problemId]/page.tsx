"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { ProblemWorkspace } from "@/components/practice/problem-workspace";
import type { PublicProblemView } from "@/lib/questions/types";

export default function ProblemPage({ params }: { params: Promise<{ problemId: string }> }) {
  const { problemId } = use(params);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? undefined;
  const [problem, setProblem] = useState<PublicProblemView | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/problems/${problemId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => setProblem(data.problem))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [problemId]);

  if (loading) {
    return (
      <AppLayout wideContent>
        <p className="text-muted-foreground">Loading problem…</p>
      </AppLayout>
    );
  }

  if (error || !problem) {
    return (
      <AppLayout wideContent>
        <p>Problem not found.</p>
        <Link href="/practice" className="text-accent underline">Back to practice</Link>
      </AppLayout>
    );
  }

  return (
    <AppLayout wideContent>
      <ProblemWorkspace problem={problem} returnTo={returnTo} />
    </AppLayout>
  );
}
