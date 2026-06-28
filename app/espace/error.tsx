"use client";

import { useEffect } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { devError } from "@/lib/log";

export default function EspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    devError("Erreur de chargement dans /espace", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dust px-6">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-dusk/8 p-8 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <WarningCircle size={26} className="text-red-500" aria-hidden="true" />
        </div>
        <h2 className="font-display text-lg font-bold text-dusk mb-2">
          Un problème est survenu
        </h2>
        <p className="text-dusk/50 text-sm mb-6">
          Le chargement de cette page a échoué. Cela peut venir d&apos;une
          connexion instable, réessayez.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center bg-dusk text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-dusk/90 active:scale-[0.98] transition-all duration-200"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
