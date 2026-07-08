"use client";

import { useState, useTransition } from "react";
import { Check, Clock, Warning } from "@phosphor-icons/react";
import {
  marquerPaiementEncaisse,
  initPaiementsChantier,
} from "@/app/actions/paiements";

export interface Paiement {
  id: string;
  type: "acompte" | "intermediaire" | "solde" | "autre";
  montant: number;
  statut: "en_attente" | "encaisse" | "en_retard";
  date_prevue: string | null;
  date_encaissement: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  acompte: "Acompte (30%)",
  intermediaire: "Paiement intermédiaire (40%)",
  solde: "Solde (30%)",
};

function statutStyle(statut: string) {
  switch (statut) {
    case "encaisse":
      return { bg: "bg-green-50", text: "text-green-700", label: "Encaissé", Icon: Check };
    case "en_retard":
      return { bg: "bg-red-50", text: "text-red-600", label: "En retard", Icon: Warning };
    default:
      return { bg: "bg-dusk/5", text: "text-dusk/60", label: "En attente", Icon: Clock };
  }
}

function PaiementRow({
  p,
  onUpdate,
}: {
  p: Paiement;
  onUpdate: () => void;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [pending, startTransition] = useTransition();
  const { bg, text, label, Icon } = statutStyle(p.statut);

  function handleMarquer() {
    startTransition(async () => {
      await marquerPaiementEncaisse(p.id, date);
      setShowDatePicker(false);
      onUpdate();
    });
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-dusk/6 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-dusk">
          {TYPE_LABELS[p.type] ?? p.type}
        </p>
        <p className="text-xl font-bold text-dusk mt-0.5">
          {p.montant.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
        </p>
        {p.date_prevue && (
          <p className="text-xs text-dusk/45 mt-0.5">
            Prévu le{" "}
            {new Date(p.date_prevue).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
        {p.date_encaissement && p.statut === "encaisse" && (
          <p className="text-xs text-green-600 mt-0.5">
            Encaissé le{" "}
            {new Date(p.date_encaissement).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
          <Icon size={12} weight="bold" />
          {label}
        </span>

        {p.statut !== "encaisse" && (
          showDatePicker ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs px-2 py-1.5 rounded-lg border border-dusk/15 bg-white text-dusk focus:outline-none focus:ring-2 focus:ring-ambre/30"
              />
              <button
                onClick={handleMarquer}
                disabled={pending}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {pending ? "…" : "Confirmer"}
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-xs text-dusk/40 hover:text-dusk"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDatePicker(true)}
              className="text-xs font-medium text-dusk/60 hover:text-dusk border border-dusk/15 px-3 py-1.5 rounded-full hover:bg-dusk/5 transition-colors"
            >
              Marquer encaissé
            </button>
          )
        )}
      </div>
    </div>
  );
}

export function SuiviPaiements({
  chantierId,
  montantHT,
  tauxCharges,
  totalCouts,
  paiements: initialPaiements,
}: {
  chantierId: string;
  montantHT: number | null;
  tauxCharges: number;
  totalCouts: number;
  paiements: Paiement[];
}) {
  const [paiements, setPaiements] = useState<Paiement[]>(initialPaiements);
  const [pending, startTransition] = useTransition();

  const totalEncaisse = paiements
    .filter((p) => p.statut === "encaisse")
    .reduce((s, p) => s + p.montant, 0);

  const totalPaiements = paiements.reduce((s, p) => s + p.montant, 0);
  const resteAEncaisser = totalPaiements - totalEncaisse;
  const charges = montantHT ? (montantHT * tauxCharges) / 100 : 0;
  const margeNette = montantHT ? montantHT - totalCouts - charges : null;

  function handleInit() {
    if (!montantHT) return;
    startTransition(async () => {
      const res = await initPaiementsChantier(chantierId, montantHT);
      if (res.paiements) setPaiements(res.paiements as Paiement[]);
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-6">
      <h2 className="font-display text-lg font-bold text-dusk mb-1">
        Suivi des paiements
      </h2>
      <p className="text-dusk/50 text-sm mb-5">
        Suivez les acomptes, paiements intermédiaires et solde de ce chantier.
      </p>

      {paiements.length === 0 ? (
        <div className="text-center py-6">
          {!montantHT ? (
            <p className="text-sm text-dusk/50">
              Renseignez un montant HT sur ce chantier pour initialiser le suivi des paiements.
            </p>
          ) : (
            <>
              <p className="text-sm text-dusk/50 mb-4">
                Initialisez le suivi avec les 3 tranches standard (30% / 40% / 30%).
              </p>
              <button
                onClick={handleInit}
                disabled={pending}
                className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre disabled:opacity-50 transition-colors"
              >
                {pending ? "Initialisation…" : "Initialiser le suivi"}
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="divide-y divide-dusk/6">
            {paiements.map((p) => (
              <PaiementRow
                key={p.id}
                p={p}
                onUpdate={async () => {
                  // Reload from server action instead of full refresh
                  const res = await initPaiementsChantier(chantierId, montantHT ?? 0, true);
                  if (res.paiements) setPaiements(res.paiements as Paiement[]);
                }}
              />
            ))}
          </div>

          {/* Récapitulatif */}
          <div className="mt-5 pt-5 border-t border-dusk/8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-700 font-medium mb-1">Total encaissé</p>
              <p className="text-xl font-bold text-green-700">
                {totalEncaisse.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
              </p>
            </div>
            <div className="bg-ambre/10 rounded-xl p-4">
              <p className="text-xs text-braise font-medium mb-1">Reste à encaisser</p>
              <p className="text-xl font-bold text-braise">
                {resteAEncaisser.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
              </p>
            </div>
            {margeNette !== null && (
              <div className={`rounded-xl p-4 ${margeNette >= 0 ? "bg-dusk/5" : "bg-red-50"}`}>
                <p className={`text-xs font-medium mb-1 ${margeNette >= 0 ? "text-dusk/60" : "text-red-600"}`}>
                  Marge nette estimée
                </p>
                <p className={`text-xl font-bold ${margeNette >= 0 ? "text-dusk" : "text-red-600"}`}>
                  {margeNette.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
                </p>
                <p className="text-xs text-dusk/40 mt-0.5">
                  après {tauxCharges}% charges
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
