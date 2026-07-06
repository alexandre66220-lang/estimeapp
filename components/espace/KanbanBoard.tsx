"use client";

import { useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import {
  Crown,
  Plus,
  ArrowRight,
  ArrowLeft,
  User,
  CurrencyEur,
  Clock,
} from "@phosphor-icons/react";
import { updateClientStatut } from "@/app/actions/crm";
import type { ClientStatut, Client } from "@/lib/supabase/clients";

// ── Config des colonnes ────────────────────────────────────────────────────

export const COLONNES: {
  statut: ClientStatut;
  label: string;
  couleur: string;
  bg: string;
  dot: string;
}[] = [
  {
    statut: "prospect",
    label: "Prospect",
    couleur: "text-dusk/70",
    bg: "bg-dust",
    dot: "bg-dusk/30",
  },
  {
    statut: "devis_envoye",
    label: "Devis envoyé",
    couleur: "text-blue-700",
    bg: "bg-blue-50",
    dot: "bg-blue-400",
  },
  {
    statut: "chantier_en_cours",
    label: "En cours",
    couleur: "text-ambre",
    bg: "bg-ambre/10",
    dot: "bg-ambre",
  },
  {
    statut: "termine",
    label: "Terminé",
    couleur: "text-emerald-700",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
  },
  {
    statut: "perdu",
    label: "Perdu",
    couleur: "text-red-600",
    bg: "bg-red-50",
    dot: "bg-red-400",
  },
];

// ── Card client ─────────────────────────────────────────────────────────────

function ClientCard({
  client,
  colIndex,
  totalCols,
  onMove,
  moving,
}: {
  client: Client;
  colIndex: number;
  totalCols: number;
  onMove: (clientId: string, statut: ClientStatut) => void;
  moving: boolean;
}) {
  const canGoLeft = colIndex > 0;
  const canGoRight = colIndex < totalCols - 1;

  const relativeTime = (iso: string | null) => {
    if (!iso) return null;
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 30) return `Il y a ${days} j`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  };

  return (
    <div
      className={`bg-white rounded-xl border border-dusk/8 p-4 shadow-sm transition-opacity duration-150 ${
        moving ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/espace/clients/${client.id}`}
          className="font-semibold text-sm text-dusk hover:text-braise transition-colors leading-tight"
        >
          {client.prenom} {client.nom}
          {client.est_vip && (
            <Crown
              size={13}
              weight="fill"
              className="inline-block ml-1 text-ambre relative -top-0.5"
              aria-label="Client VIP"
            />
          )}
        </Link>
      </div>

      {/* Infos */}
      <div className="space-y-1 mb-3">
        {client.montant_estime && (
          <p className="flex items-center gap-1 text-xs text-dusk/55">
            <CurrencyEur size={11} aria-hidden="true" />
            {client.montant_estime.toLocaleString("fr-FR")} €
          </p>
        )}
        {client.source && (
          <p className="flex items-center gap-1 text-xs text-dusk/45">
            <User size={11} aria-hidden="true" />
            {client.source}
          </p>
        )}
        {client.derniere_interaction && (
          <p className="flex items-center gap-1 text-xs text-dusk/35">
            <Clock size={11} aria-hidden="true" />
            {relativeTime(client.derniere_interaction)}
          </p>
        )}
      </div>

      {/* Flèches de déplacement */}
      <div className="flex items-center gap-1.5">
        {canGoLeft && (
          <button
            type="button"
            onClick={() => onMove(client.id, COLONNES[colIndex - 1].statut)}
            disabled={moving}
            className="flex items-center gap-1 text-[11px] text-dusk/50 hover:text-dusk px-2 py-1 rounded-full hover:bg-dusk/5 transition-colors disabled:opacity-40"
            aria-label={`Déplacer vers ${COLONNES[colIndex - 1].label}`}
          >
            <ArrowLeft size={11} />
            {COLONNES[colIndex - 1].label}
          </button>
        )}
        <div className="flex-1" />
        {canGoRight && (
          <button
            type="button"
            onClick={() => onMove(client.id, COLONNES[colIndex + 1].statut)}
            disabled={moving}
            className="flex items-center gap-1 text-[11px] text-dusk/50 hover:text-dusk px-2 py-1 rounded-full hover:bg-dusk/5 transition-colors disabled:opacity-40"
            aria-label={`Déplacer vers ${COLONNES[colIndex + 1].label}`}
          >
            {COLONNES[colIndex + 1].label}
            <ArrowRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Kanban board ────────────────────────────────────────────────────────────

type OptimisticClient = Client & { _moving?: boolean };

export function KanbanBoard({
  initialClients,
  onAddProspect,
}: {
  initialClients: Client[];
  onAddProspect: () => void;
}) {
  const [, startTransition] = useTransition();
  const [movingId, setMovingId] = useState<string | null>(null);

  const [clients, optimisticMove] = useOptimistic(
    initialClients,
    (state: Client[], { id, statut }: { id: string; statut: ClientStatut }) =>
      state.map((c) => (c.id === id ? { ...c, statut } : c))
  );

  const handleMove = (clientId: string, newStatut: ClientStatut) => {
    setMovingId(clientId);
    startTransition(async () => {
      optimisticMove({ id: clientId, statut: newStatut });
      await updateClientStatut(clientId, newStatut);
      setMovingId(null);
    });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]" style={{ scrollSnapType: "x mandatory" }}>
      {COLONNES.map((col, colIndex) => {
        const colClients = clients.filter((c) => c.statut === col.statut);
        return (
          <div
            key={col.statut}
            className="flex-none w-72 flex flex-col"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* En-tête colonne */}
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 ${col.bg}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} aria-hidden="true" />
                <span className={`text-sm font-semibold ${col.couleur}`}>{col.label}</span>
              </div>
              <span className="text-xs text-dusk/40 font-medium tabular-nums">
                {colClients.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2.5">
              {colClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  colIndex={colIndex}
                  totalCols={COLONNES.length}
                  onMove={handleMove}
                  moving={movingId === client.id}
                />
              ))}

              {/* Bouton Ajouter prospect (1ère colonne seulement) */}
              {col.statut === "prospect" && (
                <button
                  type="button"
                  onClick={onAddProspect}
                  className="w-full flex items-center gap-2 text-sm text-dusk/40 hover:text-dusk px-3 py-3 rounded-xl border-2 border-dashed border-dusk/10 hover:border-dusk/25 transition-colors duration-200"
                >
                  <Plus size={15} aria-hidden="true" />
                  Ajouter un prospect
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
