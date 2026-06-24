import { AnimateIn } from "./AnimateIn";

const FEATURES = [
  {
    icon: "📸",
    title: "Posts Instagram en 30 secondes",
    body: "Uploadez une photo de chantier, Estime génère une légende professionnelle prête à publier.",
  },
  {
    icon: "⭐",
    title: "Demandes d'avis automatiques",
    body: "Un email personnalisé envoyé à votre client pour lui demander un avis sur votre fiche Google.",
  },
  {
    icon: "#️⃣",
    title: "Hashtags selon votre ville et métier",
    body: "Les hashtags sont générés automatiquement selon votre métier et votre localisation pour maximiser votre portée.",
  },
  {
    icon: "📈",
    title: "Score de réputation en temps réel",
    body: "Suivez votre progression semaine après semaine grâce à un score basé sur vos chantiers, posts et avis reçus.",
  },
  {
    icon: "🏅",
    title: "Badge de confiance pour votre site",
    body: "Affichez votre score Estime sur votre site web pour rassurer vos prospects dès le premier regard.",
  },
  {
    icon: "📋",
    title: "Carnet d'adresses intégré",
    body: "Gérez vos clients directement dans Estime pour envoyer vos demandes d'avis en quelques clics.",
  },
  {
    icon: "🎁",
    title: "Parrainez, gagnez des mois gratuits",
    body: "Invitez d'autres artisans sur Estime et gagnez 1 mois gratuit pour chaque filleul qui s'abonne.",
  },
  {
    icon: "✅",
    title: "Notez vos chantiers en interne",
    body: "Gardez une trace de votre satisfaction sur chaque projet pour mieux suivre votre activité dans le temps.",
  },
  {
    icon: "📊",
    title: "Taux de conversion des avis",
    body: "Suivez combien de clients ont laissé un avis après votre demande et optimisez votre approche.",
  },
];

export default function Features() {
  return (
    <section className="bg-noir py-24 lg:py-32" id="fonctionnalites">
      <div className="max-w-6xl mx-auto px-6">
        <AnimateIn>
          <h2 className="font-landing-display text-4xl lg:text-5xl font-semibold text-dust leading-tight mb-5 text-center">
            Tout ce dont vous avez besoin, au même endroit
          </h2>
          <p className="font-landing-sans text-dust/60 text-lg leading-relaxed mb-16 lg:mb-20 text-center max-w-2xl mx-auto">
            Estime centralise tout ce qu&apos;il faut pour développer votre
            réputation en ligne.
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <AnimateIn key={feature.title} delay={(i % 3) * 0.08}>
              <div
                className="h-full rounded-2xl border border-[rgba(199,93,59,0.18)] p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[rgba(199,93,59,0.55)]"
                style={{ backgroundColor: "#221A16" }}
              >
                <div className="text-4xl mb-5" aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="font-landing-display text-lg font-semibold text-dust mb-2.5 leading-snug">
                  {feature.title}
                </h3>
                <p className="font-landing-sans text-dust/60 text-sm leading-relaxed">
                  {feature.body}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
