"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { CompanionAvatar, type CompanionMood } from "@/components/companion";
import { celebrate } from "@/components/motion";
import { useEngine } from "@/lib/engine";
import { cn } from "@/lib/utils";

export function LandingCta() {
  const onboarded = !!useEngine().onboarding;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Link
        href={onboarded ? "/dashboard" : "/start"}
        className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-bold text-indigo-950 shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60 motion-reduce:transition-none"
      >
        {onboarded ? "Continue" : "Start in 30 seconds"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
      </Link>
      <Link
        href="/login"
        className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60"
      >
        Sign in
      </Link>
      {!onboarded && <span className="text-[11px] text-indigo-300/80 sm:ml-1">No signup needed</span>}
    </div>
  );
}

const CODE = `nums = [3, 1, 4, 1, 5]
seen = set()
for n in nums:
    if n in seen:
        print(n)
        break
    seen.add(n)`;

const OPTIONS = [
  { id: "3", label: "3" },
  { id: "1", label: "1" },
  { id: "5", label: "5" },
  { id: "none", label: "Nothing" },
];

const FEEDBACK: Record<string, { mood: CompanionMood; text: string }> = {
  "1": {
    mood: "proud",
    text: "Exactly. 1 is the first value seen twice. The set makes each \u201chave I seen this?\u201d check O(1), so the whole scan is O(n). That's lesson 1 of Hashing.",
  },
  "3": { mood: "concerned", text: "Close read, wrong moment: 3 is only seen once. The loop prints the first value it meets a second time." },
  "5": { mood: "concerned", text: "5 comes last and appears once. Trace it: 3, 1, 4, then 1 again, which is already in the set." },
  none: { mood: "concerned", text: "There is a duplicate: 1 appears at index 1 and index 3, so the print fires on the second 1." },
};

export function PredictDemo() {
  const [picked, setPicked] = useState<string | null>(null);
  const fb = picked ? FEEDBACK[picked] : null;
  const correct = picked === "1";

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-md sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Try it: predict the output</p>
        <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-indigo-200">python</span>
      </div>
      <pre className="overflow-x-auto rounded-2xl bg-slate-950/70 p-4 font-mono text-[12.5px] leading-relaxed text-indigo-100 ring-1 ring-white/10">
        <code>{CODE}</code>
      </pre>
      <div role="group" aria-label="What does this print?" className="mt-4 grid grid-cols-4 gap-2">
        {OPTIONS.map((o) => {
          const isPicked = picked === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={isPicked}
              onClick={() => {
                setPicked(o.id);
                if (o.id === "1") celebrate({ kind: "small" });
              }}
              className={cn(
                "h-11 rounded-xl border font-mono text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/50",
                isPicked && o.id === "1" && "border-emerald-300 bg-emerald-400/20 text-emerald-100",
                isPicked && o.id !== "1" && "border-rose-300/70 bg-rose-400/15 text-rose-100",
                !isPicked && "border-white/15 bg-white/5 text-white hover:bg-white/10"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex min-h-[76px] items-start gap-3" aria-live="polite">
        <CompanionAvatar mood={fb?.mood ?? "idle"} size={40} className="shrink-0" />
        <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5 text-xs leading-relaxed text-indigo-100">
          {fb ? fb.text : "Read it like the computer would. What gets printed? I'll tell you why either way."}
          {picked && !correct && (
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="mt-2 flex items-center gap-1 rounded font-semibold text-cyan-300 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <RotateCcw className="h-3 w-3" aria-hidden /> Try again
            </button>
          )}
          {correct && (
            <Link href="/start" className="mt-2 flex items-center gap-1 rounded font-semibold text-cyan-300 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
              Get your own path <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
