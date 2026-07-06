"use client";

import { useState, useTransition } from "react";
import { SignOut, ShieldCheck } from "@phosphor-icons/react";
import { logoutAllDevices } from "@/app/actions/auth";

export function SecuritySection({ sessionExpiry }: { sessionExpiry: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleLogoutAll() {
    startTransition(async () => {
      const result = await logoutAllDevices();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck size={18} className="text-dusk/50" aria-hidden="true" />
        <h2 className="font-display text-lg font-bold text-dusk">Sécurité</h2>
      </div>
      <p className="text-dusk/50 text-sm mb-5">Gérez votre session et vos appareils connectés.</p>

      {sessionExpiry && (
        <div className="flex items-center gap-2 text-sm text-dusk/60 mb-5 px-3 py-2.5 rounded-xl bg-dust/60 border border-dusk/8">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          Session active jusqu&apos;au{" "}
          <strong className="text-dusk">{sessionExpiry}</strong>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mb-3">{error}</p>
      )}

      <form action={handleLogoutAll}>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-dusk/15 text-sm font-medium text-dusk/70 hover:bg-dust/60 hover:border-dusk/25 transition-colors disabled:opacity-50"
        >
          <SignOut size={16} aria-hidden="true" />
          {isPending ? "Déconnexion…" : "Se déconnecter de tous les appareils"}
        </button>
      </form>
    </div>
  );
}
