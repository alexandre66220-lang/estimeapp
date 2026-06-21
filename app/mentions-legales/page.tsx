import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Mentions légales - Estime",
  description: "Mentions légales du site Estime, édité par AlcalSpark.",
};

const SECTIONS = [
  {
    title: "1. Éditeur du site",
    content: [
      ["Raison sociale", "AlcalSpark"],
      ["Statut juridique", "Micro-entrepreneur"],
      ["Responsable de publication", "Alexandre"],
      ["Adresse", "90 avenue Georges Guynemer, 81200 Mazamet, France"],
      ["Email", "contact@alcalspark.com"],
      ["SIRET", "104 516 547 00015"],
    ],
  },
  {
    title: "2. Hébergement",
    content: [
      ["Société", "Netlify, Inc."],
      ["Adresse", "512 2nd Street, Suite 200, San Francisco, CA 94107, États-Unis"],
      ["Site", "netlify.com"],
    ],
  },
];

export default function MentionsLegales() {
  return (
    <PageShell
      title="Mentions légales"
      subtitle="Informations légales relatives au site Estime."
    >
      <div className="space-y-12 text-dusk">

        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-bold text-dusk mb-5 pb-3 border-b border-dusk/10">
              {section.title}
            </h2>
            <dl className="space-y-3">
              {(section.content as [string, string][]).map(([label, value]) => (
                <div key={label} className="grid grid-cols-[180px_1fr] gap-4">
                  <dt className="text-sm text-dusk/50 font-medium">{label}</dt>
                  <dd className="text-sm text-dusk/80">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <section>
          <h2 className="font-display text-xl font-bold text-dusk mb-5 pb-3 border-b border-dusk/10">
            3. Propriété intellectuelle
          </h2>
          <p className="text-sm text-dusk/70 leading-relaxed">
            L'ensemble du contenu du site Estime (textes, visuels, logo, structure) est la propriété exclusive
            d'AlcalSpark, sauf mention contraire. Toute reproduction, représentation ou diffusion, totale ou
            partielle, sans autorisation écrite préalable est interdite.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-dusk mb-5 pb-3 border-b border-dusk/10">
            4. Données personnelles
          </h2>
          <div className="space-y-3 text-sm text-dusk/70 leading-relaxed">
            <p>
              Dans le cadre de la liste d'attente Estime, nous collectons votre adresse email uniquement afin de
              vous informer du lancement du service. Ces données ne sont pas transmises à des tiers.
            </p>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique
              et Libertés, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
              Pour exercer ce droit, contactez-nous à{" "}
              <a
                href="mailto:contact@alcalspark.com"
                className="text-ambre hover:underline"
              >
                contact@alcalspark.com
              </a>
              .
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-dusk mb-5 pb-3 border-b border-dusk/10">
            5. Cookies
          </h2>
          <p className="text-sm text-dusk/70 leading-relaxed">
            Ce site peut utiliser des cookies techniques nécessaires à son fonctionnement. Aucun cookie de
            traçage publicitaire n'est utilisé à ce jour.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-dusk mb-5 pb-3 border-b border-dusk/10">
            6. Liens hypertextes
          </h2>
          <p className="text-sm text-dusk/70 leading-relaxed">
            AlcalSpark ne peut être tenu responsable du contenu des sites externes auxquels le site Estime
            renvoie.
          </p>
        </section>

        <p className="text-xs text-dusk/35 pt-4 border-t border-dusk/10">
          Dernière mise à jour : juin 2026
        </p>
      </div>
    </PageShell>
  );
}
