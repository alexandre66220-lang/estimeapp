import type { Metadata } from "next";
import { CreditCard } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Abonnement - Estime",
};

export default function Abonnement() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Abonnement</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Votre formule et vos informations de facturation.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-dusk/8 py-20 px-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-ambre/10 rounded-full flex items-center justify-center mb-5">
          <CreditCard size={26} className="text-ambre" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl font-bold text-dusk mb-2">
          Bientôt disponible
        </h2>
        <p className="text-dusk/50 text-sm max-w-[40ch]">
          La gestion de votre abonnement et de vos moyens de paiement arrive
          prochainement.
        </p>
      </div>
    </div>
  );
}
