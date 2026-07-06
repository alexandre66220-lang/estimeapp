import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";
import { FaqAccordionDark } from "@/components/seo/FaqAccordion";
import { FAQ_LANDING, buildFaqJsonLd } from "@/lib/seo/faq";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Estime — L'app Instagram et avis Google pour artisans BTP",
  description:
    "Prenez une photo de chantier, Estime génère votre post Instagram en 10 secondes et envoie la demande d'avis Google à votre client. 14 jours gratuits.",
  alternates: { canonical: "https://estime-app.com" },
};

const faqJsonLd = buildFaqJsonLd(FAQ_LANDING);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Estime",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Reputation Management",
  operatingSystem: "Web, iOS, Android",
  url: "https://estime-app.com",
  description:
    "Estime aide les artisans du BTP à générer des posts Instagram depuis leurs photos de chantier et à automatiser leurs demandes d'avis Google. Inclut un CRM, un tableau de bord financier et une page vitrine publique.",
  keywords:
    "artisan BTP, réputation en ligne, avis Google, Instagram artisan, peintre, plombier, électricien, maçon, SaaS artisan",
  inLanguage: "fr-FR",
  offers: {
    "@type": "Offer",
    price: "24.99",
    priceCurrency: "EUR",
    priceValidUntil: "2027-01-01",
    availability: "https://schema.org/InStock",
    seller: { "@type": "Organization", name: "Estime" },
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    ratingCount: "1",
  },
  featureList: [
    "Génération de posts Instagram par IA",
    "Demandes d'avis Google automatiques",
    "Page vitrine publique artisan",
    "CRM artisan",
    "Score de réputation comparatif",
    "Tableau de bord financier",
    "Rapport PDF mensuel",
    "Programme de fidélité",
  ],
  creator: {
    "@type": "Organization",
    name: "AlcalSpark",
    url: "https://alcalspark.com",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main>
        <MotionProvider>
          <Hero />
          <Problem />
          <Solution />
          <HowItWorks />
          <Features />
          <Pricing />
          <FinalCTA />
        </MotionProvider>
        <section className="bg-noir py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <FaqAccordionDark items={FAQ_LANDING} title="Questions fréquentes" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
