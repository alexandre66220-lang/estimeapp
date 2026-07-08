"use client";

import { useState } from "react";
import { Warning } from "@phosphor-icons/react";

export interface PrevisionnelSemaine {
  label: string; // "S1", "S2"...
  dateDebut: string; // ISO
  encaissements: number;
  depenses: number;
  solde: number; // cumulated
}

interface Props {
  semaines: PrevisionnelSemaine[];
  seuilAlerte: number;
  encaissements30: number;
  encaissements60: number;
  encaissements90: number;
  depenses30: number;
  onSeuilChange: (seuil: number) => void;
}

function fmtK(n: number) {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k€`;
  return `${Math.round(n)}€`;
}

export function PrevisionnelTresorerie({
  semaines,
  seuilAlerte,
  encaissements30,
  encaissements60,
  encaissements90,
  depenses30,
  onSeuilChange,
}: Props) {
  const [seuil, setSeuil] = useState(seuilAlerte);

  const alertSemaine = semaines.findIndex((s) => s.solde < seuil);
  const maxVal = Math.max(...semaines.map((s) => Math.max(s.encaissements, s.depenses, Math.abs(s.solde))), 1);

  return (
    <div className="space-y-6">
      {/* Alerte seuil */}
      {alertSemaine !== -1 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
          <Warning size={20} className="text-red-600 shrink-0 mt-0.5" weight="fill" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              Trésorerie sous le seuil d&apos;alerte
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Votre trésorerie prévisionnelle passera sous {seuil.toLocaleString("fr-FR")} € dans{" "}
              {alertSemaine + 1} semaine{alertSemaine > 0 ? "s" : ""}.
            </p>
          </div>
        </div>
      )}

      {/* Cards résumé */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Encaissements J+30", val: encaissements30, color: "text-green-700", bg: "bg-green-50" },
          { label: "Encaissements J+60", val: encaissements60, color: "text-green-600", bg: "bg-green-50/60" },
          { label: "Encaissements J+90", val: encaissements90, color: "text-green-500", bg: "bg-green-50/40" },
          { label: "Dépenses J+30", val: depenses30, color: "text-red-600", bg: "bg-red-50" },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <p className="text-xs text-dusk/60 mb-1">{label}</p>
            <p className={`text-lg font-bold ${color}`}>
              {val.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
            </p>
          </div>
        ))}
      </div>

      {/* Graphique SVG simplifié */}
      <div className="bg-white rounded-2xl border border-dusk/8 p-5 lg:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-display font-bold text-dusk text-sm">Prévisionnel 3 mois (semaines)</h3>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-dusk/60">
                <span className="w-3 h-0.5 bg-green-500 inline-block rounded" /> Encaissements
              </span>
              <span className="flex items-center gap-1.5 text-xs text-dusk/60">
                <span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> Dépenses
              </span>
              <span className="flex items-center gap-1.5 text-xs text-dusk/60">
                <span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Solde cumulé
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-dusk/60 shrink-0">Seuil alerte (€)</label>
            <input
              type="number"
              value={seuil}
              min={0}
              step={100}
              onChange={(e) => {
                const v = parseInt(e.target.value) || 0;
                setSeuil(v);
                onSeuilChange(v);
              }}
              className="w-24 text-xs px-2 py-1.5 rounded-lg border border-dusk/15 bg-dust text-dusk focus:outline-none focus:ring-2 focus:ring-ambre/30"
            />
          </div>
        </div>

        {semaines.length === 0 ? (
          <p className="text-center text-sm text-dusk/40 py-12">
            Aucune donnée prévisionnelle disponible.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${semaines.length * 60}px` }}>
              <svg
                viewBox={`0 0 ${semaines.length * 60} 180`}
                className="w-full"
                style={{ minWidth: `${semaines.length * 60}px` }}
                aria-label="Graphique prévisionnel trésorerie"
              >
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                  <line
                    key={f}
                    x1={0}
                    y1={20 + (1 - f) * 140}
                    x2={semaines.length * 60}
                    y2={20 + (1 - f) * 140}
                    stroke="#2B252110"
                    strokeWidth={1}
                  />
                ))}

                {/* Bars */}
                {semaines.map((s, i) => {
                  const x = i * 60 + 5;
                  const barW = 20;
                  const encH = (s.encaissements / maxVal) * 120;
                  const depH = (s.depenses / maxVal) * 120;
                  const soldeFrac = s.solde / maxVal;
                  const soldeY = 160 - Math.max(0, soldeFrac) * 120;
                  const prevSoldeY = i > 0
                    ? 160 - Math.max(0, semaines[i - 1].solde / maxVal) * 120
                    : soldeY;

                  return (
                    <g key={s.label}>
                      {/* Encaissements bar */}
                      <rect
                        x={x}
                        y={160 - encH}
                        width={barW}
                        height={encH}
                        fill="#22C55E"
                        opacity={0.7}
                        rx={2}
                      />
                      {/* Dépenses bar */}
                      <rect
                        x={x + barW + 2}
                        y={160 - depH}
                        width={barW}
                        height={depH}
                        fill="#EF4444"
                        opacity={0.6}
                        rx={2}
                      />
                      {/* Solde line */}
                      {i > 0 && (
                        <line
                          x1={(i - 1) * 60 + 5 + barW}
                          y1={prevSoldeY}
                          x2={x + barW}
                          y2={soldeY}
                          stroke="#3B82F6"
                          strokeWidth={2}
                        />
                      )}
                      <circle cx={x + barW} cy={soldeY} r={3} fill="#3B82F6" />
                      {/* Label */}
                      <text
                        x={x + barW}
                        y={175}
                        textAnchor="middle"
                        fontSize={9}
                        fill="#2B252180"
                      >
                        {s.label}
                      </text>
                    </g>
                  );
                })}

                {/* Seuil alerte line */}
                {seuil > 0 && (
                  <line
                    x1={0}
                    y1={160 - (seuil / maxVal) * 120}
                    x2={semaines.length * 60}
                    y2={160 - (seuil / maxVal) * 120}
                    stroke="#EF4444"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    opacity={0.5}
                  />
                )}
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
