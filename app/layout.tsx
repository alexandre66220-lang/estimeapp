import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://estime-app.com"),
  title: "Estime — Posts Instagram et avis Google pour artisans",
  description:
    "Estime génère vos posts Instagram et vos demandes d'avis Google en 30 secondes depuis vos photos de chantier. Essai gratuit 14 jours.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  openGraph: {
    title: "Estime — Posts Instagram et avis Google pour artisans",
    description:
      "Estime génère vos posts Instagram et vos demandes d'avis Google en 30 secondes depuis vos photos de chantier. Essai gratuit 14 jours.",
    url: "https://estime-app.com",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Estime — Posts Instagram et avis Google pour artisans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Estime — Posts Instagram et avis Google pour artisans",
    description:
      "Estime génère vos posts Instagram et vos demandes d'avis Google en 30 secondes depuis vos photos de chantier. Essai gratuit 14 jours.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${publicSans.variable} ${fraunces.variable} ${jakarta.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
