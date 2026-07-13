import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyControlCenter } from "@/components/company-control/company-control-center";
import { currentSession } from "@/lib/auth/session";
import { isSupabaseMode } from "@/lib/auth/configuration";
import { createCompanySnapshot } from "@/lib/company-intelligence";

export const metadata: Metadata = { title: "Company Control Center", description: "Founder-only internal Orendalis operating dashboard." };

export default async function CompanyControlPage() {
  if (isSupabaseMode()) {
    const session = await currentSession();
    const founderEmail = process.env.COMPANY_CONTROL_FOUNDER_EMAIL?.trim().toLowerCase();
    if (!session || !founderEmail || session.user.email?.toLowerCase() !== founderEmail) notFound();
  }
  return <CompanyControlCenter snapshot={createCompanySnapshot()} />;
}
