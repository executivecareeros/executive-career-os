"use client";

import { useState } from "react";

const inviteUrl = "https://www.orendalis.com/?utm_source=executive_referral&utm_medium=personal_share&utm_campaign=executive_invitation";
const inviteText = "I thought ORENDALIS might be useful for your executive career decisions. It brings opportunity discovery, private career context, and evidence-backed Atlas guidance into one place.";

export function ExecutiveReferralShare({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState("");
  async function copy() { await navigator.clipboard.writeText(`${inviteText}\n\n${inviteUrl}`); setStatus("Invitation copied."); }
  async function share() {
    setStatus("");
    if (navigator.share) {
      try { await navigator.share({ title: "ORENDALIS", text: inviteText, url: inviteUrl }); setStatus("Invitation shared."); return; }
      catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
    }
    await copy();
  }
  const linkedInShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteUrl)}`;
  if (compact) return <button type="button" onClick={share} className="rounded-lg px-3 py-2 text-sm text-[#687078] transition hover:bg-[#f3f4f4] hover:text-[#17191c]">Invite</button>;
  return <section className="rounded-3xl border border-[#dfe5ee] bg-white p-6 shadow-sm sm:p-8">
    <p className="atlas-kicker">Trusted introductions</p>
    <h2 className="mt-3 text-2xl font-semibold tracking-[-.025em] text-[#0b1220]">Invite an executive you trust</h2>
    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f6b7a]">Share ORENDALIS personally. We never access your LinkedIn connections, send messages for you, or upload an address book.</p>
    <div className="mt-6 flex flex-wrap gap-3">
      <button type="button" onClick={share} className="rounded-xl bg-[#0b1220] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">Share invitation</button>
      <a href={linkedInShare} target="_blank" rel="noreferrer" className="rounded-xl border border-[#cbd5e1] bg-white px-5 py-3 text-sm font-semibold text-[#182234] transition hover:bg-[#f8fafc]">Share on LinkedIn</a>
      <button type="button" onClick={copy} className="rounded-xl border border-[#cbd5e1] bg-white px-5 py-3 text-sm font-semibold text-[#182234] transition hover:bg-[#f8fafc]">Copy invitation</button>
    </div>
    {status && <p role="status" className="mt-4 text-sm font-medium text-[#3e6958]">{status}</p>}
    <p className="mt-5 text-xs leading-5 text-[#7a8592]">The recipient chooses whether to visit or register. ORENDALIS receives no LinkedIn identity or connection data through this share.</p>
  </section>;
}
