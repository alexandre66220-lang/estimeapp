"use client";

import { useState, useTransition } from "react";
import { ArrowUp, ArrowDown, Minus, Sparkle } from "@phosphor-icons/react";
import { getPeriodStats, genererAnalyseComparatif, type PeriodStats } from "@/app/actions/comparatif-finances";

type Periode = {
  type: "mois" | "trimestre" | "annee";
  year: number;
  index: number; // mois 0-11, trimestre 0-3
};

function periodeLabel(p: Periode): string {
  const MOIS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  if (p.type === "mois") return `${MOIS[p.index]} ${p.year}`;
  if (p.type === "trimestre") return `T${p.index + 1} ${p.year}`;
  return `${p.year}`;
}

function periodeDates(p: Periode): { debut: string; fin: string } {
  if (p.type === "mois") {
    const debut = new Date(p.year, p.index, 1);
    const fin = new Date(p.year, p.index + 1, 0, 23, 59, 59);
    return { debut: debut.toISOString(), fin: fin.toISOString() };
  }
  if (p.type === "trimestre") {
    const startMonth = p.index * 3;
    const debut = new Date(p.year, startMonth, 1);
    const fin = new Date(p.year, startMonth + 3, 0, 23, 59, 59);
    return { debut: debut.toISOString(), fin: fin.toISOString() };
  }
  return {
    debut: new Date(p.year, 0, 1).toISOString(),
    fin: new Date(p.year, 11, 31, 23, 59, 59).toISOString(),
  };
}

function now() { return new Date(); }

function defaultPeriodes(): [Periode, Periode] {
  const d = now();
  const y = d.getFullYear();
  const m = d.getMonth();
  const pA: Periode = { type: "mois", year: m === 0 ? y - 1 : y, index: m === 0 ? 11 : m - 1 };
  const pB: Periode = { type: "mois", year: y, index: m };
  return [pA, pB];
}

function fmtEur(n: number) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
}

function EcartCell({ a, b, isEur = true }: { a: number; b: number; isEur?: boolean }) {
  const diff = b - a;
  const pct = a !== 0 ? ((diff / Math.abs(a)) * 100).toFixed(0) : null;
  if (diff === 0) return <span className="text-dusk/40 flex items-center gap-1"><Minus size={12} /> —</span>;
  const up = diff > 0;
  return (
    <span className={`flex items-center gap-1 font-semibold text-sm ${up ? "text-green-600" : "text-red-500"}`}>
      {up ? <ArrowUp size={12} weight="bold" /> : <ArrowDown size={12} weight="bold" />}
      {isEur ? fmtEur(Math.abs(diff)) : Math.abs(diff).toFixed(0)}
      {pct !== null && ` (${up ? "+" : "-"}${Math.abs(Number(pct))}%)`}
    </span>
  );
}

type PeriodePickerProps = {
  value: Periode;
  onChange: (p: Periode) => void;
  label: string;
};

function PeriodePicker({ value, onChange, label }: PeriodePickerProps) {
  const years = Array.from({ length: 5 }, (_, i) => now().getFullYear() - i);
  const MOIS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-dusk/60 uppercase tracking-wide">{label}</p>
      <div className="flex gap-1">
        {(["mois", "trimestre", "annee"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange({ ...value, type: t, index: t === "annee" ? 0 : value.index })}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              value.type === t ? "bg-[#C75D3B] text-white border-[#C75D3B]" : "border-dusk/15 text-dusk/60 hover:bg-dust/60"
            }`}
          >
            {t === "mois" ? "Mois" : t === "trimestre" ? "Trimestre" : "Année"}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <select
          value={value.year}
          onChange={(e) => onChange({ ...value, year: Number(e.target.value) })}
          className="flex-1 px-3 py-2 rounded-xl border border-dusk/15 bg-dust/50 text-dusk text-sm focus:outline-none"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        {value.type === "mois" && (
          <select
            value={value.index}
            onChange={(e) => onChange({ ...value, index: Number(e.target.value) })}
            className="flex-1 px-3 py-2 rounded-xl border border-dusk/15 bg-dust/50 text-dusk text-sm focus:outline-none"
          >
            {MOIS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        )}
        {value.type === "trimestre" && (
          <select
            value={value.index}
            onChange={(e) => onChange({ ...value, index: Number(e.target.value) })}
            className="flex-1 px-3 py-2 rounded-xl border border-dusk/15 bg-dust/50 text-dusk text-sm focus:outline-none"
          >
            {["T1","T2","T3","T4"].map((t, i) => <option key={i} value={i}>{t}</option>)}
          </select>
        )}
      </div>
    </div>
  );
}

const ROWS: { key: keyof PeriodStats; label: string; isEur: boolean }[] = [
  { key: "ca", label: "Chiffre d'affaires", isEur: true },
  { key: "chantiers", label: "Nombre de chantiers", isEur: false },
  { key: "moyenne", label: "Montant moyen / chantier", isEur: true },
  { key: "depenses", label: "Dépenses totales", isEur: true },
  { key: "marge", label: "Marge brute", isEur: true },
];

export function ComparatifFinances() {
  const [periodes, setPeriodes] = useState<[Periode, Periode]>(defaultPeriodes);
  const [statsA, setStatsA] = useState<PeriodStats | null>(null);
  const [statsB, setStatsB] = useState<PeriodStats | null>(null);
  const [analyse, setAnalyse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAnalysing, startAnalyse] = useTransition();

  function applyQuickPreset(preset: "mois" | "trimestre" | "annee") {
    const d = now();
    const y = d.getFullYear();
    const m = d.getMonth();
    const q = Math.floor(m / 3);
    let pA: Periode, pB: Periode;

    if (preset === "mois") {
      pA = { type: "mois", year: m === 0 ? y - 1 : y, index: m === 0 ? 11 : m - 1 };
      pB = { type: "mois", year: y, index: m };
    } else if (preset === "trimestre") {
      const prevQ = q === 0 ? 3 : q - 1;
      pA = { type: "trimestre", year: q === 0 ? y - 1 : y, index: prevQ };
      pB = { type: "trimestre", year: y, index: q };
    } else {
      pA = { type: "annee", year: y - 1, index: 0 };
      pB = { type: "annee", year: y, index: 0 };
    }
    setPeriodes([pA, pB]);
    setStatsA(null); setStatsB(null); setAnalyse(null);
  }

  function handleCompare() {
    setError(null);
    setAnalyse(null);
    startTransition(async () => {
      const [resA, resB] = await Promise.all([
        getPeriodStats(...Object.values(periodeDates(periodes[0])) as [string, string]),
        getPeriodStats(...Object.values(periodeDates(periodes[1])) as [string, string]),
      ]);
      if (resA.error || resB.error) {
        setError(resA.error ?? resB.error ?? "Erreur");
        return;
      }
      setStatsA(resA.data!);
      setStatsB(resB.data!);
    });
  }

  function handleAnalyse() {
    if (!statsA || !statsB) return;
    startAnalyse(async () => {
      const result = await genererAnalyseComparatif(
        { label: periodeLabel(periodes[0]), stats: statsA },
        { label: periodeLabel(periodes[1]), stats: statsB }
      );
      if (result.analyse) setAnalyse(result.analyse);
    });
  }

  return (
    <div className="space-y-5">
      {/* Quick presets */}
      <div className="flex flex-wrap gap-2">
        <p className="text-xs text-dusk/50 self-center">Raccourcis :</p>
        {[
          { label: "Ce mois vs mois dernier", preset: "mois" as const },
          { label: "Ce trimestre vs dernier", preset: "trimestre" as const },
          { label: "Cette année vs dernière", preset: "annee" as const },
        ].map(({ label, preset }) => (
          <button
            key={preset}
            type="button"
            onClick={() => applyQuickPreset(preset)}
            className="text-xs px-3 py-1.5 rounded-full border border-dusk/15 text-dusk/60 hover:bg-dust/60 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Period pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-dust/50 rounded-xl p-4">
          <PeriodePicker value={periodes[0]} onChange={(p) => { setPeriodes([p, periodes[1]]); setStatsA(null); }} label="Période A" />
        </div>
        <div className="bg-dust/50 rounded-xl p-4">
          <PeriodePicker value={periodes[1]} onChange={(p) => { setPeriodes([periodes[0], p]); setStatsB(null); }} label="Période B" />
        </div>
      </div>

      <button
        type="button"
        onClick={handleCompare}
        disabled={isPending}
        className="px-5 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-50 transition-colors"
        style={{ background: "#C75D3B" }}
      >
        {isPending ? "Chargement…" : "Comparer"}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Results table */}
      {statsA && statsB && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-dusk/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dusk/8 bg-dust/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dusk/50 uppercase tracking-wide">Indicateur</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dusk/50 uppercase tracking-wide">{periodeLabel(periodes[0])}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dusk/50 uppercase tracking-wide">{periodeLabel(periodes[1])}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dusk/50 uppercase tracking-wide">Écart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dusk/5">
                {ROWS.map(({ key, label, isEur }) => (
                  <tr key={key} className="bg-white hover:bg-dust/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-dusk">{label}</td>
                    <td className="px-4 py-3 text-right text-dusk/70">
                      {isEur ? fmtEur(statsA[key] as number) : (statsA[key] as number).toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-right text-dusk font-semibold">
                      {isEur ? fmtEur(statsB[key] as number) : (statsB[key] as number).toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <EcartCell a={statsA[key] as number} b={statsB[key] as number} isEur={isEur} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI analysis */}
          {analyse ? (
            <div className="rounded-xl bg-[#C75D3B]/6 border border-[#C75D3B]/15 p-4 flex gap-3">
              <Sparkle size={18} weight="fill" className="text-[#C75D3B] shrink-0 mt-0.5" />
              <p className="text-sm text-dusk/80 leading-relaxed">{analyse}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAnalyse}
              disabled={isAnalysing}
              className="flex items-center gap-2 text-sm font-medium text-[#C75D3B] hover:underline disabled:opacity-50"
            >
              <Sparkle size={14} weight="fill" />
              {isAnalysing ? "Analyse en cours…" : "Générer une analyse IA"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
