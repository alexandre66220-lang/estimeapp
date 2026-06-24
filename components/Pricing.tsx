import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { AnimateIn } from "./AnimateIn";

const FEATURES = [
  "Posts Instagram illimités",
  "Emails de demande d'avis illimités",
  "Score de réputation",
  "Badge de confiance",
  "Carnet d'adresses clients",
  "Support par email",
];

export default function Pricing() {
  return (
    <section className="bg-noir py-24 lg:py-32" id="tarif">
      <div className="max-w-xl mx-auto px-6 text-center">
        <AnimateIn>
          <h2 className="font-landing-display text-4xl lg:text-5xl font-semibold text-dust leading-tight mb-14">
            Un seul tarif, tout inclus
          </h2>
        </AnimateIn>

        <AnimateIn delay={0.1}>
          <div className="bg-dusk rounded-2xl p-8 lg:p-10 text-left">
            <div className="flex items-end gap-2 mb-2 justify-center">
              <span className="font-landing-display text-5xl lg:text-6xl font-semibold text-dust leading-none">
                24,99<span className="text-3xl">€</span>
              </span>
              <span className="text-dust/45 text-base mb-1">/mois</span>
            </div>
            <p className="text-dust/45 text-sm mb-8 text-center">
              14 jours gratuits, sans carte bancaire
            </p>

            <ul className="space-y-3" role="list">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle
                    weight="fill"
                    size={18}
                    className="text-ambre shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="font-landing-sans text-dust/75 text-sm leading-snug">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="/inscription"
              className="mt-8 w-full inline-flex items-center justify-center bg-braise text-white font-semibold text-[1.0625rem] px-7 py-4 rounded-full hover:bg-ambre active:scale-[0.98] transition-all duration-200 text-center"
            >
              Commencer gratuitement
            </a>
            <p className="text-dust/40 text-sm text-center mt-4">
              Sans engagement. Résiliez quand vous voulez.
            </p>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
