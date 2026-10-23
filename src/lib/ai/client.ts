import { getOpenRouterConfig } from "./config";
import type {
  AICompletionRequest,
  AICompletionResponse,
  AIServiceError,
} from "./types";

export async function completeChat(
  request: AICompletionRequest
): Promise<{ data?: AICompletionResponse; error?: AIServiceError }> {
  const config = getOpenRouterConfig();

  if (!config) {
    return {
      error: {
        code: "config_missing",
        message: "AI is not configured. Set OPENROUTER_API_KEY (and optionally OPENROUTER_MODEL).",
      },
    };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "SAIT DSA",
      },
      body: JSON.stringify({
        model: config.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[AI] OpenRouter error:", response.status, body);
      return {
        error: {
          code: "api_error",
          message: "The AI service returned an error. Try again in a moment.",
        },
      };
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) {
      return {
        error: {
          code: "api_error",
          message: "The AI service returned an empty response.",
        },
      };
    }

    return {
      data: {
        content,
        model: json.model ?? config.model,
        usage: json.usage
          ? {
              promptTokens: json.usage.prompt_tokens ?? 0,
              completionTokens: json.usage.completion_tokens ?? 0,
              totalTokens: json.usage.total_tokens ?? 0,
            }
          : undefined,
      },
    };
  } catch (err) {
    console.error("[AI] Network error:", err);
    return {
      error: {
        code: "network_error",
        message: "Unable to reach the AI service. Check your connection and try again.",
      },
    };
  }
}
