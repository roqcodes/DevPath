"use client";

/** STUB - Owner: Agent D. `toast()` callable anywhere; `<Toaster />` mounted once in the app shell. */

export interface ToastInput {
  title: string;
  description?: string;
  tone?: "default" | "success" | "warning" | "xp";
  durationMs?: number;
}

export function toast(_t: ToastInput): void {}

export function Toaster() {
  return null;
}
