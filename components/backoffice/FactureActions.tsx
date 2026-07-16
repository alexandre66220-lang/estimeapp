"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FilePdf } from "@phosphor-icons/react";
import { marquerPayee, changerStatutFacture } from "@/app/actions/backoffice-factures";
import type { FactureStatut } from "@/lib/backoffice/facture-statut";

export function FactureActions({ factureId, statut }: { factureId: string; statut: FactureStatut }) {
  const [payingOpen, setPayingOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/api/backoffice/factures/${factureId}/pdf`}
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-medium text-[#8B8B8D] px-3 py-1.5 rounded-md border border-[#232326] hover:bg-[#232326] hover:text-[#EDEDED] transition-colors duration-150"
        >
          <FilePdf size={14} weight="bold" />
          Télécharger le PDF
        </Link>

        {statut !== "payee" && !payingOpen && (
          <button
            type="button"
            onClick={() => setPayingOpen(true)}
            className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150"
          >
            Marquer comme payée
          </button>
        )}

        {statut === "envoyee" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => changerStatutFacture(factureId, "en_retard"))}
            className="text-xs font-medium text-[#F87171] px-3 py-1.5 rounded-md border border-[#F87171]/30 hover:bg-[#F87171]/10 transition-colors duration-150 disabled:opacity-50"
          >
            Marquer en retard
          </button>
        )}
      </div>

      {payingOpen && (
        <form
          action={(formData) => {
            startTransition(async () => {
              await marquerPayee(factureId, formData.get("date_paiement") as string);
              setPayingOpen(false);
            });
          }}
          className="flex items-end gap-2 bg-[#0C0C0D] border border-[#232326] rounded-md p-3"
        >
          <div>
            <label className="block text-[11px] text-[#55555A] mb-1">Date de paiement</label>
            <input
              type="date"
              name="date_paiement"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="bg-[#18181B] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50"
          >
            {isPending ? "…" : "Confirmer"}
          </button>
          <button
            type="button"
            onClick={() => setPayingOpen(false)}
            className="text-xs font-medium text-[#8B8B8D] px-3 py-1.5 rounded-md hover:bg-[#232326] transition-colors duration-150"
          >
            Annuler
          </button>
        </form>
      )}
    </div>
  );
}
