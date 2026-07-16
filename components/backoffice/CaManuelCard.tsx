"use client";

import { useState, useTransition } from "react";
import { upsertCaManuel } from "@/app/actions/backoffice";

export function CaManuelCard({ montantActuel }: { montantActuel: number | null }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const mois = new Date().toISOString().slice(0, 7);

  if (editing) {
    return (
      <form
        action={(formData) => {
          startTransition(async () => {
            await upsertCaManuel(formData);
            setEditing(false);
          });
        }}
        className="bg-[#18181B] border border-[#232326] rounded-[10px] p-5"
      >
        <input type="hidden" name="mois" value={mois} />
        <p className="text-xs font-medium text-[#8B8B8D] uppercase tracking-wide mb-2">CA du mois</p>
        <input
          type="number"
          name="montant"
          step="0.01"
          min="0"
          defaultValue={montantActuel ?? ""}
          placeholder="0"
          autoFocus
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-lg font-semibold text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
        />
        <div className="flex gap-2 mt-3">
          <button
            type="submit"
            disabled={isPending}
            className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50"
          >
            {isPending ? "…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs font-medium text-[#8B8B8D] px-3 py-1.5 rounded-md hover:bg-[#232326] transition-colors duration-150"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-[#18181B] border border-[#232326] rounded-[10px] p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-[#8B8B8D] uppercase tracking-wide">CA du mois</p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-[#55555A] hover:text-[#EDEDED] transition-colors duration-150"
        >
          Modifier
        </button>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[#EDEDED]">
        {montantActuel != null
          ? `${montantActuel.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`
          : "—"}
      </p>
      <p className="mt-1 text-xs text-[#55555A]">
        {montantActuel != null ? "Saisi manuellement" : "Pas encore saisi ce mois-ci"}
      </p>
    </div>
  );
}
