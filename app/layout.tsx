import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Estime - L'assistant post-chantier pour artisans",
  description:
    "Transformez chaque chantier en vitrine. Photo avant/après, post réseaux prêt en 30 secondes, relance automatique pour vos avis Google. 24,99€/mois.",
  openGraph: {
    title: "Estime - L'assistant post-chantier pour artisans",
    description:
      "Photo avant/après + IA = post réseaux prêt en 30 secondes. Relance auto pour vos avis Google.",
    locale: "fr_FR",
    type: "website",
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
      className={`${fraunces.variable} ${jakarta.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
