import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";

export const dynamic = "force-static";

export default function Home() {
  return (
    <>
      <main>
        <MotionProvider>
          <Hero />
          <Problem />
          <Solution />
          <HowItWorks />
          <Pricing />
          <FinalCTA />
        </MotionProvider>
      </main>
      <Footer />
    </>
  );
}
