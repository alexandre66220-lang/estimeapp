import { Camera, Sparkle, Star } from "@phosphor-icons/react/dist/ssr";
import { AnimateIn } from "./AnimateIn";

const STEPS = [
  {
    number: "01",
    icon: Camera,
    title: "Photo du chantier",
    body: "Avant, après, ou les deux. Prenez la photo directement depuis votre téléphone. Trente secondes grand maximum.",
  },
  {
    number: "02",
    icon: Sparkle,
    title: "L'IA génère votre post",
    body: "Description du travail, hashtags, ton professionnel. Votre post Instagram ou Facebook est prêt à publier. Vous validez ou ajustez en un tap.",
  },
  {
    number: "03",
    icon: Star,
    title: "Relance auto pour l'avis",
    body: "48h après la fin du chantier, votre client reçoit un email avec un lien direct vers votre fiche Google. Simple pour lui, précieux pour vous.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-dust py-24 lg:py-32" id="comment-ca-marche">
      <div className="max-w-6xl mx-auto px-6">

        <AnimateIn>
          <div className="mb-16 lg:mb-20">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-dusk leading-tight mb-4">
              Trois étapes. Zéro effort.
            </h2>
            <p className="text-dusk/55 text-lg max-w-[44ch]">
              De la photo au post publié et à l'avis Google, tout est automatique.
            </p>
          </div>
        </AnimateIn>

        {/* Fil de lumière reliant les trois étapes, de l'ambre au crépuscule */}
        <div className="relative max-w-3xl">
          <div
            className="absolute left-7 lg:left-9 top-3 bottom-3 w-px"
            style={{ background: "linear-gradient(to bottom, #D9883D, #95624A, #2B3138)" }}
            aria-hidden="true"
          />

          <div className="space-y-14 lg:space-y-16">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <AnimateIn key={step.number} delay={i * 0.12}>
                  <div className="relative flex gap-6 lg:gap-9 items-start">
                    <div
                      className="relative z-10 shrink-0 w-14 lg:w-[4.5rem] h-14 lg:h-[4.5rem] rounded-full bg-white border border-dusk/12 flex items-center justify-center font-display text-lg lg:text-xl font-bold text-dusk"
                      aria-hidden="true"
                    >
                      {step.number}
                    </div>
                    <div className="pt-1 lg:pt-2.5 max-w-[46ch]">
                      <div className="inline-flex w-9 h-9 rounded-lg bg-ambre/10 items-center justify-center mb-3.5">
                        <Icon size={18} weight="fill" className="text-ambre" aria-hidden="true" />
                      </div>
                      <h3 className="font-display text-xl lg:text-2xl font-semibold text-dusk mb-2.5 leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-dusk/60 text-base leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </AnimateIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
