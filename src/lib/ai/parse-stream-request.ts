import { AI_MODES, GENERATE_KINDS, type AiGenerateRequest, type AiStreamRequest } from "@/lib/companion/types";

export function parseStreamRequest(body: unknown): { ok: true; data: AiStreamRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const row = body as Record<string, unknown>;
  const mode = String(row.mode ?? "");
  if (!(AI_MODES as readonly string[]).includes(mode)) return { ok: false, error: "Invalid mode" };

  const ctx = row.context;
  if (!ctx || typeof ctx !== "object") return { ok: false, error: "Invalid context" };
  const c = ctx as Record<string, unknown>;
  const surface = String(c.surface ?? "").trim();
  if (!surface) return { ok: false, error: "context.surface is required" };

  const context = {
    surface,
    subject: c.subject != null ? String(c.subject) : undefined,
    detail: c.detail != null ? String(c.detail) : undefined,
  };

  const personality = row.personality === "concise" || row.personality === "playful" ? row.personality : undefined;

  let messages: AiStreamRequest["messages"];
  if (Array.isArray(row.messages)) {
    messages = [];
    for (const m of row.messages) {
      if (!m || typeof m !== "object") continue;
      const msg = m as { role?: string; content?: string };
      const role = msg.role === "assistant" ? "assistant" : "user";
      messages.push({ role, content: String(msg.content ?? "").slice(0, 8000) });
    }
  }

  const memory = row.memory && typeof row.memory === "object" ? (row.memory as AiStreamRequest["memory"]) : undefined;

  return {
    ok: true,
    data: { mode: mode as AiStreamRequest["mode"], context, messages, personality, memory },
  };
}

export function parseGenerateRequest(body: unknown): { ok: true; data: AiGenerateRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const row = body as Record<string, unknown>;
  const kind = String(row.kind ?? "");
  if (!(GENERATE_KINDS as readonly string[]).includes(kind)) return { ok: false, error: "Invalid kind" };

  const ctx = row.context;
  if (!ctx || typeof ctx !== "object") return { ok: false, error: "Invalid context" };
  const c = ctx as Record<string, unknown>;
  const surface = String(c.surface ?? "").trim();
  if (!surface) return { ok: false, error: "context.surface is required" };

  return {
    ok: true,
    data: {
      kind: kind as AiGenerateRequest["kind"],
      context: {
        surface,
        subject: c.subject != null ? String(c.subject) : undefined,
        detail: c.detail != null ? String(c.detail) : undefined,
      },
      input: row.input,
    },
  };
}
