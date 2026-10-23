"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface HistoryItem {
  id: string;
  problemId: string;
  language: string;
  verdict: string;
  passedTests: number;
  totalTests: number;
  runtimeMs: number | null;
  memoryKb: number | null;
  createdAt: string;
  sourceCode: string;
}

export function SubmissionHistoryList({
  problemId,
  localFallback = [],
  onLoadCode,
  className,
}: {
  problemId?: string;
  localFallback?: { id: string; verdict: string; createdAt: string; language?: string }[];
  onLoadCode?: (code: string) => void;
  className?: string;
}) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    const qs = problemId ? `?problemId=${encodeURIComponent(problemId)}&limit=15` : "?limit=15";
    fetch(`/api/submissions${qs}`)
      .then((r) => {
        if (r.status === 401) return { submissions: [] };
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setItems(data.submissions ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [problemId]);

  const showLocal = !loading && items.length === 0 && localFallback.length > 0;

  if (loading) {
    return <p className={cn("text-sm text-muted-foreground", className)}>Loading submission history…</p>;
  }

  if (error && items.length === 0 && localFallback.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Could not load history. Sign in to see server-side submissions.
      </p>
    );
  }

  if (items.length === 0 && !showLocal) {
    return <p className={cn("text-sm text-muted-foreground", className)}>No submissions yet.</p>;
  }

  if (showLocal) {
    return (
      <ul className={cn("space-y-2 text-sm", className)}>
        {localFallback.slice(0, 5).map((s) => (
          <li key={s.id} className="flex justify-between border-b border-border py-2 last:border-0">
            <span>{s.verdict}</span>
            <span className="text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</span>
          </li>
        ))}
        <p className="text-xs text-muted-foreground">Showing this device session only. Sign in for full history.</p>
      </ul>
    );
  }

  return (
    <ul className={cn("space-y-1 text-sm", className)}>
      {items.map((s) => (
        <li key={s.id} className="border-b border-border py-2 last:border-0">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="font-medium">{s.verdict}</span>
            <span className="text-muted-foreground text-xs">
              {s.language} · {new Date(s.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {s.passedTests}/{s.totalTests} tests
            {s.runtimeMs != null ? ` · ${s.runtimeMs} ms` : ""}
            {s.memoryKb != null ? ` · ${s.memoryKb} KB` : ""}
          </p>
          {onLoadCode && (
            <button
              type="button"
              className="text-xs text-accent hover:underline mt-1"
              onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
            >
              {expandedId === s.id ? "Hide code" : "View submitted code"}
            </button>
          )}
          {expandedId === s.id && onLoadCode && (
            <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted/50 p-2 text-xs font-mono">
              {s.sourceCode}
            </pre>
          )}
          {expandedId === s.id && onLoadCode && (
            <button
              type="button"
              className="text-xs text-accent hover:underline mt-1 block"
              onClick={() => onLoadCode(s.sourceCode)}
            >
              Load into editor
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
