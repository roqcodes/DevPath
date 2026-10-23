"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Sparkles, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: "default" | "success" | "warning" | "xp";
  durationMs?: number;
}

export interface ToastRecord extends ToastInput {
  id: string;
  createdAt: number;
  exiting?: boolean;
}

type ToastListener = (toasts: ToastRecord[]) => void;

let memoryToasts: ToastRecord[] = [];
const listeners = new Set<ToastListener>();

function emit(next: ToastRecord[]) {
  memoryToasts = next;
  listeners.forEach((listener) => listener(memoryToasts));
}

function genId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function toast(input: ToastInput): string {
  const id = genId();
  const record: ToastRecord = {
    id,
    createdAt: Date.now(),
    tone: input.tone ?? "default",
    durationMs: input.durationMs ?? 4200,
    title: input.title,
    description: input.description,
  };
  emit([...memoryToasts, record]);
  return id;
}

export function dismissToast(id: string) {
  const target = memoryToasts.find((t) => t.id === id);
  if (!target || target.exiting) return;
  emit(memoryToasts.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
  window.setTimeout(() => {
    emit(memoryToasts.filter((t) => t.id !== id));
  }, 220);
}

const toneStyles = {
  default: "border-slate-200/90 bg-white text-slate-900",
  success: "border-emerald-200/80 bg-emerald-50/95 text-emerald-950",
  warning: "border-amber-200/80 bg-amber-50/95 text-amber-950",
  xp: "border-lime-200/80 bg-xp-soft/95 text-xp-strong",
};

const toneIcons = {
  default: null,
  success: CheckCircle2,
  warning: TriangleAlert,
  xp: Sparkles,
};

function ToastItem({ item }: { item: ToastRecord }) {
  const Icon = item.tone ? toneIcons[item.tone] : null;

  useEffect(() => {
    if (item.exiting) return;
    const ms = item.durationMs ?? 4200;
    const timer = window.setTimeout(() => dismissToast(item.id), ms);
    return () => window.clearTimeout(timer);
  }, [item.id, item.durationMs, item.exiting]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm gap-3 rounded-2xl border p-4 shadow-md",
        item.exiting ? "ds-toast-exit" : "ds-toast-enter",
        toneStyles[item.tone ?? "default"]
      )}
    >
      {Icon ? (
        <Icon className="mt-0.5 h-5 w-5 shrink-0 opacity-90" aria-hidden />
      ) : (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug tracking-tight">{item.title}</p>
        {item.description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{item.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => dismissToast(item.id)}
        className="focus-ring -mr-1 shrink-0 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const [items, setItems] = useState<ToastRecord[]>(memoryToasts);

  const sync = useCallback((next: ToastRecord[]) => setItems([...next]), []);

  useEffect(() => {
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, [sync]);

  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      aria-label="Notifications"
    >
      {items.map((item) => (
        <ToastItem key={item.id} item={item} />
      ))}
    </div>
  );
}
