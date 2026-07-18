"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { productSurface } from "@/lib/product-learning";

const SESSION_KEY = "orendalis-product-learning-session";

function sessionKey() {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, created);
  return created;
}

function record(payload: Record<string, unknown>) {
  void fetch("/api/product-learning", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    keepalive: true,
    body: JSON.stringify({ id: crypto.randomUUID(), session: sessionKey(), ...payload }),
  }).catch(() => undefined);
}

export function ProductLearningTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const started = Date.now();
    const surface = productSurface(pathname);
    record({ type: "page_view", surface, route: pathname });
    return () => record({ type: "engagement", surface, route: pathname, durationSeconds: Math.min(3600, Math.max(0, Math.round((Date.now() - started) / 1000))) });
  }, [pathname]);

  return null;
}
