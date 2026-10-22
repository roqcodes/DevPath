"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrderItem } from "./practice-types";

export function OrderSteps({
  item,
  onAnswer,
  disabled,
}: {
  item: OrderItem;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}) {
  const [order, setOrder] = useState(() => item.steps.map((_, i) => i));
  const [checked, setChecked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);

  const move = (idx: number, dir: -1 | 1) => {
    if (disabled || checked) return;
    const next = idx + dir;
    if (next < 0 || next >= order.length) return;
    const copy = [...order];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    setOrder(copy);
  };

  const check = () => {
    if (disabled || checked) return;
    const ok = order.every((v, i) => v === item.correctOrder[i]);
    setWasCorrect(ok);
    setChecked(true);
    onAnswer(ok);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-900">{item.prompt}</p>
      <ol className="space-y-2" aria-label="Reorder steps">
        {order.map((stepIdx, pos) => (
          <li
            key={stepIdx}
            className={cn(
              "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm",
              checked && wasCorrect && "border-emerald-300 bg-emerald-50/50",
              checked && !wasCorrect && "border-amber-200"
            )}
          >
            <span className="font-mono text-xs text-slate-400 w-5">{pos + 1}.</span>
            <span className="flex-1">{item.steps[stepIdx]}</span>
            <div className="flex shrink-0 gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                aria-label={`Move step ${pos + 1} up`}
                disabled={disabled || checked || pos === 0}
                onClick={() => move(pos, -1)}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                aria-label={`Move step ${pos + 1} down`}
                disabled={disabled || checked || pos === order.length - 1}
                onClick={() => move(pos, 1)}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ol>
      {!checked ? (
        <Button type="button" size="sm" onClick={check} disabled={disabled}>
          Check order
        </Button>
      ) : (
        <p className={cn("text-xs", wasCorrect ? "text-emerald-700" : "text-amber-800")}>{item.explanation}</p>
      )}
    </div>
  );
}
