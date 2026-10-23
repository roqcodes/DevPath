import type { AiGenerateRequest, AiGenerateResponse, GenerateKind } from "@/lib/companion/types";
import type { ArenaBoss } from "./constants";
import { localGenerate } from "./local-fallback";

export async function postAiGenerate<K extends GenerateKind>(
  req: AiGenerateRequest,
  boss?: ArenaBoss,
): Promise<AiGenerateResponse<K>> {
  try {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (res.ok) {
      const json = (await res.json()) as AiGenerateResponse<K>;
      if (json?.data) return json;
    }
  } catch {
    /* network / missing route */
  }
  return localGenerate(req, boss);
}
