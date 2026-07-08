"use client";

import { useState } from "react";
import { ComparatifFinances } from "@/components/espace/ComparatifFinances";
import { RentabiliteTab } from "@/components/espace/RentabiliteTab";
import { ImpaiesTab } from "@/components/espace/ImpaiesTab";
import { PrevisionnelTresorerie } from "@/components/espace/PrevisionnelTresorerie";
import type { RentabiliteAnnuelle } from "@/components/espace/RentabiliteFinances";
import type { ImpayeItem } from "@/components/espace/ImpaiesTab";
import type { PrevisionnelSemaine } from "@/components/espace/PrevisionnelTresorerie";

type Tab = "tableau-de-bord" | "comparaison" | "rentabilite" | "impayes" | "previsionnel";

const TABS: [Tab, string][] = [
  ["tableau-de-bord", "Finances"],
  ["impayes", "Impayés"],
  ["previsionnel", "Prévisionnel"],
  ["comparaison", "Comparaison"],
  ["rentabilite", "Rentabilité"],
];

export function FinancesTabs({
  children,
  rentabiliteAnnuelle,
  impayes,
  previsionnel,
  seuilAlerte,
  tauxImposition,
}: {
  children: React.ReactNode;
  rentabiliteAnnuelle: RentabiliteAnnuelle;
  impayes: ImpayeItem[];
  previsionnel: {
    semaines: PrevisionnelSemaine[];
    encaissements30: number;
    encaissements60: number;
    encaissements90: number;
    depenses30: number;
  };
  seuilAlerte: number;
  tauxImposition?: number | null;
}) {
  const [tab, setTab] = useState<Tab>("tableau-de-bord");
  const [seuil, setSeuil] = useState(seuilAlerte);

  const nbImpayes = impayes.length;

  return (
    <div>
      {/* Tab bar — scrollable on mobile */}
      <div className="overflow-x-auto pb-1 mb-6">
        <div className="flex gap-1 bg-dust/50 rounded-xl p-1 min-w-max">
          {TABS.map(([t, label]) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t ? "bg-white text-dusk shadow-sm" : "text-dusk/50 hover:text-dusk/80"
              }`}
            >
              {label}
              {t === "impayes" && nbImpayes > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {nbImpayes}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === "tableau-de-bord" && children}

      {tab === "impayes" && <ImpaiesTab impayes={impayes} />}

      {tab === "previsionnel" && (
        <PrevisionnelTresorerie
          semaines={previsionnel.semaines}
          seuilAlerte={seuil}
          encaissements30={previsionnel.encaissements30}
          encaissements60={previsionnel.encaissements60}
          encaissements90={previsionnel.encaissements90}
          depenses30={previsionnel.depenses30}
          onSeuilChange={setSeuil}
        />
      )}

      {tab === "comparaison" && (
        <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
          <h2 className="font-display text-lg font-bold text-dusk mb-1">Comparaison de périodes</h2>
          <p className="text-dusk/50 text-sm mb-5">Comparez deux périodes pour analyser votre progression.</p>
          <ComparatifFinances />
        </div>
      )}

      {tab === "rentabilite" && <RentabiliteTab data={rentabiliteAnnuelle} tauxImposition={tauxImposition ?? null} />}
    </div>
  );
}
