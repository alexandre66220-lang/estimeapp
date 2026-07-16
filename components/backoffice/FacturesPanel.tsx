"use client";

import { useState, useTransition } from "react";
import { Plus } from "@phosphor-icons/react";
import { ajouterFacture } from "@/app/actions/backoffice";
import { Card } from "./Card";
import { Table, TableHead, Th, Tr, Td } from "./Table";
import { StatusBadge, type StatusTone } from "./StatusBadge";
import type { Facture } from "@/lib/backoffice/queries";

const STATUT_LABEL: Record<Facture["statut"], { tone: StatusTone; label: string }> = {
  payee: { tone: "success", label: "Payée" },
  envoyee: { tone: "warning", label: "Envoyée" },
  en_retard: { tone: "error", label: "En retard" },
};

export function FacturesPanel({ factures }: { factures: Facture[] }) {
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Card
      title="Dernières factures"
      action={
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150"
        >
          <Plus size={14} weight="bold" />
          Ajouter
        </button>
      }
    >
      {adding && (
        <form
          action={(formData) => {
            startTransition(async () => {
              await ajouterFacture(formData);
              setAdding(false);
            });
          }}
          className="px-5 py-4 border-b border-[#232326] flex flex-wrap items-end gap-2"
        >
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[11px] text-[#55555A] mb-1">Client</label>
            <input
              type="text"
              name="client_nom"
              required
              className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
            />
          </div>
          <div className="w-28">
            <label className="block text-[11px] text-[#55555A] mb-1">Montant (€)</label>
            <input
              type="number"
              name="montant"
              step="0.01"
              min="0"
              required
              className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
            />
          </div>
          <div className="w-32">
            <label className="block text-[11px] text-[#55555A] mb-1">Statut</label>
            <select
              name="statut"
              defaultValue="envoyee"
              className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
            >
              <option value="envoyee">Envoyée</option>
              <option value="payee">Payée</option>
              <option value="en_retard">En retard</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50"
          >
            {isPending ? "…" : "Ajouter"}
          </button>
        </form>
      )}

      {factures.length === 0 ? (
        <p className="px-5 py-6 text-sm text-[#55555A]">Aucune facture pour l&apos;instant.</p>
      ) : (
        <Table>
          <TableHead>
            <Th>Client</Th>
            <Th align="right">Montant</Th>
            <Th align="right">Statut</Th>
          </TableHead>
          <tbody>
            {factures.map((f) => (
              <Tr key={f.id}>
                <Td>{f.client_nom}</Td>
                <Td align="right">{Number(f.montant).toLocaleString("fr-FR")} €</Td>
                <Td align="right">
                  <StatusBadge tone={STATUT_LABEL[f.statut].tone} label={STATUT_LABEL[f.statut].label} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
