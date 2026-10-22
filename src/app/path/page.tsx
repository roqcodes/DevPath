"use client";

import Link from "next/link";
import { ArrowLeft, Map } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { PathMap } from "@/components/learn/path-map";
import { Button } from "@/components/ui/button";

export default function PathPage() {
  return (
    <AppLayout>
      <div className="space-y-6 m-page">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Link
              href="/learn"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Syllabus
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Map className="h-6 w-6 text-indigo-600" aria-hidden />
              Your learning path
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-lg">
              Twelve modules, one winding road. Locked nodes open when prerequisites are mastered.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/review">Daily review</Link>
          </Button>
        </div>
        <PathMap />
      </div>
    </AppLayout>
  );
}
