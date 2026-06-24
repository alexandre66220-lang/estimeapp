import { AnimateIn } from "./AnimateIn";

const STEPS = [
  {
    number: "01",
    title: "📸 Prenez une photo",
    body: "Avant, après, ou les deux. Depuis votre téléphone directement sur le chantier.",
  },
  {
    number: "02",
    title: "✨ Estime génère",
    body: "Post Instagram avec légende et hashtags. Email de demande d'avis pour votre client.",
  },
  {
    number: "03",
    title: "🚀 Vous publiez",
    body: "Copiez le post, publiez sur Instagram. L'email part automatiquement à votre client.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-dusk py-24 lg:py-32" id="comment-ca-marche">
      <div className="max-w-6xl mx-auto px-6">
        <AnimateIn>
          <h2 className="font-landing-display text-4xl lg:text-5xl font-semibold text-dust leading-tight mb-16 lg:mb-20">
            Simple comme bonjour
          </h2>
        </AnimateIn>

        <div className="relative max-w-3xl">
          <div
            className="absolute left-7 lg:left-9 top-3 bottom-3 w-px"
            style={{ background: "linear-gradient(to bottom, #D9883D, #95624A, #2B3138)" }}
            aria-hidden="true"
          />

          <div className="space-y-14 lg:space-y-16">
            {STEPS.map((step, i) => (
              <AnimateIn key={step.number} delay={i * 0.12}>
                <div className="relative flex gap-6 lg:gap-9 items-start">
                  <div
                    className="relative z-10 shrink-0 w-14 lg:w-[4.5rem] h-14 lg:h-[4.5rem] rounded-full bg-noir border border-dust/12 flex items-center justify-center font-landing-display text-lg lg:text-xl font-semibold text-dust"
                    aria-hidden="true"
                  >
                    {step.number}
                  </div>
                  <div className="pt-1 lg:pt-2.5 max-w-[46ch]">
                    <h3 className="font-landing-display text-xl lg:text-2xl font-semibold text-dust mb-2.5 leading-snug">
                      {step.title}
                    </h3>
                    <p className="font-landing-sans text-dust/60 text-base leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
