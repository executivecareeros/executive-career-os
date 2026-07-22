import type { SupabaseConfiguration, SupabaseErrorPayload } from "./types";

export interface SupabaseResponse<T> { data?: T; error?: SupabaseErrorPayload; status: number; headers?: Headers }
export interface SupabaseDataClient { request<T>(path: string, init?: RequestInit): Promise<SupabaseResponse<T>>; health(): Promise<boolean> }

export function createSupabaseDataClient(configuration: SupabaseConfiguration, accessToken?: string): SupabaseDataClient {
  const headers = { apikey: configuration.anonymousKey, Authorization: `Bearer ${accessToken ?? configuration.anonymousKey}`, "Content-Type": "application/json", Prefer: "return=representation" };
  return {
    async request<T>(path: string, init?: RequestInit): Promise<SupabaseResponse<T>> {
      const response = await fetch(`${configuration.url}/rest/v1/${path}`, { ...init, headers: { ...headers, ...init?.headers } });
      const body = await response.json().catch(() => undefined) as T | SupabaseErrorPayload | undefined;
      return response.ok ? { data: body as T, status: response.status, headers: response.headers } : { error: (body as SupabaseErrorPayload | undefined) ?? { message: `Supabase request failed (${response.status})` }, status: response.status, headers: response.headers };
    },
    async health() {
      const response = await fetch(`${configuration.url}/rest/v1/`, { headers });
      return response.ok;
    },
  };
}
