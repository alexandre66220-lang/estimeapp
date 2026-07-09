"use client";

import { useState, useEffect, useCallback } from "react";
import { FloppyDisk } from "@phosphor-icons/react";

type Forme = "rectangle" | "l_shape" | "triangle" | "cercle" | "trapeze";

const FORMES: { value: Forme; label: string }[] = [
  { value: "rectangle", label: "Rectangle" },
  { value: "l_shape", label: "Forme en L" },
  { value: "triangle", label: "Triangle" },
  { value: "cercle", label: "Cercle" },
  { value: "trapeze", label: "Trapèze" },
];

const VOLUMES_POT = [1, 2.5, 5, 10, 15];

type HistoryEntry = {
  label: string;
  surface: number;
  ts: number;
};

const HISTORY_KEY = "estime_calc_history";

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 5)));
}

function parseNum(v: string) {
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) || n < 0 ? 0 : n;
}

function computeSurface(
  forme: Forme,
  vals: Record<string, string>
): number {
  const g = (k: string) => parseNum(vals[k] ?? "");
  switch (forme) {
    case "rectangle":
      return g("longueur") * g("largeur");
    case "l_shape": {
      const a = g("a_longueur") * g("a_largeur");
      const b = g("b_longueur") * g("b_largeur");
      return a + b;
    }
    case "triangle":
      return (g("base") * g("hauteur")) / 2;
    case "cercle":
      return Math.PI * g("rayon") ** 2;
    case "trapeze":
      return ((g("base1") + g("base2")) / 2) * g("hauteur");
    default:
      return 0;
  }
}

const FIELDS: Record<Forme, { key: string; label: string }[]> = {
  rectangle: [
    { key: "longueur", label: "Longueur (m)" },
    { key: "largeur", label: "Largeur (m)" },
  ],
  l_shape: [
    { key: "a_longueur", label: "Partie A, longueur (m)" },
    { key: "a_largeur", label: "Partie A, largeur (m)" },
    { key: "b_longueur", label: "Partie B, longueur (m)" },
    { key: "b_largeur", label: "Partie B, largeur (m)" },
  ],
  triangle: [
    { key: "base", label: "Base (m)" },
    { key: "hauteur", label: "Hauteur (m)" },
  ],
  cercle: [{ key: "rayon", label: "Rayon (m)" }],
  trapeze: [
    { key: "base1", label: "Base 1 (m)" },
    { key: "base2", label: "Base 2 (m)" },
    { key: "hauteur", label: "Hauteur (m)" },
  ],
};

export function CalculateurSurface({
  onUse,
}: {
  onUse?: (surface: number) => void;
}) {
  const [forme, setForme] = useState<Forme>("rectangle");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [portes, setPortes] = useState("0");
  const [fenetres, setFenetres] = useState("0");
  const [couches, setCouches] = useState("2");
  const [volumePot, setVolumePot] = useState(5);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    setVals({});
  }, [forme]);

  const surface = computeSurface(forme, vals);
  const surfaceNette = Math.max(
    0,
    surface - parseNum(portes) * 1.85 - parseNum(fenetres) * 1.2
  );
  const n = parseNum(couches);
  const litres = surfaceNette * n * 0.1;
  const nbPots = Math.ceil(litres / volumePot);
  const heuresEstimees = surfaceNette / 20;

  function setVal(key: string, val: string) {
    setVals((prev) => ({ ...prev, [key]: val }));
  }

  const saveToHistory = useCallback(() => {
    if (surface <= 0) return;
    const entry: HistoryEntry = {
      label: `${FORMES.find((f) => f.value === forme)?.label} (${surface.toFixed(2)} m²)`,
      surface,
      ts: Date.now(),
    };
    const next = [entry, ...loadHistory().filter((h) => Math.abs(h.surface - surface) > 0.01)].slice(0, 5);
    saveHistory(next);
    setHistory(next);
  }, [surface, forme]);

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust/50 text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-[#C75D3B]/20 focus:border-[#C75D3B]/40 transition-all";

  return (
    <div className="space-y-5">
      {/* Forme */}
      <div>
        <p className="text-sm font-medium text-dusk/70 mb-2">Forme</p>
        <div className="flex flex-wrap gap-2">
          {FORMES.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setForme(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                forme === f.value
                  ? "bg-[#C75D3B] text-white border-[#C75D3B]"
                  : "border-dusk/15 text-dusk/60 hover:bg-dust/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        {FIELDS[forme].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-dusk/60 mb-1">{label}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={vals[key] ?? ""}
              onChange={(e) => setVal(key, e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {/* Surface résultat */}
      {surface > 0 && (
        <div className="rounded-xl border-2 border-[#C75D3B]/30 bg-[#C75D3B]/5 px-5 py-4 text-center">
          <p className="text-xs text-dusk/50 mb-1">Surface totale</p>
          <p className="font-display text-3xl font-bold" style={{ color: "#C75D3B" }}>
            {surface.toFixed(2)} m²
          </p>
        </div>
      )}

      {/* Section peinture */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-dusk/70 list-none flex items-center gap-2 py-1">
          <span className="w-5 h-5 rounded-full border border-dusk/20 flex items-center justify-center text-xs group-open:rotate-90 transition-transform">▶</span>
          Calculs peinture (optionnel)
        </summary>
        <div className="mt-3 space-y-3 pl-1">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-dusk/60 mb-1">Portes</label>
              <input type="number" min="0" value={portes} onChange={(e) => setPortes(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-dusk/60 mb-1">Fenêtres</label>
              <input type="number" min="0" value={fenetres} onChange={(e) => setFenetres(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-dusk/60 mb-1">Couches</label>
              <select value={couches} onChange={(e) => setCouches(e.target.value)} className={inputClass}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-dusk/60 mb-1">Volume pot</label>
            <div className="flex gap-2">
              {VOLUMES_POT.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVolumePot(v)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    volumePot === v ? "bg-[#C75D3B] text-white border-[#C75D3B]" : "border-dusk/15 text-dusk/60 hover:bg-dust/60"
                  }`}
                >
                  {v}L
                </button>
              ))}
            </div>
          </div>

          {surfaceNette > 0 && (
            <div className="rounded-xl bg-dust/50 border border-dusk/8 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-dusk/60">Surface nette</span>
                <span className="font-semibold text-dusk">{surfaceNette.toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dusk/60">Peinture nécessaire</span>
                <span className="font-semibold text-dusk">{litres.toFixed(1)} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dusk/60">Pots recommandés ({volumePot}L)</span>
                <span className="font-semibold text-dusk">{nbPots} pot{nbPots > 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between border-t border-dusk/8 pt-1.5">
                <span className="text-dusk/60">Temps estimé</span>
                <span className="font-semibold text-dusk">{heuresEstimees.toFixed(1)} h</span>
              </div>
            </div>
          )}
        </div>
      </details>

      {/* Boutons */}
      <div className="flex flex-wrap gap-2">
        {onUse && surface > 0 && (
          <button
            type="button"
            onClick={() => { onUse(Math.round(surface * 100) / 100); saveToHistory(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors"
            style={{ background: "#C75D3B" }}
          >
            Utiliser ces dimensions ({surface.toFixed(2)} m²)
          </button>
        )}
        {surface > 0 && (
          <button
            type="button"
            onClick={saveToHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-dusk/15 text-dusk/60 hover:bg-dust/60 transition-colors"
          >
            <FloppyDisk size={14} />
            Sauvegarder
          </button>
        )}
      </div>

      {/* Historique */}
      {history.length > 0 && (
        <div>
          <p className="text-xs font-medium text-dusk/50 mb-2">Calculs récents</p>
          <ul className="space-y-1">
            {history.map((h, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-dust/50 border border-dusk/6"
              >
                <span className="text-dusk/60 truncate">{h.label}</span>
                {onUse && (
                  <button
                    type="button"
                    onClick={() => onUse(h.surface)}
                    className="ml-2 shrink-0 text-[#C75D3B] font-medium hover:underline"
                  >
                    Utiliser
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
