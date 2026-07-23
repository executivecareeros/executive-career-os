"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function RoomLiveRefresh() {
  const router = useRouter();
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    let composing = false;
    const onFocusIn = (event: FocusEvent) => {
      composing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
    };
    const onFocusOut = () => { composing = false; };
    const refresh = () => {
      if (document.visibilityState !== "visible" || composing) return;
      setConnected(false);
      router.refresh();
      window.setTimeout(() => setConnected(true), 350);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    const interval = window.setInterval(refresh, 4_000);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [router]);

  return <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#526070]" role="status">
    <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-400"}`} aria-hidden="true"/>
    {connected ? "Live channel" : "Updating"}
  </span>;
}
