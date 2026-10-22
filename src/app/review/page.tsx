"use client";

import Link from "next/link";
import { ArrowLeft, Brain } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { ReviewSession } from "@/components/learn/review-session";

export default function ReviewPage() {
  return (
    <AppLayout>
      <div className="max-w-lg mx-auto space-y-6 m-page">
        <div>
          <Link
            href="/learn"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Syllabus
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-600" aria-hidden />
            Spaced review
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Recall beats re-reading. Grade honestly — Again schedules sooner, Easy stretches the interval.
          </p>
        </div>
        <ReviewSession />
      </div>
    </AppLayout>
  );
}
