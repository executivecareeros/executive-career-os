import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { cookies } from "next/headers";
import "./globals.css";
import { getLocale } from "@/lib/locale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.orendalis.com"),
  title: {
    default: "Orendalis — Find your next executive opportunity",
    template: "%s | Orendalis",
  },
  description: "Upload your CV, search executive opportunities, and let Atlas show you the roles that appear strongest for your experience.",
  applicationName: "Orendalis",
  keywords: ["executive jobs", "executive opportunities", "career search", "leadership roles", "Atlas"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Orendalis",
    title: "Find your next executive opportunity",
    description: "Upload your CV, search executive opportunities, and let Atlas help you identify the roles worth reviewing.",
    locale: "en_US",
    images: [{ url: "/brand/orendalis-social-preview.png", width: 1200, height: 630, alt: "Orendalis — a clearer perspective on executive opportunities" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orendalis — Find your next executive opportunity",
    description: "Search executive opportunities and let Atlas help you identify the roles worth reviewing.",
    images: ["/brand/orendalis-social-preview.png"],
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = await getLocale();
  const hasSession = cookieStore.has("ecos-access-token") || cookieStore.has("ecos-refresh-token");
  const publicExperience = process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase" && !hasSession;
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f7f3ec]">
        <AppShell publicExperience={publicExperience} locale={locale}>{children}</AppShell>
      </body>
    </html>
  );
}
