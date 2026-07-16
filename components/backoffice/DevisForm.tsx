"use client";

import { useTransition } from "react";
import { creerDevis } from "@/app/actions/backoffice-devis";
import { LignesEditor } from "./LignesEditor";

export function DevisForm({
  clients,
  clientIdPreselectionne,
}: {
  clients: { id: string; nom: string }[];
  clientIdPreselectionne?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const dansUnMois = new Date();
  dansUnMois.setDate(dansUnMois.getDate() + 30);

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await creerDevis(formData);
        });
      }}
      className="space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-[#55555A] mb-1">Client *</label>
          <select
            name="client_id"
            required
            defaultValue={clientIdPreselectionne ?? ""}
            className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
          >
            <option value="" disabled>
              Sélectionner un client
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-[#55555A] mb-1">Valide jusqu&apos;au</label>
          <input
            type="date"
            name="date_validite"
            defaultValue={dansUnMois.toISOString().slice(0, 10)}
            className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
          />
        </div>
      </div>

      <div>
        <p className="block text-[11px] text-[#55555A] mb-1.5">Prestations</p>
        <LignesEditor />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-4 py-2 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50"
      >
        {isPending ? "Création…" : "Créer le devis"}
      </button>
    </form>
  );
}
