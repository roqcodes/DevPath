"use client";

import Link from "next/link";
import { ArrowLeft, Brain } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageFill } from "@/components/layout/page-shell";
import { ReviewSession } from "@/components/learn/review-session";

export default function ReviewPage() {
  return (
    <AppLayout>
      <PageFill>
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/80 pb-3">
          <Link
            href="/learn"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-1 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Syllabus</span>
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Brain className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                Spaced review
              </h1>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                Recall first, then grade honestly.
              </p>
            </div>
          </div>
        </header>

        <ReviewSession className="min-h-0 flex-1 overflow-hidden" />
      </PageFill>
    </AppLayout>
  );
}
