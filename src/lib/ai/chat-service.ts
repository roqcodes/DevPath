import { completeChat } from "./client";
import { buildLessonTutorSystemPrompt } from "./lesson-tutor-prompt";
import { getLessonContentById } from "@/lib/curriculum";
import type { AIChatMessage } from "./types";

const MAX_USER_MESSAGE = 2000;
const MAX_HISTORY = 8;

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(userId);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export interface LessonChatInput {
  lessonId: string;
  messages: { role: "user" | "assistant"; content: string }[];
}

export async function runLessonTutorChat(
  userId: string,
  input: LessonChatInput
): Promise<{ content?: string; model?: string; error?: string; status: number }> {
  if (!checkRateLimit(userId)) {
    return { error: "Too many AI requests. Please wait a minute and try again.", status: 429 };
  }

  const lesson = getLessonContentById(input.lessonId);
  if (!lesson) {
    return { error: "Unknown lesson.", status: 400 };
  }

  const history = input.messages.slice(-MAX_HISTORY);
  const last = history[history.length - 1];
  if (!last || last.role !== "user") {
    return { error: "Last message must be from the user.", status: 400 };
  }

  const trimmed = last.content.trim();
  if (trimmed.length < 2) {
    return { error: "Message is too short.", status: 400 };
  }
  if (trimmed.length > MAX_USER_MESSAGE) {
    return { error: "Message is too long.", status: 400 };
  }

  const apiMessages: AIChatMessage[] = [
    { role: "system", content: buildLessonTutorSystemPrompt(lesson) },
    ...history.map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_USER_MESSAGE),
    })),
  ];

  const result = await completeChat({ messages: apiMessages, temperature: 0.6, maxTokens: 900 });

  if (result.error) {
    const status = result.error.code === "config_missing" ? 503 : 502;
    return { error: result.error.message, status };
  }

  return {
    content: result.data!.content,
    model: result.data!.model,
    status: 200,
  };
}
