import { AnimateIn } from "./AnimateIn";

const PAINS = [
  {
    number: "01",
    title: "Après 8h de chantier, pas d'énergie pour la com",
    body: "Rédiger un post, trouver les bons mots, publier au bon moment. C'est un travail à part entière. Et vous en avez déjà un.",
  },
  {
    number: "02",
    title: "Vos clients satisfaits oublient de laisser un avis",
    body: "Ils avaient l'intention de le faire. La vie a repris le dessus. Résultat : votre réputation en ligne ne reflète pas la qualité de votre travail.",
  },
];

export default function Problem() {
  return (
    <section className="bg-dusk py-24 lg:py-32" id="probleme">
      <div className="max-w-6xl mx-auto px-6">

        {/* Titre principal */}
        <AnimateIn>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-dust leading-tight max-w-2xl mb-16 lg:mb-20">
            Votre travail est excellent.
            <br />
            <span className="text-ambre italic">Personne ne le voit.</span>
          </h2>
        </AnimateIn>

        {/* Points de douleur */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/8 rounded-2xl overflow-hidden">
          {PAINS.map((pain, i) => (
            <AnimateIn key={pain.number} delay={i * 0.12}>
              <div className="bg-dusk p-8 lg:p-10 h-full">
                <span
                  className="block font-display text-6xl font-bold text-ambre/20 mb-4 leading-none"
                  aria-hidden="true"
                >
                  {pain.number}
                </span>
                <h3 className="font-display text-xl font-semibold text-dust mb-3 leading-snug">
                  {pain.title}
                </h3>
                <p className="text-dust/55 text-base leading-relaxed max-w-[40ch]">
                  {pain.body}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>

        {/* Phrase qualitative */}
        <AnimateIn delay={0.25}>
          <div className="mt-12 flex flex-col sm:flex-row gap-2 sm:items-start">
            <p className="font-display text-4xl font-bold text-ambre shrink-0">Et</p>
            <p className="text-dust/50 text-sm max-w-[42ch] sm:ml-2 sm:mt-2 leading-relaxed">
              après une journée sur le chantier, s'asseoir devant un écran pour rédiger un post est la dernière chose qu'un artisan a envie de faire.
            </p>
          </div>
        </AnimateIn>
      </div>
      <div className="lumiere-fin-chantier h-1.5 mt-16 lg:mt-20" aria-hidden="true" />
    </section>
  );
}
