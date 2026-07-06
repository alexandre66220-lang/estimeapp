"use client";

import { useState, useTransition } from "react";
import { saveRentabilite } from "@/app/actions/rentabilite";

type RentabiliteData = {
  montant: number | null;
  depenses: number | null;
  heures_passees: number | null;
  sous_traitance: number | null;
  frais_deplacement: number | null;
};

function parseNum(v: string): number | null {
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) || n < 0 ? null : n;
}

function fmtEur(n: number) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " €";
}

function MargeColor({ pct }: { pct: number }) {
  if (pct >= 50) return <span className="text-green-600 font-bold">{pct.toFixed(1)} %</span>;
  if (pct >= 30) return <span className="text-orange-500 font-bold">{pct.toFixed(1)} %</span>;
  return <span className="text-red-500 font-bold">{pct.toFixed(1)} %</span>;
}

export function RentabiliteChantier({
  chantierId,
  initial,
  tauxCharges = 45,
}: {
  chantierId: string;
  initial: RentabiliteData;
  tauxCharges?: number;
}) {
  const [montant, setMontant] = useState(initial.montant?.toString() ?? "");
  const [depenses, setDepenses] = useState(initial.depenses?.toString() ?? "");
  const [heures, setHeures] = useState(initial.heures_passees?.toString() ?? "");
  const [sousTraitance, setSousTraitance] = useState(initial.sous_traitance?.toString() ?? "");
  const [frais, setFrais] = useState(initial.frais_deplacement?.toString() ?? "");
  const [charges, setCharges] = useState(tauxCharges.toString());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const m = parseNum(montant) ?? 0;
  const d = parseNum(depenses) ?? 0;
  const h = parseNum(heures) ?? 0;
  const st = parseNum(sousTraitance) ?? 0;
  const fr = parseNum(frais) ?? 0;
  const tc = parseNum(charges) ?? 45;

  const margeBrute = m - d - st - fr;
  const tauxMarge = m > 0 ? (margeBrute / m) * 100 : 0;
  const tauxHoraire = h > 0 ? margeBrute / h : null;
  const resultatNet = margeBrute * (1 - tc / 100);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveRentabilite(chantierId, {
        montant: parseNum(montant),
        depenses: parseNum(depenses),
        heures_passees: parseNum(heures),
        sous_traitance: parseNum(sousTraitance),
        frais_deplacement: parseNum(frais),
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust/50 text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-[#C75D3B]/20 focus:border-[#C75D3B]/40 transition-all";

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-6">
      <h2 className="font-display text-lg font-bold text-dusk mb-4">Rentabilité</h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1">Montant chantier (€)</label>
          <input type="number" min="0" step="0.01" value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1">Dépenses matériaux (€)</label>
          <input type="number" min="0" step="0.01" value={depenses} onChange={(e) => setDepenses(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1">Heures passées</label>
          <input type="number" min="0" step="0.5" value={heures} onChange={(e) => setHeures(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1">Sous-traitance (€)</label>
          <input type="number" min="0" step="0.01" value={sousTraitance} onChange={(e) => setSousTraitance(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1">Frais de déplacement (€)</label>
          <input type="number" min="0" step="0.01" value={frais} onChange={(e) => setFrais(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1">Taux de charges (%) <span className="text-dusk/35 font-normal">auto-entr. : 45%</span></label>
          <input type="number" min="0" max="100" step="1" value={charges} onChange={(e) => setCharges(e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Résultats */}
      {m > 0 && (
        <div className="rounded-xl bg-dust/50 border border-dusk/8 p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-dusk/60">Marge brute</span>
            <span className="font-semibold text-dusk">{fmtEur(margeBrute)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dusk/60">Taux de marge</span>
            <MargeColor pct={tauxMarge} />
          </div>
          {h > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-dusk/60">Taux horaire réel</span>
              <span className="font-semibold text-dusk">{tauxHoraire !== null ? fmtEur(tauxHoraire) + "/h" : "—"}</span>
            </div>
          )}
          <div className="flex justify-between text-sm border-t border-dusk/8 pt-2 mt-2">
            <span className="text-dusk/60">Résultat net estimé</span>
            <span className={`font-bold ${resultatNet >= 0 ? "text-green-600" : "text-red-500"}`}>{fmtEur(resultatNet)}</span>
          </div>
          {tauxMarge < 30 && m > 0 && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-1">
              ⚠️ Taux de marge inférieur à 30% — pensez à revoir vos tarifs ou à réduire les dépenses.
            </p>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-50 transition-colors"
        style={{ background: "#C75D3B" }}
      >
        {saved ? "✓ Enregistré" : isPending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}
