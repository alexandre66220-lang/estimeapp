import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "CGU — Estime",
  description: "Conditions générales d'utilisation du service Estime.",
};

const ARTICLES = [
  {
    title: "1. Objet du service",
    body: `Estime est un service en ligne (SaaS) destiné aux artisans du bâtiment, édité par AlcalSpark, micro-entrepreneur. Il permet notamment :\n\n- la génération automatisée de posts pour les réseaux sociaux à partir de photos de chantier ;\n- l'envoi automatique d'emails de demande d'avis Google aux clients ;\n- le suivi d'un score de réputation en ligne basé sur l'activité de l'utilisateur.\n\nLes présentes conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation du service par tout utilisateur inscrit, ci-après "l'utilisateur".`,
  },
  {
    title: "2. Conditions d'accès et d'inscription",
    body: `L'accès au service nécessite la création d'un compte, en renseignant une adresse email valide et les informations professionnelles demandées. L'utilisateur doit être majeur et disposer de la capacité juridique pour s'engager.\n\nL'utilisateur s'engage à fournir des informations exactes et à les maintenir à jour. Il est seul responsable de la confidentialité de ses identifiants de connexion.`,
  },
  {
    title: "3. Abonnement et tarification",
    body: `L'inscription ouvre droit à une période d'essai gratuite de 14 jours, sans carte bancaire requise et sans engagement. À l'issue de cette période, l'accès au service est soumis à un abonnement mensuel de 24,99 € TTC, sauf résiliation préalable.\n\nL'abonnement est sans engagement de durée et se renouvelle automatiquement chaque mois par tacite reconduction. Le tarif peut évoluer ; les utilisateurs en seront informés par email au moins 30 jours avant toute modification.`,
  },
  {
    title: "4. Obligations de l'utilisateur",
    body: `L'utilisateur s'engage à utiliser le service conformément à sa destination et à la réglementation en vigueur. Il s'engage notamment à :\n\n- ne publier que des photos et contenus dont il détient les droits ;\n- ne pas utiliser le service à des fins frauduleuses, diffamatoires ou contraires à l'ordre public ;\n- respecter les conditions d'utilisation des plateformes tierces (Instagram, Google, etc.) sur lesquelles les contenus générés sont publiés.`,
  },
  {
    title: "5. Propriété intellectuelle",
    body: `L'ensemble des éléments du service Estime (textes, structure, logo, code, design) est la propriété exclusive d'AlcalSpark, sauf mention contraire. Toute reproduction ou exploitation non autorisée est interdite.\n\nL'utilisateur conserve la propriété des photos et contenus qu'il importe. Il accorde à Estime une licence limitée à la seule fourniture du service (génération et envoi des contenus), sans cession de droits.`,
  },
  {
    title: "6. Limitation de responsabilité",
    body: `Estime met en œuvre les moyens raisonnables pour assurer la disponibilité et la fiabilité du service, sans garantie de résultat. L'éditeur ne saurait être tenu responsable des contenus générés par l'intelligence artificielle et publiés par l'utilisateur, ce dernier restant seul responsable de leur diffusion.\n\nLa responsabilité de l'éditeur ne peut être engagée en cas de force majeure, de panne d'un prestataire tiers (hébergement, messagerie, paiement) ou d'indisponibilité d'une plateforme externe (réseau social, Google).`,
  },
  {
    title: "7. Résiliation",
    body: `L'utilisateur peut résilier son abonnement à tout moment, en un clic depuis son espace client, sans frais ni justification. La résiliation prend effet à la fin de la période mensuelle en cours ; aucun remboursement au prorata n'est effectué.\n\nL'éditeur se réserve le droit de suspendre ou résilier l'accès d'un utilisateur en cas de manquement grave aux présentes CGU, après mise en demeure restée sans effet lorsque la situation le permet.`,
  },
  {
    title: "8. Droit applicable et juridiction compétente",
    body: `Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut d'accord, le tribunal compétent sera celui de Castres.`,
  },
];

export default function CGU() {
  return (
    <LegalPageShell title="Conditions Générales d'Utilisation">
      {ARTICLES.map((article) => (
        <section key={article.title}>
          <h2 className="font-landing-display text-xl font-semibold text-dust mb-4">
            {article.title}
          </h2>
          <div className="space-y-3">
            {article.body.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="font-landing-sans text-dust/70 text-base leading-relaxed whitespace-pre-line"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}
    </LegalPageShell>
  );
}
