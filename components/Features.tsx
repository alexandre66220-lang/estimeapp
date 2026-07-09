import Link from "next/link";
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
    icon: "🌐",
    title: "Mini site vitrine publique offert",
    body: "Un mini site vitrine personnalisé à partager à vos prospects, inclus dans chaque abonnement.",
  },
  {
    icon: "📈",
    title: "Score comparatif local",
    body: "Comparez votre réputation avec les autres artisans du même métier dans votre ville.",
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
    icon: "💰",
    title: "Suivi financier avancé",
    body: "Prévisionnel de trésorerie, impayés et rentabilité par chantier, tout au même endroit.",
  },
  {
    icon: "🎨",
    title: "Génération d'images IA",
    body: "Créez des visuels de chantier percutants pour vos réseaux, générés automatiquement par IA.",
  },
  {
    icon: "🧠",
    title: "Alter ego stratégique",
    body: "Un profil comportemental qui détecte vos patterns à risque et vous alerte avant de les reproduire.",
  },
  {
    icon: "🔍",
    title: "Langage des matériaux",
    body: "Scannez un matériau sur chantier, Estime identifie les risques et génère une fiche de sécurité.",
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

        <AnimateIn delay={0.2}>
          <div className="mt-12 text-center">
            <Link
              href="/fonctionnalites"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#C75D3B] text-[#C75D3B] font-landing-sans font-medium text-sm hover:bg-[#C75D3B]/8 transition-colors duration-200"
            >
              Voir toutes les fonctionnalités →
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
