import { redirect } from "next/navigation";
import { ExecutiveReferralShare } from "@/components/referrals/executive-referral-share";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";

export default async function InviteExecutivePage() {
  if (!await resolveAuthenticatedRepositoryContext()) redirect(`/login?next=${encodeURIComponent("/invite")}`);
  return <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
    <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#3457d5]">Executive network</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] text-[#0b1220] sm:text-5xl">The strongest networks grow through trusted introductions.</h1>
    <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5f6b7a]">Invite a connection who would benefit from a private, evidence-led way to navigate executive opportunities.</p>
    <div className="mt-9"><ExecutiveReferralShare /></div>
  </main>;
}
