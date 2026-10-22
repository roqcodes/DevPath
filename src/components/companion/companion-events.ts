"use client";

import type { CompanionContext } from "@/lib/companion/types";

export const ASK_COMPANION_EVENT = "devpath:ask-companion";

export interface AskCompanionDetail {
  prompt: string;
  context?: CompanionContext;
}

export function dispatchAskCompanion(prompt: string, context?: CompanionContext): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AskCompanionDetail>(ASK_COMPANION_EVENT, { detail: { prompt, context } }));
}
