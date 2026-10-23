import { cookies } from "next/headers";
import { DEMO_COOKIE, isDemoCookieValue, isDemoEnvEnabled } from "@/lib/auth/demo";
import { getSessionUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AiCaller = { userId: string } | { demo: true };

export async function resolveAiCaller(): Promise<AiCaller | null> {
  const user = await getSessionUser();
  if (user) return { userId: user.id };

  if (!isSupabaseConfigured() || isDemoEnvEnabled()) {
    return { demo: true };
  }

  const jar = await cookies();
  const demo = jar.get(DEMO_COOKIE)?.value;
  if (isDemoCookieValue(demo)) return { demo: true };

  return null;
}
