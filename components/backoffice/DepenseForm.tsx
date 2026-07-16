"use client";

import { useState, useTransition } from "react";
import { creerDepense } from "@/app/actions/backoffice-depenses";

export function DepenseForm({ onDone }: { onDone?: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await creerDepense(formData);
          onDone?.();
        });
      }}
      className="grid sm:grid-cols-4 gap-2 items-end"
    >
      <div>
        <label className="block text-[11px] text-[#55555A] mb-1">Catégorie</label>
        <input
          type="text"
          name="categorie"
          required
          placeholder="Logiciel, matériel…"
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
        />
      </div>
      <div>
        <label className="block text-[11px] text-[#55555A] mb-1">Montant (€)</label>
        <input
          type="number"
          name="montant"
          step="0.01"
          required
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
        />
      </div>
      <div>
        <label className="block text-[11px] text-[#55555A] mb-1">Date</label>
        <input
          type="date"
          name="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50 h-fit"
      >
        {isPending ? "…" : "Ajouter"}
      </button>
    </form>
  );
}
