import { createAdminClient } from "@/lib/supabase/admin";
import type { SessionUser } from "@/lib/auth/session";

export type FeedbackCategory = "bug" | "content" | "judge" | "usability" | "other";

const CATEGORIES: FeedbackCategory[] = ["bug", "content", "judge", "usability", "other"];

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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

export interface SubmitFeedbackInput {
  category: string;
  message: string;
  contextPath?: string;
  lessonId?: string;
  problemId?: string;
}

export function validateFeedbackInput(input: SubmitFeedbackInput): string | null {
  if (!CATEGORIES.includes(input.category as FeedbackCategory)) return "Invalid category";
  const msg = input.message?.trim() ?? "";
  if (msg.length < 10) return "Message must be at least 10 characters";
  if (msg.length > 2000) return "Message must be at most 2000 characters";
  if (input.contextPath && input.contextPath.length > 500) return "Context path too long";
  if (input.lessonId && input.lessonId.length > 120) return "Invalid lesson reference";
  if (input.problemId && input.problemId.length > 80) return "Invalid problem reference";
  return null;
}

export async function submitBetaFeedback(
  user: SessionUser,
  input: SubmitFeedbackInput
): Promise<{ ok: true; id: string } | { ok: false; error: string; status: number }> {
  const validation = validateFeedbackInput(input);
  if (validation) return { ok: false, error: validation, status: 400 };

  if (!checkRateLimit(user.id)) {
    return { ok: false, error: "Too many reports. Please wait a minute and try again.", status: 429 };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Feedback storage is not configured.", status: 503 };
  }

  const id = crypto.randomUUID();
  const { error } = await admin.from("beta_feedback").insert({
    id,
    user_id: user.id,
    category: input.category,
    message: input.message.trim(),
    context_path: input.contextPath?.trim() || null,
    lesson_id: input.lessonId?.trim() || null,
    problem_id: input.problemId?.trim() || null,
  });

  if (error) {
    console.error("[feedback] insert failed", error.message);
    return { ok: false, error: "Could not save feedback. Try again later.", status: 500 };
  }

  return { ok: true, id };
}
