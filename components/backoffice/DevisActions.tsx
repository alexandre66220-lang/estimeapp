"use client";

import { useTransition } from "react";
import Link from "next/link";
import { FilePdf } from "@phosphor-icons/react";
import { changerStatutDevis } from "@/app/actions/backoffice-devis";
import type { DevisStatut } from "@/lib/backoffice/devis-statut";

const TRANSITIONS: Record<DevisStatut, { to: DevisStatut; label: string }[]> = {
  brouillon: [{ to: "envoye", label: "Marquer comme envoyé" }],
  envoye: [
    { to: "accepte", label: "Marquer comme accepté" },
    { to: "refuse", label: "Marquer comme refusé" },
  ],
  accepte: [],
  refuse: [{ to: "envoye", label: "Renvoyer" }],
  expire: [],
};

export function DevisActions({ devisId, statut }: { devisId: string; statut: DevisStatut }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/api/backoffice/devis/${devisId}/pdf`}
        target="_blank"
        className="flex items-center gap-1.5 text-xs font-medium text-[#8B8B8D] px-3 py-1.5 rounded-md border border-[#232326] hover:bg-[#232326] hover:text-[#EDEDED] transition-colors duration-150"
      >
        <FilePdf size={14} weight="bold" />
        Télécharger le PDF
      </Link>
      {TRANSITIONS[statut].map((t) => (
        <button
          key={t.to}
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => changerStatutDevis(devisId, t.to))}
          className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50"
        >
          {isPending ? "…" : t.label}
        </button>
      ))}
    </div>
  );
}
