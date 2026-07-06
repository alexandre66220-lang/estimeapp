"use client";

import { useState } from "react";
import { ComparatifFinances } from "@/components/espace/ComparatifFinances";
import { RentabiliteTab } from "@/components/espace/RentabiliteTab";
import type { RentabiliteAnnuelle } from "@/components/espace/RentabiliteFinances";

type Tab = "tableau-de-bord" | "comparaison" | "rentabilite";

export function FinancesTabs({
  children,
  rentabiliteAnnuelle,
}: {
  children: React.ReactNode;
  rentabiliteAnnuelle: RentabiliteAnnuelle;
}) {
  const [tab, setTab] = useState<Tab>("tableau-de-bord");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-dust/50 rounded-xl p-1 max-w-sm">
        {([
          ["tableau-de-bord", "Finances"],
          ["comparaison", "Comparaison"],
          ["rentabilite", "Rentabilité"],
        ] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-dusk shadow-sm" : "text-dusk/50 hover:text-dusk/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "tableau-de-bord" && children}

      {tab === "comparaison" && (
        <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
          <h2 className="font-display text-lg font-bold text-dusk mb-1">Comparaison de périodes</h2>
          <p className="text-dusk/50 text-sm mb-5">Comparez deux périodes pour analyser votre progression.</p>
          <ComparatifFinances />
        </div>
      )}

      {tab === "rentabilite" && <RentabiliteTab data={rentabiliteAnnuelle} />}
    </div>
  );
}
