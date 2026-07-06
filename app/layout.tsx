import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import CookieConsent from "@/components/CookieConsent";
import { ThemeProvider } from "@/components/ThemeProvider";
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
  title: {
    default: "Estime — L'app de réputation pour les artisans BTP",
    template: "%s | Estime",
  },
  description:
    "Estime aide les artisans du BTP à générer des posts Instagram depuis leurs photos de chantier et à automatiser leurs demandes d'avis Google. 14 jours gratuits.",
  keywords: ["artisan", "BTP", "réputation", "avis Google", "Instagram", "peintre", "plombier", "électricien", "maçon"],
  authors: [{ name: "AlcalSpark", url: "https://alcalspark.com" }],
  creator: "AlcalSpark",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Estime",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://estime-app.com",
    siteName: "Estime",
    title: "Estime — L'app de réputation pour les artisans BTP",
    description:
      "Générez des posts Instagram et automatisez vos demandes d'avis Google. 14 jours gratuits sans carte bancaire.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Estime — App artisans BTP" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Estime — L'app de réputation pour les artisans BTP",
    description: "Générez des posts Instagram et automatisez vos demandes d'avis Google.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  other: {
    "application-name": "Estime",
    author: "AlcalSpark",
    category: "SaaS, Réputation, Artisans BTP",
    classification: "Business, SaaS, Artisans",
    target: "Artisans du BTP, peintres, plombiers, électriciens, maçons",
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
        <ThemeProvider>
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
