"use client";

import { Warning, ShieldWarning, CheckCircle } from "@phosphor-icons/react";
import type { AnalyseMateriau, RisqueMateriau } from "@/lib/anthropic/analyze-materiau";

const NIVEAU_STYLES: Record<RisqueMateriau["niveau_risque"], string> = {
  faible: "bg-green-50 text-green-700 border-green-200",
  modere: "bg-orange-50 text-orange-600 border-orange-200",
  eleve: "bg-red-50 text-red-600 border-red-200",
  critique: "bg-red-100 text-red-700 border-red-300 animate-pulse",
};

const NIVEAU_LABELS: Record<RisqueMateriau["niveau_risque"], string> = {
  faible: "Faible",
  modere: "Modéré",
  eleve: "Élevé",
  critique: "Critique",
};

export function MateriauScanResult({
  analyse,
  imagePreview,
  onFermer,
  footer,
}: {
  analyse: AnalyseMateriau;
  imagePreview?: string | null;
  onFermer?: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {analyse.action_immediate_requise && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
          <ShieldWarning size={22} weight="fill" className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700 mb-0.5">Action immédiate requise</p>
            <p className="text-sm text-red-600">
              {analyse.message_urgence ?? "Ce matériau présente un risque nécessitant une action immédiate."}
            </p>
          </div>
        </div>
      )}

      {imagePreview && (
        <div className="rounded-xl overflow-hidden border border-dusk/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreview} alt={analyse.nom_materiau} className="w-full h-44 object-cover" />
        </div>
      )}

      <div>
        <p className="text-xs text-dusk/45 mb-1">Matériau identifié</p>
        <p className="font-display text-lg font-bold text-dusk">{analyse.nom_materiau}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-dusk/45 mb-1">Date de pose probable</p>
          <p className="text-sm text-dusk">{analyse.date_pose_probable ?? "Indéterminée"}</p>
        </div>
        <div>
          <p className="text-xs text-dusk/45 mb-1">Composition estimée</p>
          <p className="text-sm text-dusk">{analyse.composition_estimee ?? "Indéterminée"}</p>
        </div>
      </div>

      {analyse.risques.length > 0 && (
        <div>
          <p className="text-xs text-dusk/45 mb-2">Risques identifiés</p>
          <div className="space-y-2">
            {analyse.risques.map((r, i) => (
              <div
                key={i}
                className={`rounded-xl border p-3 ${NIVEAU_STYLES[r.niveau_risque]}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold">{r.substance}</p>
                  <span className="text-xs font-bold uppercase tracking-wide">
                    {NIVEAU_LABELS[r.niveau_risque]}
                  </span>
                </div>
                <p className="text-xs opacity-90">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {analyse.technique_depose_recommandee && (
        <div>
          <p className="text-xs text-dusk/45 mb-1">Technique de dépose recommandée</p>
          <p className="text-sm text-dusk">{analyse.technique_depose_recommandee}</p>
        </div>
      )}

      {analyse.equipements_protection.length > 0 && (
        <div>
          <p className="text-xs text-dusk/45 mb-2">Équipements de protection nécessaires</p>
          <ul className="space-y-1.5">
            {analyse.equipements_protection.map((eq, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-dusk">
                <CheckCircle size={16} className="text-braise shrink-0" weight="fill" />
                {eq}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-start gap-2 bg-dust/50 rounded-xl p-3">
        <Warning size={16} className="text-dusk/40 shrink-0 mt-0.5" />
        <p className="text-xs text-dusk/50 leading-relaxed">
          Analyse indicative générée par IA. En cas de doute sur la présence d&apos;amiante ou de plomb, faites appel à un diagnostiqueur certifié.
        </p>
      </div>

      {footer}

      {onFermer && (
        <button
          type="button"
          onClick={onFermer}
          className="w-full py-2.5 border border-dusk/15 text-sm text-dusk/60 font-medium rounded-full hover:bg-dust/50 transition-colors"
        >
          Fermer
        </button>
      )}
    </div>
  );
}
