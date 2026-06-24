import { AnimateIn } from "./AnimateIn";

export default function FinalCTA() {
  return (
    <section className="bg-braise py-24 lg:py-32" id="commencer">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <AnimateIn>
          <h2 className="font-landing-display text-4xl lg:text-5xl font-semibold text-dust leading-tight mb-5">
            Votre réputation commence aujourd&apos;hui.
          </h2>
          <p className="font-landing-sans text-dust/85 text-lg leading-relaxed mb-10">
            Rejoignez les artisans qui utilisent Estime pour développer leur
            présence en ligne.
          </p>
          <a
            href="/inscription"
            className="inline-flex items-center justify-center bg-noir text-dust font-semibold text-[1.0625rem] px-8 py-4 rounded-full hover:bg-dusk active:scale-[0.98] transition-all duration-200"
          >
            Essayer gratuitement
          </a>
        </AnimateIn>
      </div>
    </section>
  );
}
