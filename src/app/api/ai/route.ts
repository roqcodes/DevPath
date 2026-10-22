import { buildChatMessages } from "@/lib/companion/persona";
import { demoStreamText, streamDemoText } from "@/lib/ai/demo";
import { parseStreamRequest } from "@/lib/ai/parse-stream-request";
import { resolveAiCaller } from "@/lib/ai/route-auth";
import { getAiProviderConfig, streamChatCompletion } from "@/lib/ai/provider";
import type { AiSource } from "@/lib/companion/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const caller = await resolveAiCaller();
  if (!caller) {
    return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const parsed = parseStreamRequest(body);
  if (!parsed.ok) {
    return new Response(JSON.stringify({ error: parsed.error }), { status: 400 });
  }

  const { mode, context, messages, personality, memory } = parsed.data;
  const chatMessages = buildChatMessages({ mode, context, personality, memory, messages });

  const config = getAiProviderConfig();
  let source: AiSource = config ? "live" : "demo";

  const headers = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-AI-Source": source,
  });

  if (config) {
    try {
      const upstream = await streamChatCompletion({
        messages: chatMessages,
        temperature: mode === "quiz" || mode === "socratic" ? 0.55 : 0.65,
        maxTokens: mode === "briefing" ? 400 : 900,
      });
      return new Response(upstream, { headers });
    } catch (err) {
      console.error("[AI] live stream failed, falling back to demo:", err);
      source = "demo";
      headers.set("X-AI-Source", source);
    }
  }

  const lastUser = messages?.filter((m) => m.role === "user").pop()?.content;
  const text = demoStreamText(mode, context, lastUser);
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of streamDemoText(text)) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });

  return new Response(stream, { headers });
}
