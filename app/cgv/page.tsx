import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Conditions générales de vente - Estime",
  description: "Conditions générales de vente de l'abonnement Estime à 24,99€/mois.",
};

const ARTICLES = [
  {
    title: "Article 1 - Objet",
    body: `Les présentes conditions générales de vente (CGV) régissent l'accès et l'utilisation du service Estime, édité par AlcalSpark (micro-entrepreneur, SIRET : [SIRET à compléter]), ci-après "l'éditeur".\n\nEstime est un outil en ligne destiné aux artisans du BTP, permettant la génération automatisée de contenus pour les réseaux sociaux et l'envoi de demandes d'avis Google.`,
  },
  {
    title: "Article 2 - Phase de pré-lancement",
    body: `À la date des présentes, Estime n'est pas encore commercialisé. La souscription à la liste d'attente est gratuite et sans engagement. Aucun prélèvement n'est effectué lors de l'inscription.\n\nLes personnes inscrites sur la liste d'attente seront informées par email de la date d'ouverture du service et des conditions tarifaires définitives.`,
  },
  {
    title: "Article 3 - Prix",
    body: `Le tarif de l'abonnement Estime est de 24,99 € par mois.\n\nEn tant que micro-entrepreneur, AlcalSpark est non assujetti à la TVA en vertu de l'article 293 B du Code Général des Impôts.\n\nCe tarif est susceptible d'évoluer. Les abonnés seront prévenus par email au moins 30 jours avant toute modification tarifaire.`,
  },
  {
    title: "Article 4 - Durée et renouvellement",
    body: `L'abonnement est souscrit sans engagement de durée minimale. Il est renouvelé automatiquement chaque mois, à la date anniversaire de la souscription, par tacite reconduction.`,
  },
  {
    title: "Article 5 - Résiliation",
    body: `L'abonné peut résilier son abonnement à tout moment, en un clic depuis son espace client, sans frais ni justification requise. La résiliation prend effet à la fin de la période mensuelle en cours. Aucun remboursement prorata temporis n'est effectué.`,
  },
  {
    title: "Article 6 - Obligations de l'éditeur",
    body: `AlcalSpark s'engage à fournir le service avec le soin et la compétence habituels, et à informer les utilisateurs de toute interruption planifiée dans un délai raisonnable. En cas de défaillance technique prolongée, l'éditeur s'efforcera d'en minimiser l'impact sur les utilisateurs.`,
  },
  {
    title: "Article 7 - Responsabilité",
    body: `AlcalSpark ne saurait être tenu responsable des contenus générés par l'IA et publiés par l'utilisateur sur ses réseaux sociaux. L'utilisateur demeure seul responsable de l'utilisation des contenus produits via le service.\n\nLa responsabilité de l'éditeur ne peut être engagée en cas de force majeure, de défaillance d'un hébergeur tiers ou d'une plateforme de réseau social externe.`,
  },
  {
    title: "Article 8 - Données personnelles",
    body: `Les données collectées dans le cadre de l'utilisation du service sont traitées conformément au Règlement Général sur la Protection des Données (RGPD). Pour toute demande relative à vos données, contactez-nous à contact@alcalspark.com.`,
  },
  {
    title: "Article 9 - Droit applicable et médiation",
    body: `Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité.\n\nConformément à l'article L612-1 du Code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation en cas de litige non résolu.\n\nContact : contact@alcalspark.com`,
  },
];

export default function CGV() {
  return (
    <PageShell
      title="Conditions générales de vente"
      subtitle="Version 1.0 - applicable à compter du lancement commercial d'Estime."
    >
      <div className="space-y-10 text-charbon">
        {ARTICLES.map((article) => (
          <section key={article.title}>
            <h2 className="font-display text-lg font-bold text-charbon mb-3 pb-2 border-b border-charbon/10">
              {article.title}
            </h2>
            <div className="space-y-3">
              {article.body.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-sm text-charbon/70 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <div className="bg-terracotta/8 rounded-xl p-6 border border-terracotta/15">
          <p className="text-sm text-charbon/70 leading-relaxed">
            Pour toute question relative à ces conditions, contactez-nous :{" "}
            <a href="mailto:contact@alcalspark.com" className="text-terracotta hover:underline font-medium">
              contact@alcalspark.com
            </a>
          </p>
        </div>

        <p className="text-xs text-charbon/35 pt-4 border-t border-charbon/10">
          Dernière mise à jour : juin 2026
        </p>
      </div>
    </PageShell>
  );
}
