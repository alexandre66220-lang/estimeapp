"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { modifierClient, marquerInteraction } from "@/app/actions/backoffice-clients";
import { ClientForm } from "./ClientForm";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";
import { STATUT_TONE, statutLabel } from "@/lib/backoffice/client-statut";
import type { AdminClient } from "@/lib/backoffice/clients";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function ClientDetailPanel({ client }: { client: AdminClient }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <Card title="Modifier le client">
        <div className="p-5">
          <ClientForm
            action={(formData) => modifierClient(client.id, formData)}
            initialValues={client}
            submitLabel="Enregistrer"
            onDone={() => setEditing(false)}
          />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card
        title={client.nom}
        action={
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150"
          >
            Modifier
          </button>
        }
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <StatusBadge tone={STATUT_TONE[client.statut]} label={statutLabel(client.statut)} />
          </div>

          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[11px] text-[#55555A] uppercase tracking-wide mb-0.5">Entreprise</dt>
              <dd className="text-[#EDEDED]">{client.entreprise ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-[#55555A] uppercase tracking-wide mb-0.5">Email</dt>
              <dd className="text-[#EDEDED]">{client.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-[#55555A] uppercase tracking-wide mb-0.5">Téléphone</dt>
              <dd className="text-[#EDEDED]">{client.telephone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-[#55555A] uppercase tracking-wide mb-0.5">Client depuis</dt>
              <dd className="text-[#EDEDED]">{formatDate(client.created_at)}</dd>
            </div>
          </dl>

          {client.notes && (
            <div>
              <p className="text-[11px] text-[#55555A] uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-[#EDEDED] whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>
      </Card>

      <Card title="Historique">
        <div className="p-5 flex items-center justify-between gap-3">
          <p className="text-sm text-[#8B8B8D]">
            Dernière interaction : <span className="text-[#EDEDED]">{formatDate(client.derniere_interaction)}</span>
          </p>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => marquerInteraction(client.id))}
            className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50 shrink-0"
          >
            {isPending ? "…" : "Marquer une interaction aujourd'hui"}
          </button>
        </div>
      </Card>

      <Card title="Devis">
        <div className="p-5 flex items-center justify-between gap-3">
          <p className="text-sm text-[#55555A]">Créer un devis pour ce client</p>
          <Link
            href={`/backoffice/devis/nouveau?client=${client.id}`}
            className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 shrink-0"
          >
            Créer un devis
          </Link>
        </div>
      </Card>
    </div>
  );
}
