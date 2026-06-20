import type { Metadata } from "next";
import Link from "next/link";
import { HardHat, Plus } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Tableau de bord - Estime",
};

export default function TableauDeBord() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
      <div className="flex items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-charbon">
            Vos chantiers
          </h1>
          <p className="text-charbon/50 text-sm mt-1">
            Suivez et valorisez chaque chantier en un coup d&apos;œil.
          </p>
        </div>
        <Link
          href="/espace/nouveau-chantier"
          className="hidden sm:inline-flex items-center gap-2 bg-terracotta-dark text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-terracotta active:scale-[0.97] transition-all duration-200"
        >
          <Plus size={18} weight="bold" aria-hidden="true" />
          Nouveau chantier
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-charbon/8 py-20 px-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-terracotta/10 rounded-full flex items-center justify-center mb-5">
          <HardHat size={26} className="text-terracotta" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl font-bold text-charbon mb-2">
          Aucun chantier pour l&apos;instant
        </h2>
        <p className="text-charbon/50 text-sm max-w-[40ch] mb-7">
          Ajoutez votre premier chantier pour générer vos photos avant/après et
          vos posts réseaux en quelques secondes.
        </p>
        <Link
          href="/espace/nouveau-chantier"
          className="inline-flex items-center gap-2 bg-terracotta-dark text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-terracotta active:scale-[0.97] transition-all duration-200"
        >
          <Plus size={18} weight="bold" aria-hidden="true" />
          Nouveau chantier
        </Link>
      </div>
    </div>
  );
}
