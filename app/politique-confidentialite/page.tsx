import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Politique de confidentialité - Estime",
  description: "Politique de confidentialité et de protection des données du service Estime.",
};

const SECTIONS = [
  {
    title: "Responsable du traitement",
    body: `Le responsable du traitement des données personnelles collectées sur Estime est Alexandre Lenique, micro-entrepreneur.`,
  },
  {
    title: "Données collectées",
    body: `Dans le cadre de l'utilisation du service, nous collectons :\n\n- des données d'identification : email, nom, prénom ;\n- des données professionnelles : métier, ville, informations de profil ;\n- des contenus liés à votre activité : photos de chantier, informations clients que vous renseignez ;\n- des données de facturation, dans le cadre de la gestion de votre abonnement.`,
  },
  {
    title: "Finalités du traitement",
    body: `Ces données sont collectées et traitées afin de :\n\n- créer et gérer votre compte utilisateur ;\n- fournir le service (génération de posts, envoi d'emails de demande d'avis, calcul du score de réputation) ;\n- gérer la facturation et le suivi de votre abonnement ;\n- assurer le support client et répondre à vos demandes.`,
  },
  {
    title: "Base légale",
    body: `Le traitement de vos données repose sur l'exécution du contrat qui vous lie à Estime (fourniture du service souscrit) ainsi que, le cas échéant, sur votre consentement (par exemple pour l'envoi de communications optionnelles) et sur le respect d'obligations légales (facturation, comptabilité).`,
  },
  {
    title: "Durée de conservation",
    body: `Vos données sont conservées pendant toute la durée de votre relation contractuelle avec Estime, puis archivées pendant les durées requises par la loi (notamment les durées légales de conservation des documents comptables), avant d'être supprimées ou anonymisées.`,
  },
  {
    title: "Droits des utilisateurs",
    body: `Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données, ainsi que d'un droit d'opposition et de limitation du traitement.\n\nPour exercer ces droits, vous pouvez nous contacter à l'adresse indiquée ci-dessous.`,
  },
  {
    title: "Sous-traitants",
    body: `Pour fournir le service, Estime fait appel aux sous-traitants suivants, chacun traitant vos données dans le cadre strict de sa mission :\n\n- Supabase : hébergement de la base de données ;\n- Resend : envoi des emails (notamment les demandes d'avis) ;\n- Stripe : traitement des paiements et de la facturation ;\n- Anthropic : génération assistée par intelligence artificielle des contenus ;\n- Netlify : hébergement du site et de l'application.\n\nCes prestataires sont soumis à des obligations contractuelles de confidentialité et de sécurité des données.`,
  },
  {
    title: "Contact",
    body: `Pour toute question relative à vos données personnelles ou pour exercer vos droits, vous pouvez contacter notre délégué à la protection des données à l'adresse :`,
  },
];

export default function PolitiqueConfidentialite() {
  return (
    <LegalPageShell title="Politique de confidentialité">
      {SECTIONS.map((section) => (
        <section key={section.title}>
          <h2 className="font-landing-display text-xl font-semibold text-dust mb-4">
            {section.title}
          </h2>
          <div className="space-y-3">
            {section.body.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="font-landing-sans text-dust/70 text-base leading-relaxed whitespace-pre-line"
              >
                {paragraph}
              </p>
            ))}
            {section.title === "Contact" && (
              <a
                href="mailto:spark@alcalspark.com"
                className="font-landing-sans text-ambre hover:underline text-base"
              >
                spark@alcalspark.com
              </a>
            )}
          </div>
        </section>
      ))}
    </LegalPageShell>
  );
}
