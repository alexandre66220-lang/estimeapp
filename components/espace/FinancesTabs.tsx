"use client";

import { useState } from "react";
import { ComparatifFinances } from "@/components/espace/ComparatifFinances";

type Tab = "tableau-de-bord" | "comparaison" | "rentabilite";

type RentabiliteStats = {
  margeMoyenne: number | null;
  meilleureChantier: { titre: string; marge: number } | null;
  moinsRentable: { titre: string; marge: number; id: string } | null;
};

function fmtEur(n: number) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
}

export function FinancesTabs({
  children,
  rentabiliteStats,
}: {
  children: React.ReactNode;
  rentabiliteStats: RentabiliteStats;
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
              tab === t
                ? "bg-white text-dusk shadow-sm"
                : "text-dusk/50 hover:text-dusk/80"
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

      {tab === "rentabilite" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
            <h2 className="font-display text-lg font-bold text-dusk mb-1">Rentabilité — ce mois</h2>
            <p className="text-dusk/50 text-sm mb-5">
              Basé sur les données de rentabilité renseignées dans chaque fiche chantier.
            </p>
            {rentabiliteStats.margeMoyenne === null ? (
              <p className="text-dusk/40 text-sm">
                Aucune donnée de rentabilité ce mois. Renseignez les dépenses et heures dans les fiches chantier.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-dusk/8">
                  <span className="text-sm text-dusk/60">Marge moyenne ce mois</span>
                  <span className={`font-bold ${rentabiliteStats.margeMoyenne >= 50 ? "text-green-600" : rentabiliteStats.margeMoyenne >= 30 ? "text-orange-500" : "text-red-500"}`}>
                    {rentabiliteStats.margeMoyenne.toFixed(1)} %
                  </span>
                </div>
                {rentabiliteStats.meilleureChantier && (
                  <div className="flex justify-between items-center py-3 border-b border-dusk/8">
                    <div>
                      <p className="text-sm font-medium text-dusk">🏆 Meilleur chantier</p>
                      <p className="text-xs text-dusk/50">{rentabiliteStats.meilleureChantier.titre}</p>
                    </div>
                    <span className="font-semibold text-green-600">{fmtEur(rentabiliteStats.meilleureChantier.marge)}</span>
                  </div>
                )}
                {rentabiliteStats.moinsRentable && (
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="text-sm font-medium text-dusk">⚠️ À optimiser</p>
                      <p className="text-xs text-dusk/50">{rentabiliteStats.moinsRentable.titre}</p>
                      <p className="text-xs text-dusk/40 mt-0.5">Conseil : revoir les dépenses matériaux ou augmenter le tarif</p>
                    </div>
                    <span className={`font-semibold ${rentabiliteStats.moinsRentable.marge >= 0 ? "text-orange-500" : "text-red-500"}`}>
                      {fmtEur(rentabiliteStats.moinsRentable.marge)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
