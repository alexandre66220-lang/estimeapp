"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft, WarningCircle } from "@phosphor-icons/react/dist/ssr";

export default function FicheClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[fiche-client]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8F5F2] px-6 py-10 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]">
          <WarningCircle size={28} weight="bold" className="text-[#DC2626]" />
        </div>
        <h1 className="text-lg font-bold text-[#2C2C2C] mb-2">
          Impossible d&apos;afficher cette fiche client
        </h1>
        <p className="text-sm text-[#7A6E6A] mb-6">
          Une erreur inattendue est survenue. Réessayez ou revenez à la liste de vos clients.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-full bg-[#C75D3B] text-white text-sm font-semibold hover:bg-[#B04F30] transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/espace/clients"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#E8E0D8] text-[#2C2C2C] text-sm font-semibold hover:bg-white transition-colors"
          >
            <ArrowLeft size={16} weight="bold" />
            Retour aux clients
          </Link>
        </div>
      </div>
    </div>
  );
}
