"use client";

import { useState } from "react";
import Link from "next/link";
import { Warning, Clock } from "@phosphor-icons/react";
import { RelanceImpayeModal } from "@/components/espace/RelanceImpayeModal";

export interface ImpayeItem {
  paiementId: string;
  chantierId: string;
  chantiertTitre: string;
  clientId: string | null;
  clientNom: string;
  clientEmail: string;
  montant: number;
  datePrevue: string;
  joursRetard: number;
  nbRelances: number;
}

function gravite(jours: number): { label: string; bg: string; text: string } {
  if (jours > 30) return { label: "Critique", bg: "bg-red-50", text: "text-red-700" };
  if (jours >= 15) return { label: "Modéré", bg: "bg-orange-50", text: "text-orange-700" };
  return { label: "Léger", bg: "bg-yellow-50", text: "text-yellow-700" };
}

export function ImpaiesTab({ impayes }: { impayes: ImpayeItem[] }) {
  const [relanceTarget, setRelanceTarget] = useState<ImpayeItem | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  if (impayes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dusk/8 py-16 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h3 className="font-display text-lg font-bold text-dusk mb-1">Aucun impayé</h3>
        <p className="text-dusk/50 text-sm max-w-[34ch]">
          Tous vos paiements sont à jour. Bravo !
        </p>
      </div>
    );
  }

  const totalEnRetard = impayes.reduce((s, i) => s + i.montant, 0);

  return (
    <div className="space-y-4">
      {/* Résumé */}
      <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-4">
        <Warning size={22} className="text-red-600 shrink-0" weight="fill" />
        <div>
          <p className="text-sm font-semibold text-red-700">
            {impayes.length} paiement{impayes.length > 1 ? "s" : ""} en retard
          </p>
          <p className="text-xs text-red-600">
            Total : {totalEnRetard.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
          </p>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/6 overflow-hidden">
        {[...impayes].sort((a, b) => b.joursRetard - a.joursRetard).map((item) => {
          const g = gravite(item.joursRetard);
          const wasSent = sentIds.has(item.paiementId);
          return (
            <div key={item.paiementId} className="px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link
                      href={`/espace/chantiers/${item.chantierId}`}
                      className="text-sm font-semibold text-dusk hover:text-braise transition-colors truncate"
                    >
                      {item.chantiertTitre}
                    </Link>
                    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${g.bg} ${g.text}`}>
                      {g.label}
                    </span>
                  </div>
                  <p className="text-xs text-dusk/50">{item.clientNom}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-dusk">
                      {item.montant.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-red-600">
                      <Clock size={12} />
                      {item.joursRetard} jour{item.joursRetard > 1 ? "s" : ""} de retard
                    </span>
                  </div>
                  {item.nbRelances > 0 && (
                    <p className="text-xs text-dusk/40 mt-0.5">
                      {item.nbRelances} relance{item.nbRelances > 1 ? "s" : ""} déjà envoyée{item.nbRelances > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setRelanceTarget(item)}
                  disabled={wasSent}
                  className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
                    wasSent
                      ? "bg-green-50 text-green-700 cursor-default"
                      : "bg-braise text-white hover:bg-ambre"
                  }`}
                >
                  {wasSent ? "Relance envoyée ✓" : "Envoyer une relance"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {relanceTarget && (
        <RelanceImpayeModal
          chantierId={relanceTarget.chantierId}
          clientId={relanceTarget.clientId}
          clientEmail={relanceTarget.clientEmail}
          clientPrenom={relanceTarget.clientNom.split(" ")[0]}
          chantiertTitre={relanceTarget.chantiertTitre}
          montantEnRetard={relanceTarget.montant}
          joursRetard={relanceTarget.joursRetard}
          nbRelancesDejaEnvoyees={relanceTarget.nbRelances}
          onClose={() => setRelanceTarget(null)}
          onSent={() => {
            setSentIds((prev) => new Set([...prev, relanceTarget.paiementId]));
            setRelanceTarget(null);
          }}
        />
      )}
    </div>
  );
}
