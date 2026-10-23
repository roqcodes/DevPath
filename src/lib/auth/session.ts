import { createClient } from "@/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.id) return null;

  return { id: user.id, email: user.email ?? "" };
}
