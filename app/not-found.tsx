import Link from "next/link";
import { HouseSimple, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable - Estime",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#F8F5F2" }}
    >
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-[#C75D3B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <MagnifyingGlass size={32} className="text-[#C75D3B]" aria-hidden="true" />
        </div>

        <p className="text-[#C75D3B] font-semibold text-sm tracking-wide uppercase mb-2">
          Erreur 404
        </p>
        <h1 className="font-display text-3xl font-bold text-[#2B2521] mb-3">
          Page introuvable
        </h1>
        <p className="text-[#2B2521]/55 text-base leading-relaxed mb-8">
          Cette page n&apos;existe pas ou a été déplacée. Vérifiez l&apos;adresse ou revenez au tableau de bord.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/espace/tableau-de-bord"
            className="inline-flex items-center justify-center gap-2 bg-[#C75D3B] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#D4956B] transition-colors duration-200"
          >
            <HouseSimple size={18} weight="bold" aria-hidden="true" />
            Tableau de bord
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-[#2B2521]/15 text-[#2B2521]/70 font-medium text-sm px-6 py-3 rounded-full hover:bg-[#2B2521]/5 transition-colors duration-200"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
