/** Default OpenRouter model: free-tier router (see https://openrouter.ai/openrouter/free). */
export const DEFAULT_OPENROUTER_MODEL = "openrouter/free";

export function getOpenRouterConfig(): { apiKey: string; model: string } | null {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
  return { apiKey, model };
}

export function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}
