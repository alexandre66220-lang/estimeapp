import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { AnimateIn } from "./AnimateIn";

const FEATURES = [
  "Posts réseaux sociaux illimités",
  "Relances automatiques par email",
  "Lien direct vers votre fiche Google",
  "Historique de tous vos chantiers",
  "Support humain par chat et téléphone",
  "Sans engagement, résiliation en un clic",
];

export default function Pricing() {
  return (
    <section className="bg-dust-dark py-24 lg:py-32" id="tarif">
      <div className="max-w-6xl mx-auto px-6">

        <AnimateIn>
          <div className="mb-14">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-dusk leading-tight mb-4">
              Un tarif. Zéro surprise.
            </h2>
            <p className="text-dusk/55 text-lg max-w-[42ch]">
              Pas de formules alambiquées. Une seule offre, tout inclus.
            </p>
          </div>
        </AnimateIn>

        <AnimateIn delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">

            {/* Carte principale */}
            <div className="bg-dusk rounded-2xl p-8 lg:p-10 flex flex-col">
              <div className="flex items-end gap-2 mb-2">
                <span className="font-display text-5xl lg:text-6xl font-bold text-dust leading-none">
                  24,99<span className="text-3xl">€</span>
                </span>
                <span className="text-dust/45 text-base mb-1">/mois</span>
              </div>
              <p className="text-dust/40 text-sm mb-8">TVA non applicable - article 293 B du CGI</p>

              <ul className="space-y-3 flex-1" role="list">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle
                      weight="fill"
                      size={18}
                      className="text-ambre shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="text-dust/75 text-sm leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#liste-attente"
                className="mt-8 inline-flex items-center justify-center bg-braise text-white font-semibold text-[1.0625rem] px-7 py-4 rounded-full hover:bg-ambre active:scale-[0.98] transition-all duration-200 text-center"
              >
                Rejoindre la liste d'attente
              </a>
            </div>

            {/* Encart valeur */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl p-8 border border-dusk/8 flex-1">
                <p className="font-display text-3xl font-bold text-dusk mb-2 leading-tight">
                  Moins qu'un repas au restaurant. Chaque mois.
                </p>
                <p className="text-dusk/55 text-sm leading-relaxed">
                  Un artisan qui gagne un client supplémentaire grâce à un avis Google rentabilise son abonnement des dizaines de fois.
                </p>
              </div>

              <div className="bg-ambre/10 rounded-2xl p-6 border border-ambre/20">
                <p className="text-dusk font-semibold text-sm mb-1">
                  Accès anticipé
                </p>
                <p className="text-dusk/65 text-sm leading-relaxed">
                  Les artisans qui rejoignent la liste d'attente bénéficieront d'un tarif préférentiel à l'ouverture.
                </p>
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
