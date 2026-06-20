import type { Metadata } from "next";
import { GearSix } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Paramètres - Estime",
};

export default function Parametres() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charbon">Paramètres</h1>
        <p className="text-charbon/50 text-sm mt-1">
          Vos informations d&apos;entreprise et vos préférences.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-charbon/8 py-20 px-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-terracotta/10 rounded-full flex items-center justify-center mb-5">
          <GearSix size={26} className="text-terracotta" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl font-bold text-charbon mb-2">
          Bientôt disponible
        </h2>
        <p className="text-charbon/50 text-sm max-w-[40ch]">
          La gestion de votre profil, de votre entreprise et de vos notifications
          arrive prochainement.
        </p>
      </div>
    </div>
  );
}
