"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LinkedInCallbackPage() {
  const params = useSearchParams();
  const [message, setMessage] = useState("Securing your LinkedIn sign-in…");
  useEffect(() => {
    const hash = new URLSearchParams(location.hash.slice(1));
    const accessToken = hash.get("access_token"), refreshToken = hash.get("refresh_token"), expiresIn = Number(hash.get("expires_in") ?? 3600);
    history.replaceState(null, "", location.pathname + location.search);
    if (!accessToken || !refreshToken) { location.replace("/login?error=LinkedIn%20sign-in%20could%20not%20be%20completed"); return; }
    fetch("/api/auth/linkedin-session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ accessToken, refreshToken, expiresIn }) })
      .then(async response => { const body = await response.json() as { error?: string }; if (!response.ok) throw new Error(body.error ?? "LinkedIn sign-in was not accepted"); location.replace(params.get("next")?.startsWith("/") ? params.get("next")! : "/"); })
      .catch(error => { setMessage(error instanceof Error ? error.message : "LinkedIn sign-in was not accepted"); setTimeout(() => location.replace("/login?error=LinkedIn%20sign-in%20was%20not%20accepted"), 1400); });
  }, [params]);
  return <main className="flex min-h-screen items-center justify-center bg-[#07101f] px-6"><div className="rounded-3xl bg-white p-8 text-center shadow-2xl"><div className="mx-auto h-3 w-3 animate-pulse rounded-full bg-[#3457d5]"/><p role="status" className="mt-5 text-sm font-medium text-[#263246]">{message}</p></div></main>;
}
