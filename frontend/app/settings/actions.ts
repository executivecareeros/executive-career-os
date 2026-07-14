"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function saveNotificationPreferences(formData: FormData) {
  const summary = formData.get("dailySummary") === "on" ? "enabled" : "disabled";
  (await cookies()).set("orendalis-daily-summary", summary, { maxAge: 31_536_000, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  redirect("/settings?saved=1");
}
