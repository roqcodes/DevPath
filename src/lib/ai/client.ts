import type {
  AICompletionRequest,
  AICompletionResponse,
  AIServiceError,
} from "./types";

function getOpenRouterConfig(): { apiKey: string; model: string } | null {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!apiKey || !model) return null;
  return { apiKey, model };
}

function createMockResponse(request: AICompletionRequest, model: string): AICompletionResponse {
  const lastUserMessage = [...request.messages].reverse().find((m) => m.role === "user");
  const topic = lastUserMessage?.content.slice(0, 80) ?? "DevOps";

  return {
    content: `Based on your background in ${topic}, I recommend starting with Git fundamentals, then progressing through Docker and CI/CD pipelines. Focus on hands-on practice with each checkpoint before moving forward.`,
    model: `mock/${model || "local"}`,
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  };
}

export async function completeChat(
  request: AICompletionRequest
): Promise<{ data?: AICompletionResponse; error?: AIServiceError }> {
  const config = getOpenRouterConfig();

  if (!config) {
    console.info("[AI] OpenRouter not configured — using local mock response");
    return {
      data: createMockResponse(request, process.env.OPENROUTER_MODEL ?? "local"),
    };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "DevPath AI",
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
        data: createMockResponse(request, config.model),
      };
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content ?? "";

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
      data: createMockResponse(request, config.model),
      error: { code: "network_error", message: "AI service unavailable" },
    };
  }
}
