"use client";

import { useEffect } from "react";

export function RoomPresenceHeartbeat({ roomId }: { roomId:string }) {
  useEffect(() => {
    const touch = () => { if (document.visibilityState === "visible") void fetch("/api/rooms/presence", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ roomId }) }).catch(() => undefined); };
    touch();
    const interval = window.setInterval(touch,45_000);
    document.addEventListener("visibilitychange",touch);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange",touch); };
  },[roomId]);
  return null;
}
