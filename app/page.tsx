import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";

export const dynamic = "force-static";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Estime",
  description:
    "Estime génère vos posts Instagram et vos demandes d'avis Google en 30 secondes depuis vos photos de chantier.",
  url: "https://estime-app.com",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "24.99",
    priceCurrency: "EUR",
    priceValidUntil: "2027-12-31",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "1",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
      </main>
      <Footer />
    </>
  );
}
