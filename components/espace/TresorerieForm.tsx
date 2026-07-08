"use client";

import { useTransition, useRef, useState } from "react";
import { saveTresorerie } from "@/app/actions/profil-financier";

export function TresorerieForm({
  tresorerieActuelle,
  tresorerieMajLe,
}: {
  tresorerieActuelle: number | null;
  tresorerieMajLe: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveTresorerie(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  const majLabel = tresorerieMajLe
    ? new Date(tresorerieMajLe).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap">
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs text-dusk/50 mb-1.5">Trésorerie actuelle (€)</label>
        <div className="relative">
          <input
            type="number"
            name="tresorerie_actuelle"
            defaultValue={tresorerieActuelle ?? ""}
            placeholder="0"
            step="1"
            className="w-full px-4 py-2.5 border border-dusk/15 rounded-xl text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30 bg-white pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dusk/40 text-sm">€</span>
        </div>
        {majLabel && (
          <p className="text-xs text-dusk/35 mt-1">Mis à jour le {majLabel}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 bg-braise text-white text-sm font-semibold rounded-full hover:bg-ambre transition-colors disabled:opacity-50"
      >
        {isPending ? "Enregistrement…" : "Enregistrer"}
      </button>
      {success && <p className="text-xs text-green-600 self-end pb-2.5">Sauvegardé</p>}
      {error && <p className="text-xs text-red-500 self-end pb-2.5">{error}</p>}
    </form>
  );
}
