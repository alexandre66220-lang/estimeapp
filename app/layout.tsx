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
  metadataBase: new URL("https://estime-app.netlify.app"),
  title: "Estime - L'assistant post-chantier pour artisans",
  description:
    "Transformez chaque chantier en vitrine. Photo avant/après, post réseaux prêt en 30 secondes, relance automatique pour vos avis Google. 24,99€/mois.",
  openGraph: {
    title: "Estime - L'assistant post-chantier pour artisans",
    description:
      "Photo avant/après + IA = post réseaux prêt en 30 secondes. Relance auto pour vos avis Google.",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/hero-peintre.jpg",
        width: 1200,
        height: 900,
        alt: "Artisan peintre en train de travailler sur un chantier",
      },
    ],
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
