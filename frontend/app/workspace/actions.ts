"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { saveExecutiveManualPreferences } from "@/lib/geographic-profile-repository";

const list = (formData: FormData, key: string) => formData.getAll(key).flatMap(value => String(value).split(/[,\n]/)).map((value) => value.trim()).filter(Boolean).slice(0, 50);
const money = (formData: FormData, key: string) => { const value = String(formData.get(key) ?? "").trim(); if (!value) return null; const number = Number(value); if (!Number.isFinite(number) || number < 0) throw new Error("Salary values must be positive numbers."); return number; };

export async function saveManualPreferencesAction(formData: FormData) {
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/workspace#preferences");
  const salaryMinimum = money(formData, "salaryMinimum"), salaryMaximum = money(formData, "salaryMaximum");
  if (salaryMinimum !== null && salaryMaximum !== null && salaryMinimum > salaryMaximum) throw new Error("Minimum salary cannot exceed maximum salary.");
  const salaryCurrency = String(formData.get("salaryCurrency") ?? "").trim().toUpperCase() || null;
  if (salaryCurrency && !/^[A-Z]{3}$/.test(salaryCurrency)) throw new Error("Use a three-letter currency code.");
  await saveExecutiveManualPreferences(createServerSupabaseClient(resolved.accessToken), resolved.context, {
    locations: list(formData, "locations"), countries: list(formData, "countries"), industries: list(formData, "industries"), titles: list(formData, "titles"), seniorities: list(formData, "seniorities"),
    salaryMinimum, salaryMaximum, salaryCurrency, employmentTypes: list(formData, "employmentTypes"), remotePreferences: list(formData, "remotePreferences"), companySizes: list(formData, "companySizes"), travelPreference: String(formData.get("travelPreference") ?? "").trim() || null,
    source: "User Preference", updatedAt: new Date().toISOString(),
  });
  revalidatePath("/workspace"); revalidatePath("/opportunities");
  redirect("/workspace?preferences=saved#preferences");
}
