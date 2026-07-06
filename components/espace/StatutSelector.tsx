"use client";

import { useOptimistic, useTransition } from "react";
import { updateClientStatut } from "@/app/actions/crm";
import { COLONNES } from "./KanbanBoard";
import type { ClientStatut } from "@/lib/supabase/clients";

export function StatutSelector({
  clientId,
  currentStatut,
}: {
  clientId: string;
  currentStatut: ClientStatut;
}) {
  const [, startTransition] = useTransition();
  const [statut, setOptimisticStatut] = useOptimistic(currentStatut);

  const handleChange = (newStatut: ClientStatut) => {
    startTransition(async () => {
      setOptimisticStatut(newStatut);
      await updateClientStatut(clientId, newStatut);
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {COLONNES.map((col) => {
        const isActive = statut === col.statut;
        return (
          <button
            key={col.statut}
            type="button"
            onClick={() => handleChange(col.statut)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 border ${
              isActive
                ? `${col.bg} ${col.couleur} border-current/20 shadow-sm`
                : "bg-transparent text-dusk/40 border-dusk/10 hover:border-dusk/20 hover:text-dusk/60"
            }`}
            aria-pressed={isActive}
          >
            <span className={`w-2 h-2 rounded-full ${isActive ? col.dot : "bg-dusk/20"}`} aria-hidden="true" />
            {col.label}
          </button>
        );
      })}
    </div>
  );
}
