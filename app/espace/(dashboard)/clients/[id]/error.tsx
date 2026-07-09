"use client";

import { useEffect } from "react";

export default function FicheClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[fiche-client][error-boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-red-600 font-bold text-lg mb-4">
          DEBUG — Erreur brute page détail client
        </h1>

        <button
          type="button"
          onClick={() => reset()}
          className="mb-6 px-4 py-2 border border-red-300 text-red-600 rounded"
        >
          Réessayer
        </button>

        <div className="mb-4">
          <p className="text-red-600 font-semibold">Message :</p>
          <pre className="text-red-600 whitespace-pre-wrap break-words text-sm">
            {error?.message ?? String(error)}
          </pre>
        </div>

        {error?.digest && (
          <div className="mb-4">
            <p className="text-red-600 font-semibold">Digest :</p>
            <pre className="text-red-600 whitespace-pre-wrap break-words text-sm">
              {error.digest}
            </pre>
          </div>
        )}

        <div className="mb-4">
          <p className="text-red-600 font-semibold">Stack trace :</p>
          <pre className="text-red-600 whitespace-pre-wrap break-words text-xs">
            {error?.stack ?? "Aucune stack trace disponible."}
          </pre>
        </div>
      </div>
    </div>
  );
}
