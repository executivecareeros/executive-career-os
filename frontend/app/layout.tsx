import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { cookies } from "next/headers";
import "./globals.css";
import { getLocale } from "@/lib/locale";
import { currentSession } from "@/lib/auth/session";
import { resolveExecutiveDisplayName } from "@/lib/auth/executive-display-name";

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
    default: "ORENDALIS — Find your next executive opportunity",
    template: "%s | ORENDALIS",
  },
  description: "Upload your CV, search executive opportunities, and let Atlas show you the roles that appear strongest for your experience.",
  applicationName: "ORENDALIS",
  keywords: ["executive jobs", "executive opportunities", "career search", "leadership roles", "Atlas"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ORENDALIS",
    title: "Find your next executive opportunity",
    description: "Upload your CV, search executive opportunities, and let Atlas help you identify the roles worth reviewing.",
    locale: "en_US",
    images: [{ url: "/brand/orendalis-social-preview.png", width: 1200, height: 630, alt: "ORENDALIS — a clearer perspective on executive opportunities" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ORENDALIS — Find your next executive opportunity",
    description: "Search executive opportunities and let Atlas help you identify the roles worth reviewing.",
    images: ["/brand/orendalis-social-preview.png"],
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

const publicStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://www.orendalis.com/#organization", name: "ORENDALIS", url: "https://www.orendalis.com", logo: "https://www.orendalis.com/icon.svg" },
    { "@type": "WebSite", "@id": "https://www.orendalis.com/#website", name: "ORENDALIS", url: "https://www.orendalis.com", inLanguage: "en", publisher: { "@id": "https://www.orendalis.com/#organization" } },
    { "@type": "SoftwareApplication", name: "ORENDALIS", url: "https://www.orendalis.com", applicationCategory: "BusinessApplication", operatingSystem: "Web", description: "A private executive career platform for searching opportunities and reviewing evidence-backed Atlas guidance.", offers: { "@type": "Offer", availability: "https://schema.org/OnlineOnly" }, provider: { "@id": "https://www.orendalis.com/#organization" } },
  ],
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
  const session = hasSession ? await currentSession().catch(() => undefined) : undefined;
  const signedInName = session ? await resolveExecutiveDisplayName(session).catch(() => undefined) : undefined;
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f5f7fb]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(publicStructuredData).replace(/</g, "\\u003c") }} />
        <AppShell publicExperience={publicExperience} locale={locale} signedInName={signedInName} signedInEmail={session?.user.email}>{children}</AppShell>
      </body>
    </html>
  );
}
