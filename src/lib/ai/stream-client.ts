"use client";

import type { AiSource, AiStreamRequest } from "@/lib/companion/types";

export async function consumeAiStream(
  request: AiStreamRequest,
  onDelta: (text: string) => void
): Promise<{ source: AiSource; full: string }> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "AI request failed");
  }

  const source = (res.headers.get("X-AI-Source") === "live" ? "live" : "demo") as AiSource;
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onDelta(chunk);
  }
  return { source, full };
}
