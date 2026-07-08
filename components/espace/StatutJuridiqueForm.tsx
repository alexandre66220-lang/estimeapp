"use client";

import { useTransition, useState } from "react";
import { saveStatutJuridique } from "@/app/actions/profil-financier";

const STATUTS = [
  { value: "auto_entrepreneur", label: "Auto-entrepreneur" },
  { value: "eurl", label: "EURL" },
  { value: "sasu", label: "SASU" },
  { value: "eirl", label: "EIRL" },
  { value: "autre", label: "Autre" },
];

const REGIMES: Record<string, { value: string; label: string; taux: number | null }[]> = {
  auto_entrepreneur: [
    { value: "micro_bic_artisan", label: "Micro-BIC artisan", taux: 13 },
    { value: "micro_bnc", label: "Micro-BNC", taux: 23 },
  ],
  eurl: [
    { value: "reel_simplifie_ir", label: "Réel simplifié (IR)", taux: 22 },
    { value: "is", label: "IS (impôt sur les sociétés)", taux: 20 },
  ],
  sasu: [
    { value: "is", label: "IS (impôt sur les sociétés)", taux: 20 },
  ],
  eirl: [
    { value: "reel_simplifie_ir", label: "Réel simplifié (IR)", taux: 22 },
    { value: "is", label: "IS (impôt sur les sociétés)", taux: 20 },
  ],
  autre: [
    { value: "manuel", label: "Taux personnalisé", taux: null },
  ],
};

export function StatutJuridiqueForm({
  statutJuridique,
  regimeImposition,
  tauxImpositionEstime,
}: {
  statutJuridique: string | null;
  regimeImposition: string | null;
  tauxImpositionEstime: number | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statut, setStatut] = useState(statutJuridique ?? "");
  const [regime, setRegime] = useState(regimeImposition ?? "");
  const [tauxManuel, setTauxManuel] = useState(tauxImpositionEstime?.toString() ?? "");

  const regimesDisponibles = statut ? (REGIMES[statut] ?? []) : [];
  const regimeSelectionne = regimesDisponibles.find((r) => r.value === regime);
  const tauxAuto = regimeSelectionne?.taux;
  const isManuel = regimeSelectionne?.taux === null;

  function handleStatutChange(val: string) {
    setStatut(val);
    const firstRegime = REGIMES[val]?.[0];
    setRegime(firstRegime?.value ?? "");
  }

  function handleRegimeChange(val: string) {
    setRegime(val);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (tauxAuto !== null && tauxAuto !== undefined) {
      formData.set("taux_imposition_estime", String(tauxAuto));
    }
    startTransition(async () => {
      const result = await saveStatutJuridique(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  const tauxAffiché = isManuel
    ? tauxManuel !== "" ? parseFloat(tauxManuel) : null
    : tauxAuto;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-dusk/50 mb-1.5">Statut juridique</label>
          <select
            name="statut_juridique"
            value={statut}
            onChange={(e) => handleStatutChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-dusk/15 rounded-xl text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30 bg-white"
          >
            <option value="">Choisir un statut</option>
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {statut && regimesDisponibles.length > 0 && (
          <div>
            <label className="block text-xs text-dusk/50 mb-1.5">Régime d&apos;imposition</label>
            <select
              name="regime_imposition"
              value={regime}
              onChange={(e) => handleRegimeChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-dusk/15 rounded-xl text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30 bg-white"
            >
              {regimesDisponibles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {statut && regime && (
        <div className="bg-ambre/5 border border-ambre/20 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          {isManuel ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-dusk/60">Taux d&apos;imposition estimé :</span>
              <div className="relative w-28">
                <input
                  type="number"
                  name="taux_imposition_estime"
                  value={tauxManuel}
                  onChange={(e) => setTauxManuel(e.target.value)}
                  min="0"
                  max="50"
                  step="0.5"
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-dusk/15 rounded-lg text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30 bg-white pr-6"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-dusk/40 text-xs">%</span>
              </div>
            </div>
          ) : (
            <>
              <input type="hidden" name="taux_imposition_estime" value={tauxAuto ?? ""} />
              <span className="text-sm text-dusk/60">Taux d&apos;imposition estimé :</span>
              <span className="font-display text-xl font-bold text-braise">{tauxAuto} %</span>
            </>
          )}
        </div>
      )}

      {tauxAffiché !== null && (
        <p className="text-xs text-dusk/40 italic">
          Estimation indicative, ne remplace pas un comptable.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !statut || !regime}
          className="px-5 py-2.5 bg-braise text-white text-sm font-semibold rounded-full hover:bg-ambre transition-colors disabled:opacity-50"
        >
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {success && <p className="text-xs text-green-600">Sauvegardé</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </form>
  );
}
