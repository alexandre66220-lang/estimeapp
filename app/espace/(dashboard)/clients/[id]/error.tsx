"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, WarningCircle } from "@phosphor-icons/react";
import { devError } from "@/lib/log";

export default function FicheClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    devError("Erreur de chargement dans /espace/clients/[id]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dust px-6">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-dusk/8 p-8 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <WarningCircle size={26} className="text-red-500" aria-hidden="true" />
        </div>
        <h2 className="font-display text-lg font-bold text-dusk mb-2">
          Impossible d&apos;afficher cette fiche client
        </h2>
        <p className="text-dusk/50 text-sm mb-6">
          Une erreur inattendue est survenue en chargeant les informations de ce client.
          Tu peux réessayer ou revenir à la liste de tes clients.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.98] transition-all duration-200"
          >
            Réessayer
          </button>
          <Link
            href="/espace/clients"
            className="inline-flex items-center justify-center gap-1.5 text-dusk/60 font-medium text-sm px-6 py-3 rounded-full border border-dusk/15 hover:bg-dusk/5 transition-all duration-200"
          >
            <ArrowLeft size={16} weight="bold" aria-hidden="true" />
            Retour à mes clients
          </Link>
        </div>
      </div>
    </div>
  );
}
