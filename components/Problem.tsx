import { AnimateIn } from "./AnimateIn";
import { LumiereSeam } from "./LumiereSeam";

const PAINS = [
  {
    number: "01",
    title: "Pas le temps",
    body: "Entre les chantiers et la gestion, poster sur les réseaux est toujours remis à demain.",
  },
  {
    number: "02",
    title: "Peu d'avis Google",
    body: "Vos clients sont satisfaits mais personne ne pense à laisser un avis sans qu'on leur demande.",
  },
  {
    number: "03",
    title: "Réputation invisible",
    body: "Votre travail est excellent mais en ligne, vous êtes inexistant face à vos concurrents.",
  },
];

export default function Problem() {
  return (
    <section className="bg-dusk py-24 lg:py-32" id="probleme">
      <div className="max-w-6xl mx-auto px-6">
        <AnimateIn>
          <h2 className="font-landing-display text-4xl lg:text-5xl font-semibold text-dust leading-tight max-w-2xl mb-16 lg:mb-20">
            Le problème de la plupart des artisans
          </h2>
        </AnimateIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/8 rounded-2xl overflow-hidden">
          {PAINS.map((pain, i) => (
            <AnimateIn key={pain.number} delay={i * 0.12}>
              <div className="bg-dusk p-8 lg:p-10 h-full">
                <span
                  className="block font-landing-display text-6xl font-semibold text-ambre/20 mb-4 leading-none"
                  aria-hidden="true"
                >
                  {pain.number}
                </span>
                <h3 className="font-landing-display text-xl font-semibold text-dust mb-3 leading-snug">
                  {pain.title}
                </h3>
                <p className="font-landing-sans text-dust/55 text-base leading-relaxed max-w-[40ch]">
                  {pain.body}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
      <LumiereSeam className="h-1.5 mt-16 lg:mt-20" />
    </section>
  );
}
