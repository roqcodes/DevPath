import { NextResponse } from "next/server";
import { buildGeneratePrompt } from "@/lib/companion/persona";
import { demoGenerate } from "@/lib/ai/demo";
import { parseGenerateRequest } from "@/lib/ai/parse-stream-request";
import { resolveAiCaller } from "@/lib/ai/route-auth";
import { completeChatOnce, getAiProviderConfig } from "@/lib/ai/provider";
import type { AiGenerateResponse, AiSource, GenerateKind, GenerateDataMap } from "@/lib/companion/types";

export const runtime = "nodejs";

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no_json");
  return JSON.parse(candidate.slice(start, end + 1));
}

export async function POST(request: Request) {
  const caller = await resolveAiCaller();
  if (!caller) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseGenerateRequest(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { kind, context, input } = parsed.data;
  const config = getAiProviderConfig();
  let source: AiSource = config ? "live" : "demo";
  let data: GenerateDataMap[GenerateKind];

  if (config) {
    try {
      const messages = buildGeneratePrompt(kind, context, input);
      const raw = await completeChatOnce({ messages, temperature: 0.35, maxTokens: 2000 });
      data = extractJsonObject(raw) as GenerateDataMap[GenerateKind];
    } catch (err) {
      console.error("[AI] generate live failed, demo fallback:", err);
      source = "demo";
      data = demoGenerate(kind, context);
    }
  } else {
    data = demoGenerate(kind, context);
  }

  const payload: AiGenerateResponse = { source, data };
  return NextResponse.json(payload);
}
