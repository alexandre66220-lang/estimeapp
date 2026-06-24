import { AnimateIn } from "./AnimateIn";

const BLOCKS = [
  {
    label: "RÉSEAUX SOCIAUX",
    title: "Un post Instagram en 30 secondes",
    body: "Prenez une photo de votre chantier avant et après. Estime analyse l'image et génère une légende professionnelle avec les bons hashtags pour votre métier et votre ville.",
  },
  {
    label: "AVIS GOOGLE",
    title: "Demandez des avis sans y penser",
    body: "À chaque fin de chantier, entrez l'email de votre client. Estime envoie automatiquement un email personnalisé pour lui demander un avis sur votre fiche Google.",
  },
  {
    label: "RÉPUTATION",
    title: "Suivez votre progression en temps réel",
    body: "Votre score de réputation évolue à chaque chantier, chaque post, chaque avis reçu. Voyez votre présence digitale grandir semaine après semaine.",
  },
];

function InstagramMockup() {
  return (
    <div className="bg-dusk rounded-2xl overflow-hidden border border-white/10 max-w-sm mx-auto">
      <div className="aspect-square bg-gradient-to-br from-ambre/30 via-braise/20 to-noir flex items-center justify-center">
        <span className="text-dust/30 text-sm">Photo avant/après</span>
      </div>
      <div className="p-4">
        <p className="text-dust text-sm leading-relaxed">
          <span className="font-semibold">Rénovation complète terminée ✨</span>
          <br />
          Encore un chantier qui change tout. Merci à nos clients pour leur
          confiance !
        </p>
        <p className="text-ambre text-sm mt-2">
          #peintre #renovation #artisan #avantapres
        </p>
      </div>
    </div>
  );
}

function EmailMockup() {
  return (
    <div className="bg-dusk rounded-2xl border border-white/10 max-w-sm mx-auto overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-dust/50 text-xs">À : client@email.com</p>
        <p className="text-dust text-sm font-semibold mt-1">
          Votre avis compte pour nous
        </p>
      </div>
      <div className="p-4">
        <p className="text-dust/70 text-sm leading-relaxed">
          Bonjour, merci d&apos;avoir fait confiance à notre entreprise pour
          vos travaux. Pourriez-vous prendre un instant pour laisser un avis
          sur notre fiche Google ?
        </p>
        <span className="inline-block mt-3 bg-braise text-white text-xs font-semibold px-4 py-2 rounded-full">
          Laisser un avis
        </span>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="bg-dusk rounded-2xl border border-white/10 max-w-sm mx-auto p-6">
      <p className="text-dust/50 text-xs uppercase tracking-wide mb-2">
        Score de réputation
      </p>
      <p className="font-landing-display text-5xl font-semibold text-ambre mb-4">
        82
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-noir/60 rounded-lg p-3">
          <p className="text-dust text-lg font-semibold">14</p>
          <p className="text-dust/50 text-xs">Posts générés</p>
        </div>
        <div className="bg-noir/60 rounded-lg p-3">
          <p className="text-dust text-lg font-semibold">9</p>
          <p className="text-dust/50 text-xs">Avis reçus</p>
        </div>
      </div>
    </div>
  );
}

const VISUALS = [InstagramMockup, EmailMockup, DashboardMockup];

export default function Solution() {
  return (
    <section className="bg-noir py-24 lg:py-32" id="solution">
      <div className="max-w-6xl mx-auto px-6">
        <AnimateIn>
          <h2 className="font-landing-display text-4xl lg:text-5xl font-semibold text-dust leading-tight max-w-2xl mb-16 lg:mb-20">
            Estime fait le travail à votre place
          </h2>
        </AnimateIn>

        <div className="flex flex-col gap-20 lg:gap-28">
          {BLOCKS.map((block, i) => {
            const Visual = VISUALS[i];
            const reversed = i % 2 === 1;
            return (
              <div
                key={block.label}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                  reversed ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <AnimateIn direction={reversed ? "left" : "up"}>
                  <p className="text-xs font-semibold tracking-[0.18em] uppercase text-ambre mb-4">
                    {block.label}
                  </p>
                  <h3 className="font-landing-display text-2xl lg:text-3xl font-semibold text-dust mb-4 leading-snug">
                    {block.title}
                  </h3>
                  <p className="font-landing-sans text-dust/60 text-base leading-relaxed max-w-[44ch]">
                    {block.body}
                  </p>
                </AnimateIn>
                <AnimateIn direction="none" delay={0.1}>
                  <Visual />
                </AnimateIn>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
