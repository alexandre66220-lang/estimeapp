"use client";

import { useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import type { LigneDevis } from "@/lib/backoffice/devis-statut";

const LIGNE_VIDE: LigneDevis = { nom: "", description: "", prix_unitaire: 0, quantite: 1 };

export function LignesEditor({ initialLignes }: { initialLignes?: LigneDevis[] }) {
  const [lignes, setLignes] = useState<LigneDevis[]>(initialLignes?.length ? initialLignes : [{ ...LIGNE_VIDE }]);

  function updateLigne(index: number, patch: Partial<LigneDevis>) {
    setLignes((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function ajouterLigne() {
    setLignes((prev) => [...prev, { ...LIGNE_VIDE }]);
  }

  function supprimerLigne(index: number) {
    setLignes((prev) => prev.filter((_, i) => i !== index));
  }

  const totalHt = lignes.reduce((s, l) => s + l.prix_unitaire * l.quantite, 0);

  return (
    <div>
      <input type="hidden" name="lignes" value={JSON.stringify(lignes)} />

      <div className="space-y-2">
        {lignes.map((ligne, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2 bg-[#0C0C0D] border border-[#232326] rounded-md p-3">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[11px] text-[#55555A] mb-1">Prestation</label>
              <input
                type="text"
                value={ligne.nom}
                onChange={(e) => updateLigne(i, { nom: e.target.value })}
                className="w-full bg-[#18181B] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
              />
            </div>
            <div className="flex-[2] min-w-[160px]">
              <label className="block text-[11px] text-[#55555A] mb-1">Description</label>
              <input
                type="text"
                value={ligne.description}
                onChange={(e) => updateLigne(i, { description: e.target.value })}
                className="w-full bg-[#18181B] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
              />
            </div>
            <div className="w-24">
              <label className="block text-[11px] text-[#55555A] mb-1">Prix unit. (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={ligne.prix_unitaire}
                onChange={(e) => updateLigne(i, { prix_unitaire: Number(e.target.value) })}
                className="w-full bg-[#18181B] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
              />
            </div>
            <div className="w-20">
              <label className="block text-[11px] text-[#55555A] mb-1">Qté</label>
              <input
                type="number"
                step="1"
                min="1"
                value={ligne.quantite}
                onChange={(e) => updateLigne(i, { quantite: Number(e.target.value) })}
                className="w-full bg-[#18181B] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
              />
            </div>
            <button
              type="button"
              onClick={() => supprimerLigne(i)}
              disabled={lignes.length === 1}
              className="p-1.5 rounded-md text-[#8B8B8D] hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors duration-150 disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Supprimer la ligne"
            >
              <Trash size={16} weight="bold" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={ajouterLigne}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150"
      >
        <Plus size={14} weight="bold" />
        Ajouter une ligne
      </button>

      <p className="mt-3 text-sm text-[#EDEDED]">
        Total HT :{" "}
        <span className="font-semibold">{totalHt.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
      </p>
      <p className="text-xs text-[#55555A]">TVA non applicable, art. 293 B du CGI</p>
    </div>
  );
}
