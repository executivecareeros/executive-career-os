import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { InvitationManagement } from "@/components/company-control/invitation-management";
import { resolveFounderAccess } from "@/lib/auth/founder-access";
import { FounderInvitationService } from "@/lib/beta/invitation-management";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata:Metadata={title:"Executive Invitation Management",description:"Founder-only executive access management."};
export const dynamic="force-dynamic";
export default async function InvitationManagementPage(){const access=await resolveFounderAccess();if(!access)notFound();const invitations=await new FounderInvitationService(createServerSupabaseClient(access.accessToken),access.context.workspace!.workspaceId).list();return <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10"><Link href="/company-control" className="text-sm font-semibold text-blue-700 hover:text-blue-800">← Company Control</Link><div className="mt-5"><PageHeader eyebrow="Founder access" title="Executive Invitation Management" description="Create and govern secure access for invited executives."/></div><div className="mt-7"><InvitationManagement initialInvitations={invitations}/></div></main>;}
