"use client";

import { useState, useTransition } from "react";
import type React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Sparkle } from "@phosphor-icons/react";
import { analyserRentabilite } from "@/app/actions/rentabilite";
import type { RentabiliteAnnuelle, RentabiliteChantierRow } from "./RentabiliteFinances";

const RentabiliteDonut = dynamic<React.ComponentProps<typeof import("./RentabiliteDonut").RentabiliteDonut>>(
  () => import("./RentabiliteDonut").then((m) => m.RentabiliteDonut),
  { ssr: false, loading: () => <div className="w-full h-[220px] animate-pulse bg-dust/50 rounded-xl" /> }
);

function fmtEur(n: number) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
}

function MargeBadge({ taux }: { taux: number }) {
  if (taux >= 50) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">{taux.toFixed(0)}%</span>;
  if (taux >= 30) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600">{taux.toFixed(0)}%</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">{taux.toFixed(0)}%</span>;
}

function computeRow(r: RentabiliteChantierRow) {
  const m = r.montant ?? 0;
  const couts = (r.depenses ?? 0) + (r.sous_traitance ?? 0) + (r.frais_deplacement ?? 0) + (r.autres_couts ?? 0);
  const marge = m - couts;
  const taux = m > 0 ? (marge / m) * 100 : 0;
  const tauxHoraire = (r.heures_passees ?? 0) > 0 ? marge / r.heures_passees! : null;
  return { m, couts, marge, taux, tauxHoraire };
}

type SortKey = "date" | "montant" | "couts" | "marge" | "taux" | "heures" | "tauxHoraire";

type Recommendation = { titre: string; conseil: string };

export function RentabiliteTab({ data, tauxImposition }: { data: RentabiliteAnnuelle; tauxImposition: number | null }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [analyse, setAnalyse] = useState<Recommendation[] | null>(null);
  const [analyseError, setAnalyseError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const year = new Date().getFullYear();

  const sortedChantiers = [...data.chantiers].sort((a, b) => {
    const ra = computeRow(a);
    const rb = computeRow(b);
    let diff = 0;
    if (sortKey === "date") diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    else if (sortKey === "montant") diff = (a.montant ?? 0) - (b.montant ?? 0);
    else if (sortKey === "couts") diff = ra.couts - rb.couts;
    else if (sortKey === "marge") diff = ra.marge - rb.marge;
    else if (sortKey === "taux") diff = ra.taux - rb.taux;
    else if (sortKey === "heures") diff = (a.heures_passees ?? 0) - (b.heures_passees ?? 0);
    else if (sortKey === "tauxHoraire") diff = (ra.tauxHoraire ?? 0) - (rb.tauxHoraire ?? 0);
    return sortAsc ? diff : -diff;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  }

  function SortTh({ label, field }: { label: string; field: SortKey }) {
    const active = sortKey === field;
    return (
      <th
        className="px-3 py-2.5 text-left text-xs font-semibold text-dusk/50 uppercase tracking-wide cursor-pointer hover:text-dusk/80 select-none whitespace-nowrap"
        onClick={() => toggleSort(field)}
      >
        {label} {active ? (sortAsc ? "↑" : "↓") : ""}
      </th>
    );
  }

  const donutData = [
    { name: "Fournitures", value: data.totalFournitures },
    { name: "Sous-traitance", value: data.totalSousTraitance },
    { name: "Déplacements", value: data.totalDeplacements },
    { name: "Autres", value: data.totalAutres },
  ];
  const totalCoutsAnnee = data.totalFournitures + data.totalSousTraitance + data.totalDeplacements + data.totalAutres;
  const chantiersAvecCouts = data.chantiers.filter(
    (r) => (r.depenses ?? 0) + (r.sous_traitance ?? 0) + (r.frais_deplacement ?? 0) + (r.autres_couts ?? 0) > 0
  );
  const showDonut = chantiersAvecCouts.length >= 3;

  function handleAnalyse() {
    setAnalyseError(null);
    startTransition(async () => {
      const result = await analyserRentabilite({
        margeMoyenne: data.tauxMargeMoyen ?? 0,
        caAnnee: data.caTotal,
        totalFournitures: data.totalFournitures,
        totalSousTraitance: data.totalSousTraitance,
        totalDeplacements: data.totalDeplacements,
        totalAutres: data.totalAutres,
        nbChantiers: data.chantiers.length,
        tauxHoraireMoyen: data.tauxHoraireMoyen,
      });
      if (result.error) {
        setAnalyseError(result.error);
        return;
      }
      if (result.analyse) {
        try {
          const parsed = JSON.parse(result.analyse.match(/\[[\s\S]*\]/)?.[0] ?? "[]") as Recommendation[];
          setAnalyse(parsed);
        } catch {
          setAnalyse([{ titre: "Analyse", conseil: result.analyse }]);
        }
      }
    });
  }

  if (data.chantiers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dusk/8 p-8 text-center">
        <p className="text-dusk/40 text-sm">Aucun chantier cette année. Commencez à créer des chantiers pour voir votre rentabilité.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats globales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Marge brute totale", value: fmtEur(data.margeBruteTotale), color: data.margeBruteTotale >= 0 ? "text-green-600" : "text-red-500" },
          { label: "Taux de marge moyen", value: data.tauxMargeMoyen !== null ? `${data.tauxMargeMoyen.toFixed(1)} %` : "—", color: data.tauxMargeMoyen !== null && data.tauxMargeMoyen >= 30 ? "text-green-600" : "text-red-500" },
          { label: "Taux horaire moyen", value: data.tauxHoraireMoyen !== null ? `${data.tauxHoraireMoyen.toFixed(0)} €/h` : "—", color: "text-dusk" },
          tauxImposition !== null
            ? { label: "Résultat net après impôt (estimé)", value: fmtEur(data.margeBruteTotale * (1 - tauxImposition / 100)), color: data.margeBruteTotale >= 0 ? "text-green-600" : "text-red-500" }
            : { label: "Résultat net après impôt", value: "Définir dans profil", color: "text-dusk/30" },
          data.meilleureChantier
            ? { label: "Meilleur chantier", value: `${data.meilleureChantier.titre.slice(0, 20)} · ${data.meilleureChantier.taux.toFixed(0)}%`, color: "text-green-600" }
            : { label: "Meilleur chantier", value: "—", color: "text-dusk/40" },
          data.moinsRentable
            ? { label: "À optimiser", value: `${data.moinsRentable.titre.slice(0, 20)} · ${data.moinsRentable.taux.toFixed(0)}%`, color: "text-orange-500" }
            : { label: "À optimiser", value: "—", color: "text-dusk/40" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-dusk/8 p-4">
            <p className="text-xs text-dusk/45 mb-1">{label}</p>
            <p className={`font-display text-sm font-bold leading-tight ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tableau des chantiers */}
      <div className="bg-white rounded-2xl border border-dusk/8 p-6">
        <h2 className="font-display text-base font-bold text-dusk mb-4">Chantiers {year} — Détail financier</h2>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dusk/8">
                <SortTh label="Chantier" field="date" />
                <SortTh label="HT" field="montant" />
                <SortTh label="Coûts" field="couts" />
                <SortTh label="Marge" field="marge" />
                <SortTh label="%" field="taux" />
                <SortTh label="Heures" field="heures" />
                <SortTh label="€/h" field="tauxHoraire" />
              </tr>
            </thead>
            <tbody className="divide-y divide-dusk/5">
              {sortedChantiers.map((r) => {
                const { m, couts, marge, taux, tauxHoraire } = computeRow(r);
                const hasData = m > 0;
                return (
                  <tr key={r.id} className={`transition-colors hover:bg-dust/30 ${!hasData ? "opacity-50" : ""}`}>
                    <td className="px-3 py-3">
                      <Link href={`/espace/chantiers/${r.id}`} className="text-dusk hover:text-braise transition-colors font-medium line-clamp-1">
                        {r.titre ?? "—"}
                      </Link>
                      <p className="text-xs text-dusk/40">
                        {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right text-dusk/70 whitespace-nowrap">{hasData ? fmtEur(m) : "—"}</td>
                    <td className="px-3 py-3 text-right text-dusk/70 whitespace-nowrap">{couts > 0 ? fmtEur(couts) : "—"}</td>
                    <td className="px-3 py-3 text-right font-semibold whitespace-nowrap">
                      {hasData ? <span className={marge >= 0 ? "text-green-600" : "text-red-500"}>{fmtEur(marge)}</span> : "—"}
                    </td>
                    <td className="px-3 py-3 text-right">{hasData ? <MargeBadge taux={taux} /> : "—"}</td>
                    <td className="px-3 py-3 text-right text-dusk/70">{r.heures_passees ? `${r.heures_passees}h` : "—"}</td>
                    <td className="px-3 py-3 text-right text-dusk/70 whitespace-nowrap">{tauxHoraire !== null ? `${tauxHoraire.toFixed(0)} €/h` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Donut répartition coûts */}
      {showDonut && totalCoutsAnnee > 0 && (
        <div className="bg-white rounded-2xl border border-dusk/8 p-6">
          <h2 className="font-display text-base font-bold text-dusk mb-1">Répartition des coûts</h2>
          <p className="text-xs text-dusk/45 mb-4">Total : {fmtEur(totalCoutsAnnee)}</p>
          <RentabiliteDonut data={donutData} />
        </div>
      )}

      {/* Analyse IA */}
      <div className="bg-white rounded-2xl border border-dusk/8 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkle size={16} weight="fill" className="text-braise" />
          <h2 className="font-display text-base font-bold text-dusk">Analyse IA</h2>
        </div>
        <p className="text-xs text-dusk/45 mb-4">3 recommandations personnalisées basées sur vos données de rentabilité.</p>

        {analyseError && <p className="text-red-500 text-sm mb-3">{analyseError}</p>}

        {analyse ? (
          <div className="space-y-3">
            {analyse.map((rec, i) => (
              <div key={i} className="rounded-xl bg-[#C75D3B]/5 border border-[#C75D3B]/15 p-4">
                <p className="text-sm font-semibold text-dusk mb-1">{rec.titre}</p>
                <p className="text-sm text-dusk/70 leading-relaxed">{rec.conseil}</p>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setAnalyse(null)}
              className="text-xs text-dusk/40 hover:text-dusk/60 transition-colors mt-1"
            >
              Régénérer l&apos;analyse
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAnalyse}
            disabled={isPending || data.caTotal === 0}
            className="flex items-center gap-2 text-sm font-medium text-braise hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkle size={14} weight="fill" />
            {isPending ? "Analyse en cours…" : "Analyser ma rentabilité"}
          </button>
        )}
      </div>
    </div>
  );
}
