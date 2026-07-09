import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { FaqAccordionDark } from "@/components/seo/FaqAccordion";
import { FAQ_FONCTIONNALITES, buildFaqJsonLd } from "@/lib/seo/faq";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Toutes les fonctionnalités, Estime",
  description:
    "Posts Instagram IA, gestion clients, tableau de bord financier, page vitrine publique, score de réputation comparatif. Découvrez tout ce qu'Estime fait pour vous.",
  alternates: { canonical: "https://estime-app.com/fonctionnalites" },
};

type Feature = { icon: string; title: string; desc: string };
type Section = { id: string; label: string; features: Feature[] };

const SECTIONS: Section[] = [
  {
    id: "reputation",
    label: "Réputation & Visibilité",
    features: [
      {
        icon: "📸",
        title: "Génération de posts Instagram",
        desc: "Prenez une photo de votre chantier. L'IA génère un post Instagram professionnel en 10 secondes, avec les bons hashtags selon votre métier et votre ville.",
      },
      {
        icon: "📱",
        title: "Story Instagram",
        desc: "Générez une story verticale 9:16 prête à publier depuis vos photos de chantier, avec votre logo et un appel à l'action.",
      },
      {
        icon: "🔀",
        title: "Photo avant/après",
        desc: "Estime compose automatiquement une image avant/après avec votre logo en filigrane, optimisée pour Instagram.",
      },
      {
        icon: "⭐",
        title: "Demande d'avis Google",
        desc: "Un email personnalisé est envoyé automatiquement à votre client après chaque chantier pour lui demander un avis Google.",
      },
      {
        icon: "📈",
        title: "Score de réputation",
        desc: "Votre score de réputation évolue en temps réel selon vos chantiers, vos posts publiés et vos avis reçus.",
      },
      {
        icon: "🏆",
        title: "Score comparatif local",
        desc: "Comparez votre score avec les autres artisans du même métier dans votre ville. Sachez exactement où vous vous situez.",
      },
      {
        icon: "🏅",
        title: "Badge de confiance",
        desc: "Un badge SVG embarquable sur votre site web qui affiche votre score de réputation en temps réel.",
      },
      {
        icon: "🌐",
        title: "Page vitrine publique",
        desc: "Chaque artisan abonné dispose d'une page publique personnalisée (estime-app.com/artisan/votre-nom) à partager à ses prospects. Inclus dans l'abonnement.",
      },
      {
        icon: "📒",
        title: "Annuaire public",
        desc: "Votre profil apparaît automatiquement dans l'annuaire Estime, consultable par les particuliers qui cherchent un artisan de confiance.",
      },
    ],
  },
  {
    id: "clients",
    label: "Gestion Clients & CRM",
    features: [
      {
        icon: "📋",
        title: "Carnet d'adresses",
        desc: "Centralisez tous vos clients avec leur historique de chantiers, leurs avis et vos notes privées.",
      },
      {
        icon: "📊",
        title: "Pipeline de prospects",
        desc: "Un kanban simple pour suivre vos prospects : de la prise de contact jusqu'au chantier terminé.",
      },
      {
        icon: "📝",
        title: "Notes par client",
        desc: "Ajoutez des notes privées sur chaque client : préférences, détails importants, observations.",
      },
      {
        icon: "💡",
        title: "Statistiques clients",
        desc: "Chiffre d'affaires par client, nombre de chantiers, taux de réachat. Identifiez vos meilleurs clients.",
      },
    ],
  },
  {
    id: "finances",
    label: "Finances",
    features: [
      {
        icon: "💶",
        title: "Tableau de bord financier",
        desc: "Suivez votre chiffre d'affaires mensuel, votre marge par chantier et votre progression vers vos objectifs annuels.",
      },
      {
        icon: "🧮",
        title: "Calculateur de rentabilité",
        desc: "Saisissez vos dépenses et heures passées par chantier. Estime calcule votre marge réelle et votre taux horaire.",
      },
      {
        icon: "📅",
        title: "Comparatif de périodes",
        desc: "Comparez deux périodes côte à côte pour mesurer votre progression. Ce mois vs le mois dernier, cette année vs l'année dernière.",
      },
      {
        icon: "📤",
        title: "Export CSV",
        desc: "Exportez toutes vos données financières en un clic pour votre comptable ou vos déclarations.",
      },
    ],
  },
  {
    id: "outils",
    label: "Outils Pratiques",
    features: [
      {
        icon: "📐",
        title: "Calculateur de surface m²",
        desc: "Calculez la surface d'une pièce et estimez la quantité de peinture nécessaire directement depuis l'app.",
      },
      {
        icon: "🗓️",
        title: "Agenda des chantiers",
        desc: "Une vue calendrier mensuel de tous vos chantiers avec leurs statuts et dates.",
      },
{
        icon: "📄",
        title: "Rapport PDF mensuel",
        desc: "Chaque 1er du mois, recevez par email un bilan complet de votre activité en PDF : chantiers, posts, avis, score.",
      },
    ],
  },
  {
    id: "personnalisation",
    label: "Personnalisation",
    features: [
      {
        icon: "🎨",
        title: "Thème de couleur",
        desc: "Choisissez parmi 6 couleurs pour personnaliser votre espace et votre page vitrine.",
      },
      {
        icon: "🌙",
        title: "Mode sombre",
        desc: "Basculez en mode sombre pour un confort de lecture optimal, surtout le soir.",
      },
      {
        icon: "🔗",
        title: "URL personnalisée",
        desc: "Choisissez l'URL de votre page vitrine publique : estime-app.com/artisan/votre-nom.",
      },
      {
        icon: "👤",
        title: "Profil enrichi",
        desc: "Photo de profil, certifications (RGE, Qualibat…), années d'expérience, SIRET, statut de disponibilité en temps réel, présentation personnalisée.",
      },
    ],
  },
  {
    id: "fidelite",
    label: "Engagement & Fidélité",
    features: [
      {
        icon: "🏆",
        title: "Programme de points",
        desc: "Gagnez des points à chaque action : chantier ajouté, post généré, avis reçu. Montez de niveau et débloquez des récompenses.",
      },
      {
        icon: "💡",
        title: "Conseils et astuces",
        desc: "Un blog d'articles pratiques classés par métier pour développer votre activité et améliorer vos techniques.",
      },
      {
        icon: "🎁",
        title: "Parrainage",
        desc: "Invitez un confrère artisan et gagnez 1 mois gratuit pour chaque filleul qui s'abonne.",
      },
    ],
  },
];

const faqJsonLd = buildFaqJsonLd(FAQ_FONCTIONNALITES);

export default function FonctionnalitesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <main style={{ background: "#F8F5F2", color: "#2B2521", minHeight: "100vh" }}>
        {/* Nav minimale */}
        <nav
          className="sticky top-0 z-50 border-b"
          style={{ background: "rgba(248,245,242,0.92)", backdropFilter: "blur(12px)", borderColor: "rgba(43,37,33,0.08)" }}
        >
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-landing-display text-lg font-semibold" style={{ color: "#2B2521" }}>
              Estime
            </Link>
            <Link
              href="/inscription"
              className="px-4 py-2 rounded-lg text-sm font-medium font-landing-sans text-white transition-colors duration-200"
              style={{ background: "#C75D3B" }}
            >
              Commencer gratuitement
            </Link>
          </div>
        </nav>

        {/* Header */}
        <header className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <h1
            className="font-landing-display text-4xl lg:text-5xl font-semibold leading-tight mb-4"
            style={{ color: "#2B2521" }}
          >
            Tout ce qu&apos;Estime fait pour vous
          </h1>
          <p className="font-landing-sans text-lg leading-relaxed mb-8" style={{ color: "rgba(43,37,33,0.55)" }}>
            Un outil complet pour développer votre réputation, gérer vos clients et gagner du temps.
          </p>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-landing-sans font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: "#C75D3B" }}
          >
            Commencer 14 jours gratuits
          </Link>
        </header>

        {/* Sections */}
        <div className="max-w-5xl mx-auto px-6 pb-24 space-y-16">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id}>
              <div className="flex items-center gap-4 mb-8">
                <h2
                  className="font-landing-display text-2xl font-semibold shrink-0"
                  style={{ color: "#2B2521" }}
                >
                  {section.label}
                </h2>
                <div className="flex-1 h-px" style={{ background: "rgba(43,37,33,0.1)" }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.features.map((f) => (
                  <div
                    key={f.title}
                    className="rounded-2xl p-6 border transition-all duration-200 hover:shadow-sm"
                    style={{
                      background: "#FFFFFF",
                      borderColor: "rgba(43,37,33,0.07)",
                    }}
                  >
                    <div className="text-3xl mb-3" aria-hidden="true">{f.icon}</div>
                    <h3
                      className="font-landing-display text-base font-semibold mb-1.5 leading-snug"
                      style={{ color: "#2B2521" }}
                    >
                      {f.title}
                    </h3>
                    <p className="font-landing-sans text-sm leading-relaxed" style={{ color: "rgba(43,37,33,0.55)" }}>
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ background: "#2B2521" }} className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <FaqAccordionDark items={FAQ_FONCTIONNALITES} title="Questions fréquentes sur les fonctionnalités" />
          </div>
        </div>

        {/* CTA final */}
        <div className="border-t" style={{ borderColor: "rgba(43,37,33,0.08)", background: "#F8F5F2" }}>
          <div className="max-w-2xl mx-auto px-6 py-16 text-center">
            <h2 className="font-landing-display text-3xl font-semibold mb-3" style={{ color: "#2B2521" }}>
              Prêt à booster votre réputation ?
            </h2>
            <p className="font-landing-sans mb-8" style={{ color: "rgba(43,37,33,0.55)" }}>
              14 jours d&apos;essai gratuit, sans carte bancaire.
            </p>
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-landing-sans font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#C75D3B" }}
            >
              Commencer gratuitement →
            </Link>
          </div>
        </div>

        {/* CTA sticky mobile */}
        <div
          className="sm:hidden fixed bottom-0 inset-x-0 z-50 p-4 border-t"
          style={{ background: "rgba(248,245,242,0.95)", backdropFilter: "blur(12px)", borderColor: "rgba(43,37,33,0.1)" }}
        >
          <Link
            href="/inscription"
            className="block w-full text-center py-3.5 rounded-xl font-landing-sans font-semibold text-white"
            style={{ background: "#C75D3B" }}
          >
            Commencer gratuitement
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
