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
    <section className="bg-creme py-24 lg:py-32" id="comment-ca-marche">
      <div className="max-w-6xl mx-auto px-6">

        <AnimateIn>
          <div className="mb-16 lg:mb-20">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-charbon leading-tight mb-4">
              Trois étapes. Zéro effort.
            </h2>
            <p className="text-charbon/55 text-lg max-w-[44ch]">
              De la photo au post publié et à l'avis Google, tout est automatique.
            </p>
          </div>
        </AnimateIn>

        {/* Steps: layout asymétrique - grand / petit-petit */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isFirst = i === 0;

            return (
              <AnimateIn key={step.number} delay={i * 0.1}>
                <div
                  className={`relative rounded-2xl border border-charbon/10 p-8 lg:p-10 overflow-hidden h-full ${
                    isFirst ? "bg-charbon" : "bg-white"
                  }`}
                >
                  {/* Large number behind */}
                  <span
                    className={`absolute top-4 right-6 font-display text-8xl font-bold leading-none pointer-events-none select-none ${
                      isFirst ? "text-terracotta/15" : "text-charbon/6"
                    }`}
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-6 ${
                      isFirst ? "bg-terracotta/20" : "bg-terracotta/10"
                    }`}
                  >
                    <Icon
                      size={22}
                      weight="fill"
                      className="text-terracotta"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Content */}
                  <h3
                    className={`font-display text-xl font-semibold mb-3 leading-snug ${
                      isFirst ? "text-creme" : "text-charbon"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-base leading-relaxed ${
                      isFirst ? "text-creme/60" : "text-charbon/60"
                    }`}
                  >
                    {step.body}
                  </p>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
