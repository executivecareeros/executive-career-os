import "server-only";

import type { CurrentExecutiveSession } from "./types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type IdentityRow = { profile?: unknown };
type ExperienceRow = { notes?: string | null };

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (cleaned.length < 2 || cleaned.length > 120) return undefined;
  if (cleaned === cleaned.toUpperCase() && /[A-Z]/.test(cleaned)) {
    return cleaned.toLocaleLowerCase("en").replace(/(^|[\s'-])([a-z])/g, (_, boundary: string, letter: string) => `${boundary}${letter.toUpperCase()}`);
  }
  return cleaned;
}

export function confirmedExecutiveName(value: unknown): string | undefined {
  const source = record(value);
  if (!source) return undefined;
  const direct = text(source.fullName) ?? text(source.full_name);
  if (direct) return direct;
  const first = text(source.firstName) ?? text(source.first_name);
  const last = text(source.lastName) ?? text(source.last_name);
  if (first && last) return `${first} ${last}`;
  return text(source.preferredName);
}

function nameFromExperienceNotes(notes: string | null | undefined): string | undefined {
  if (!notes) return undefined;
  try {
    const payload = record(JSON.parse(notes));
    const context = typeof payload?.documentContext === "string"
      ? record(JSON.parse(payload.documentContext))
      : record(payload?.documentContext);
    return confirmedExecutiveName(record(context)?.profile);
  } catch {
    return undefined;
  }
}

export async function resolveExecutiveDisplayName(session: CurrentExecutiveSession): Promise<string | undefined> {
  const client = createServerSupabaseClient(session.accessToken);
  const identity = await client.request<IdentityRow[]>(
    `executive_identities?select=profile&auth_user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`,
  );
  const profile = identity.data?.[0]?.profile;
  const profileName = confirmedExecutiveName(profile);
  const hasFullProfileName = Boolean(record(profile)?.fullName ?? record(profile)?.full_name);
  if (profileName && hasFullProfileName) return profileName;

  const history = await client.request<ExperienceRow[]>(
    "professional_experiences?select=notes&archived_at=is.null&order=created_at.desc&limit=10",
  );
  for (const experience of history.data ?? []) {
    const name = nameFromExperienceNotes(experience.notes);
    if (name) return name;
  }
  return profileName;
}
