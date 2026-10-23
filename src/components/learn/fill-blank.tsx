"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FillItem } from "./practice-types";

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

export function FillBlank({
  item,
  onAnswer,
  disabled,
}: {
  item: FillItem;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);

  const check = () => {
    if (disabled || revealed) return;
    const ok = item.acceptedAnswers.some((a) => normalize(a) === normalize(value));
    setRevealed(true);
    onAnswer(ok);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-900">{item.prompt}</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`fill-${item.id}`}>{item.blankLabel}</label>
        <input
          id={`fill-${item.id}`}
          type="text"
          value={value}
          disabled={disabled || revealed}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") check();
          }}
          className={cn(
            "rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono min-w-[8rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            revealed && "border-slate-200 bg-slate-50"
          )}
          placeholder={item.blankLabel}
          autoComplete="off"
        />
        {!revealed && (
          <Button type="button" size="sm" onClick={check} disabled={disabled || !value.trim()}>
            Check
          </Button>
        )}
      </div>
      {revealed && <p className="text-xs text-slate-600">{item.explanation}</p>}
    </div>
  );
}
