import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { cookies } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Orendalis — A private place for consequential careers",
    template: "%s | Orendalis",
  },
  description: "A private career intelligence institution for executives making consequential decisions.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("ecos-access-token") || cookieStore.has("ecos-refresh-token");
  const publicExperience = process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase" && !hasSession;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950">
        <AppShell publicExperience={publicExperience}>{children}</AppShell>
      </body>
    </html>
  );
}
