import "server-only";

/**
 * Returns true only when real Supabase credentials are present.
 * If NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are missing
 * (or left as obvious placeholders), the app automatically falls back
 * to a local JSON + filesystem store so it can run with zero setup.
 *
 * Local mode is for local development / demos only. For a real
 * production deployment on Vercel, set real Supabase credentials —
 * see README.md.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return false;
  if (url.includes("placeholder") || key.includes("placeholder")) return false;
  if (!url.startsWith("http")) return false;

  return true;
}

export function backendMode(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}
