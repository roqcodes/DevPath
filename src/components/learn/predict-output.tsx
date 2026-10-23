"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PredictItem } from "./practice-types";

export function PredictOutput({
  item,
  onAnswer,
  disabled,
}: {
  item: PredictItem;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const submit = (id: string) => {
    if (disabled || revealed) return;
    setChosen(id);
    setRevealed(true);
    onAnswer(id === item.correctOptionId);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-900">{item.prompt}</p>
      <pre
        className="rounded-lg bg-[#1e1e1e] text-[#d4d4d4] p-3 text-xs overflow-x-auto font-mono"
        aria-label="Code snippet"
      >
        {item.code}
      </pre>
      <div className="space-y-2" role="group" aria-label="Choose output">
        {item.options.map((o) => {
          const isChosen = chosen === o.id;
          const isCorrect = o.id === item.correctOptionId;
          return (
            <button
              key={o.id}
              type="button"
              disabled={disabled}
              onClick={() => submit(o.id)}
              className={cn(
                "flex w-full rounded-lg border px-3 py-2 text-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                !revealed && "border-slate-200 hover:border-indigo-300",
                revealed && isCorrect && "border-emerald-300 bg-emerald-50",
                revealed && isChosen && !isCorrect && "border-rose-300 bg-rose-50"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {revealed && <p className="text-xs text-slate-600">{item.explanation}</p>}
    </div>
  );
}
