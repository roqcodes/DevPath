/**
 * Browser-safe Supabase API key.
 * Supabase Dashboard labels this the "publishable" key; it is the same JWT as the legacy "anon" key.
 * Never use the service role / secret key in NEXT_PUBLIC_* variables.
 */
export function getSupabasePublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabasePublishableKey();
  return Boolean(url && key && url.length > 0 && key.length > 0);
}
