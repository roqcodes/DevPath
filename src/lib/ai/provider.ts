/**
 * OpenAI-compatible chat provider. Prefers OPENROUTER_API_KEY, then AI_API_KEY + optional base URL.
 */

import { DEFAULT_OPENROUTER_MODEL } from "./config";

export type ProviderKind = "openrouter" | "compatible";

export interface AiProviderConfig {
  kind: ProviderKind;
  apiKey: string;
  baseUrl: string;
  model: string;
  referer: string;
  title: string;
}

export function getAiProviderConfig(): AiProviderConfig | null {
  const referer = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const title = "DevPath";

  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  if (openRouterKey) {
    const model = process.env.OPENROUTER_MODEL?.trim() || process.env.AI_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
    return {
      kind: "openrouter",
      apiKey: openRouterKey,
      baseUrl: "https://openrouter.ai/api/v1",
      model,
      referer,
      title,
    };
  }

  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) return null;

  const baseUrl = (process.env.AI_API_BASE_URL?.trim() || "https://openrouter.ai/api/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL?.trim() || process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
  return { kind: "compatible", apiKey, baseUrl, model, referer, title };
}

export function isAiProviderConfigured(): boolean {
  return getAiProviderConfig() !== null;
}

export interface StreamChatOptions {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

/** ReadableStream of UTF-8 text chunks (token deltas). */
export async function streamChatCompletion(opts: StreamChatOptions): Promise<ReadableStream<Uint8Array>> {
  const config = getAiProviderConfig();
  if (!config) {
    throw new Error("config_missing");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };
  if (config.kind === "openrouter") {
    headers["HTTP-Referer"] = config.referer;
    headers["X-Title"] = config.title;
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.65,
      max_tokens: opts.maxTokens ?? 1024,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    const body = await response.text().catch(() => "");
    console.error("[AI] stream error:", response.status, body);
    throw new Error("api_error");
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const upstream = response.body;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload) as {
                choices?: { delta?: { content?: string } }[];
              };
              const piece = json.choices?.[0]?.delta?.content;
              if (piece) controller.enqueue(encoder.encode(piece));
            } catch {
              /* partial SSE line */
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

/** Non-streaming completion for structured JSON generation. */
export async function completeChatOnce(opts: StreamChatOptions): Promise<string> {
  const config = getAiProviderConfig();
  if (!config) throw new Error("config_missing");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };
  if (config.kind === "openrouter") {
    headers["HTTP-Referer"] = config.referer;
    headers["X-Title"] = config.title;
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 1800,
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[AI] completion error:", response.status, body);
    throw new Error("api_error");
  }

  const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) throw new Error("api_error");
  return content;
}
