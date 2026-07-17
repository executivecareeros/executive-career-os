import "server-only";
import { createSupabaseDataClient } from "./client";

export function createSchedulerSupabaseClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SCHEDULER_KEY;
  if (!url || !key) throw new Error("SCHEDULER_CONFIGURATION_MISSING");
  return createSupabaseDataClient({ url, anonymousKey: key, mode: "supabase" });
}
