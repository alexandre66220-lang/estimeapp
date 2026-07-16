"use client";

import { useTransition } from "react";
import { creerFactureDepuisDevis } from "@/app/actions/backoffice-factures";

export function ConvertirDevisButton({ devisId }: { devisId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => creerFactureDepuisDevis(devisId))}
      className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50"
    >
      {isPending ? "Conversion…" : "Convertir en facture"}
    </button>
  );
}
