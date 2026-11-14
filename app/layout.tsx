import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Clinical AI Safety | Safety Decision Assurance",
    template: `%s · ${site.name}`,
  },
  description:
    "A system for stress-testing clinical AI safety decisions before deployment. Examine hazards, control effectiveness, residual risk and governance in UK healthcare AI.",
  applicationName: site.name,
  icons: {
    icon: [{ url: "/logo-icon.png", type: "image/png" }],
    shortcut: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
  authors: [{ name: site.author.name }],
  keywords: [
    "Clinical Safety Officer",
    "NHS",
    "DCB0129",
    "DCB0160",
    "DTAC",
    "AI in healthcare",
    "Clinical AI safety",
    "ISO 14971",
    "PSIRF",
    "MHRA AIaMD",
    "AI as a Medical Device",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: site.url,
    siteName: site.name,
    title: "Clinical AI Safety | Safety Decision Assurance",
    description:
      "Stress-test clinical AI safety decisions before deployment, with evidence-linked assessment of hazards, controls, residual risk and governance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinical AI Safety | Safety Decision Assurance",
    description:
      "Stress-test clinical AI safety decisions before deployment, with evidence-linked assessment of hazards, controls, residual risk and governance.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={manrope.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
