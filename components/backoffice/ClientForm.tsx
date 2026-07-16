"use client";

import { useTransition } from "react";
import { STATUTS } from "@/lib/backoffice/client-statut";
import type { AdminClient } from "@/lib/backoffice/clients";

export function ClientForm({
  action,
  initialValues,
  submitLabel,
  onDone,
}: {
  action: (formData: FormData) => Promise<void>;
  initialValues?: Partial<AdminClient>;
  submitLabel: string;
  onDone?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await action(formData);
          onDone?.();
        });
      }}
      className="space-y-3"
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-[#55555A] mb-1">Nom *</label>
          <input
            type="text"
            name="nom"
            required
            defaultValue={initialValues?.nom}
            className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
          />
        </div>
        <div>
          <label className="block text-[11px] text-[#55555A] mb-1">Entreprise</label>
          <input
            type="text"
            name="entreprise"
            defaultValue={initialValues?.entreprise ?? ""}
            className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
          />
        </div>
        <div>
          <label className="block text-[11px] text-[#55555A] mb-1">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={initialValues?.email ?? ""}
            className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
          />
        </div>
        <div>
          <label className="block text-[11px] text-[#55555A] mb-1">Téléphone</label>
          <input
            type="tel"
            name="telephone"
            defaultValue={initialValues?.telephone ?? ""}
            className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
          />
        </div>
        <div>
          <label className="block text-[11px] text-[#55555A] mb-1">Statut</label>
          <select
            name="statut"
            defaultValue={initialValues?.statut ?? "prospect"}
            className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
          >
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-[#55555A] mb-1">Notes</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={initialValues?.notes ?? ""}
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50 resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50"
        >
          {isPending ? "…" : submitLabel}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="text-xs font-medium text-[#8B8B8D] px-3 py-1.5 rounded-md hover:bg-[#232326] transition-colors duration-150"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
