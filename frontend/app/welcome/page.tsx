import Link from "next/link";
import { currentSession } from "@/lib/auth/session";

export default async function Welcome() {
  const session = await currentSession().catch(() => undefined);
  return <main className="min-h-screen bg-white px-6 py-16 text-[#17191c]"><div className="mx-auto max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#6f8796]">Welcome to Orendalis</p><h1 className="mt-5 text-5xl font-semibold tracking-[-.045em]">Your search can start now.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#626970]">Bring your CV and let Atlas prepare the basics, or go straight to executive jobs. You can complete your profile at your own pace.</p><div className="mt-10 rounded-3xl border border-[#e3e5e6] bg-[#f7f8f8] p-6 sm:p-8"><p className="font-medium">Signed in{session?.user.email ? ` as ${session.user.email}` : " securely"}</p><p className="mt-2 text-sm leading-6 text-[#6f757b]">Nothing is shared or submitted without your action.</p><Link href="/onboarding" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[#17191c] px-6 text-sm font-semibold text-white">Choose how to begin</Link></div></div></main>;
}
