"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { creerClient } from "@/app/actions/backoffice-clients";
import { ClientForm } from "./ClientForm";
import { StatusBadge } from "./StatusBadge";
import { STATUT_TONE, statutLabel, type ClientStatut } from "@/lib/backoffice/client-statut";
import type { AdminClient } from "@/lib/backoffice/clients";

export function ClientsListPanel({
  clients,
  activeStatut,
}: {
  clients: AdminClient[];
  activeStatut?: ClientStatut;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            href="/backoffice/clients"
            className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors duration-150 ${
              !activeStatut
                ? "bg-[#4ADE80]/10 text-[#4ADE80]"
                : "text-[#8B8B8D] hover:bg-[#18181B]"
            }`}
          >
            Tous
          </Link>
          {(["prospect", "devis_envoye", "signe", "en_cours", "livre"] as ClientStatut[]).map((s) => (
            <Link
              key={s}
              href={`/backoffice/clients?statut=${s}`}
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors duration-150 ${
                activeStatut === s ? "bg-[#4ADE80]/10 text-[#4ADE80]" : "text-[#8B8B8D] hover:bg-[#18181B]"
              }`}
            >
              {statutLabel(s)}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150 shrink-0"
        >
          <Plus size={14} weight="bold" />
          Ajouter
        </button>
      </div>

      {adding && (
        <div className="bg-[#18181B] border border-[#232326] rounded-[10px] p-5 mb-4">
          <ClientForm action={creerClient} submitLabel="Créer le client" onDone={() => setAdding(false)} />
        </div>
      )}

      <div className="bg-[#18181B] border border-[#232326] rounded-[10px] overflow-hidden">
        {clients.length === 0 ? (
          <p className="px-5 py-6 text-sm text-[#55555A]">Aucun client pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-[#232326]">
            {clients.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/backoffice/clients/${c.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[#0C0C0D]/40 transition-colors duration-150"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-[#EDEDED] truncate">{c.nom}</p>
                    {c.entreprise && <p className="text-xs text-[#55555A] truncate">{c.entreprise}</p>}
                  </div>
                  <StatusBadge tone={STATUT_TONE[c.statut]} label={statutLabel(c.statut)} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
