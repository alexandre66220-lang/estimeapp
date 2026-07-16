"use client";

import { useMemo, useState } from "react";
import type { NouvelAbonneEstime } from "@/lib/backoffice/estime-readonly";

export function AbonnesEstimeList({ abonnes }: { abonnes: NouvelAbonneEstime[] }) {
  const [recherche, setRecherche] = useState("");

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return abonnes;
    return abonnes.filter((a) =>
      [a.nom, a.metier, a.ville].filter(Boolean).some((v) => v!.toLowerCase().includes(q))
    );
  }, [abonnes, recherche]);

  return (
    <div>
      <div className="px-5 py-3 border-b border-[#232326]">
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un abonné (nom, métier, ville)…"
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
        />
      </div>

      {filtres.length === 0 ? (
        <p className="px-5 py-6 text-sm text-[#55555A]">Aucun abonné ne correspond à cette recherche.</p>
      ) : (
        <ul className="divide-y divide-[#232326] max-h-[420px] overflow-y-auto">
          {filtres.map((a) => (
            <li key={a.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <span className="text-sm text-[#EDEDED] truncate">{a.nom}</span>
              <span className="text-xs text-[#8B8B8D] shrink-0">
                {[a.metier, a.ville].filter(Boolean).join(" · ") || "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
