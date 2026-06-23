import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <MotionProvider>
          <Hero />
          <Problem />
          <HowItWorks />
          <Pricing />
          <FinalCTA />
        </MotionProvider>
      </main>
      <Footer />
    </>
  );
}
