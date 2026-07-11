import "server-only";

export function authConfiguration() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase authentication is not configured.");
  return { url, key };
}

export function isSupabaseMode() { return process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase"; }
