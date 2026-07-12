import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "À propos d'Estime, l'app de réputation pour les artisans BTP",
  description:
    "Découvrez l'histoire d'Estime, le SaaS créé pour aider les artisans du BTP à développer leur réputation en ligne automatiquement, sans compétences techniques.",
  alternates: { canonical: "https://estime-app.com/a-propos" },
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Estime",
  url: "https://estime-app.com",
  logo: "https://estime-app.com/og-image.png",
  description:
    "SaaS B2B pour les artisans du BTP : génération de posts Instagram et demandes d'avis Google automatiques",
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@alcalspark.com",
    contactType: "customer support",
  },
  founder: {
    "@type": "Person",
    name: "Alexandre",
    jobTitle: "Fondateur",
    worksFor: {
      "@type": "Organization",
      name: "AlcalSpark",
      url: "https://alcalspark.com",
    },
  },
  offers: {
    "@type": "Offer",
    price: "24.99",
    priceCurrency: "EUR",
    description: "Abonnement mensuel Estime",
  },
};

const METIERS = [
  {
    metier: "Peintres",
    probleme:
      "Leurs réalisations sont visuellement impressionnantes mais restent invisibles en ligne. Faute de temps pour gérer Instagram et Google, ils perdent des prospects face à des concurrents moins qualifiés.",
  },
  {
    metier: "Plombiers",
    probleme:
      "Souvent débordés par les urgences, ils n'ont pas le temps de demander des avis clients ni de documenter leur travail pour les réseaux sociaux.",
  },
  {
    metier: "Électriciens",
    probleme:
      "Métier technique avec peu de visuel attrayant : Estime aide à valoriser les installations et à collecter les avis qui rassurent les clients.",
  },
  {
    metier: "Maçons",
    probleme:
      "Des chantiers spectaculaires avant/après, mais sans outil simple pour les partager et transformer chaque client en ambassadeur.",
  },
  {
    metier: "Carreleurs",
    probleme:
      "Des réalisations esthétiques qui méritent d'être vues, mais une présence digitale quasi nulle faute d'outils adaptés.",
  },
  {
    metier: "Couvreurs",
    probleme:
      "Travaux souvent peu visibles du grand public, mais une réputation locale essentielle : les avis Google sont leur meilleur vecteur de croissance.",
  },
  {
    metier: "Menuisiers",
    probleme:
      "Un savoir-faire artisanal unique qui mérite une vitrine digitale à la hauteur, sans passer des heures sur les réseaux sociaux.",
  },
];

export default function APropos() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <div className="min-h-screen bg-dust">
        <nav className="bg-noir border-b border-white/8">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="font-landing-display text-xl font-semibold text-dust tracking-tight hover:text-dust/80 transition-colors duration-200"
            >
              Estime
            </Link>
            <Link
              href="/inscription"
              className="text-sm font-semibold text-white bg-braise px-4 py-2 rounded-full hover:bg-ambre transition-colors duration-200"
            >
              Essai gratuit
            </Link>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-dusk mb-4">
            À propos d&apos;Estime
          </h1>
          <p className="text-dusk/60 text-lg mb-16 max-w-[60ch]">
            Le SaaS de réputation conçu pour les artisans du BTP français.
          </p>

          {/* Notre mission */}
          <section className="mb-14">
            <h2 className="font-display text-2xl font-bold text-dusk mb-4">
              Notre mission
            </h2>
            <div className="prose prose-lg max-w-none text-dusk/75 leading-relaxed space-y-4">
              <p>
                Estime a été créé pour résoudre un problème concret : les artisans du BTP français
                sont souvent excellents dans leur métier mais invisibles en ligne. Pas d&apos;avis
                Google, pas de présence sur Instagram, pas de page web. Résultat : ils perdent des
                clients face à des concurrents moins qualifiés mais mieux référencés.
              </p>
              <p>
                Notre conviction est simple : un artisan qui fait du bon travail mérite d&apos;être
                reconnu. Estime automatise tout ce qui est chronophage et technique pour qu&apos;ils
                puissent se concentrer sur leur cœur de métier, tout en construisant une réputation
                digitale solide.
              </p>
            </div>
          </section>

          {/* Comment ça marche */}
          <section className="mb-14">
            <h2 className="font-display text-2xl font-bold text-dusk mb-6">
              Comment ça marche
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Photo du chantier",
                  desc: "L'artisan prend une photo avant et/ou après son chantier directement depuis l'app Estime, en quelques secondes.",
                },
                {
                  step: "2",
                  title: "L'IA génère le post",
                  desc: "L'API Anthropic (Claude) analyse la photo, identifie le métier et la ville, et génère un post Instagram personnalisé avec hashtags adaptés.",
                },
                {
                  step: "3",
                  title: "Demande d'avis automatique",
                  desc: "Un email est envoyé automatiquement au client avec un lien direct vers la fiche Google de l'artisan pour déposer son avis.",
                },
              ].map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="rounded-2xl p-6"
                  style={{ background: "#ffffff", border: "1px solid rgba(43,37,33,0.08)" }}
                >
                  <div className="w-8 h-8 rounded-full bg-braise/10 flex items-center justify-center mb-4">
                    <span className="text-sm font-bold text-braise">{step}</span>
                  </div>
                  <h3 className="font-semibold text-dusk mb-2">{title}</h3>
                  <p className="text-dusk/60 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pour qui */}
          <section className="mb-14">
            <h2 className="font-display text-2xl font-bold text-dusk mb-6">
              Pour qui
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {METIERS.map(({ metier, probleme }) => (
                <div
                  key={metier}
                  className="rounded-xl p-5"
                  style={{ background: "#ffffff", border: "1px solid rgba(43,37,33,0.08)" }}
                >
                  <h3 className="font-semibold text-dusk mb-2">{metier}</h3>
                  <p className="text-dusk/60 text-sm leading-relaxed">{probleme}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Le fondateur */}
          <section className="mb-14">
            <h2 className="font-display text-2xl font-bold text-dusk mb-4">
              Le fondateur
            </h2>
            <div
              className="rounded-2xl p-7"
              style={{ background: "#ffffff", border: "1px solid rgba(43,37,33,0.08)" }}
            >
              <p className="text-dusk/75 leading-relaxed mb-4">
                <strong className="text-dusk">Alexandre</strong> est le fondateur d&apos;
                <a
                  href="https://alcalspark.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-braise hover:underline"
                >
                  AlcalSpark
                </a>
                , agence web premium spécialisée dans la création d&apos;applications web et mobiles
                sur mesure.
              </p>
              <p className="text-dusk/75 leading-relaxed mb-4">
                Il a créé Estime en observant au quotidien les difficultés des artisans à développer
                leur présence en ligne. Excellents dans leur métier, ils manquent souvent d&apos;outils
                simples et adaptés à leur réalité terrain.
              </p>
              <p className="text-dusk/75 leading-relaxed">
                Passionné de développement produit, il a conçu Estime pour que chaque fonctionnalité
                réponde à un vrai besoin terrain, sans complexité inutile.
              </p>
            </div>
          </section>

          {/* La technologie */}
          <section className="mb-14">
            <h2 className="font-display text-2xl font-bold text-dusk mb-6">
              La technologie
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  tech: "Next.js 16",
                  role: "Framework React full-stack avec App Router pour des performances maximales et un SEO optimal.",
                },
                {
                  tech: "Supabase",
                  role: "Base de données PostgreSQL temps réel, authentification et stockage des photos de chantier.",
                },
                {
                  tech: "Anthropic API (Claude)",
                  role: "Génération des posts Instagram personnalisés par métier, ville et ton de l'artisan.",
                },
                {
                  tech: "Stripe",
                  role: "Gestion des abonnements, paiements sécurisés et webhooks de facturation.",
                },
                {
                  tech: "Netlify",
                  role: "Déploiement continu, edge functions et CDN global pour des temps de chargement optimaux.",
                },
                {
                  tech: "Tailwind CSS",
                  role: "Système de design cohérent et responsive, optimisé pour mobile-first.",
                },
              ].map(({ tech, role }) => (
                <div
                  key={tech}
                  className="rounded-xl p-5"
                  style={{ background: "#ffffff", border: "1px solid rgba(43,37,33,0.08)" }}
                >
                  <h3 className="font-semibold text-dusk mb-1">{tech}</h3>
                  <p className="text-dusk/60 text-sm leading-relaxed">{role}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Nos valeurs */}
          <section className="mb-14">
            <h2 className="font-display text-2xl font-bold text-dusk mb-6">
              Nos valeurs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  valeur: "Simplicité",
                  desc: "Chaque fonctionnalité doit pouvoir être utilisée par un artisan sur chantier, avec les mains sales, en moins de 30 secondes.",
                },
                {
                  valeur: "Authenticité",
                  desc: "Pas de contenu générique. Chaque post généré est personnalisé selon le métier, la ville et le ton de l'artisan.",
                },
                {
                  valeur: "Efficacité",
                  desc: "Pas de fausse promesse. Estime mesure son impact en avis Google obtenus et en posts publiés, pas en fonctionnalités listées.",
                },
              ].map(({ valeur, desc }) => (
                <div
                  key={valeur}
                  className="rounded-2xl p-6"
                  style={{ background: "#ffffff", border: "1px solid rgba(43,37,33,0.08)" }}
                >
                  <h3 className="font-semibold text-dusk mb-2">{valeur}</h3>
                  <p className="text-dusk/60 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section
            className="rounded-2xl p-8 text-center"
            style={{ background: "#1A1410" }}
          >
            <h2 className="font-display text-2xl font-bold text-dust mb-3">
              Prêt à développer votre réputation ?
            </h2>
            <p className="text-dust/60 mb-6">
              14 jours gratuits, sans carte bancaire, sans engagement.
            </p>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center bg-braise text-white font-semibold px-7 py-3.5 rounded-full hover:bg-ambre transition-colors duration-200"
            >
              Essayer gratuitement
            </Link>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
