"use client";

import { useState, useTransition } from "react";
import { creerFeatureFlag, toggleFeatureFlag } from "@/app/actions/backoffice-feature-flags";
import type { AdminFeatureFlag } from "@/lib/backoffice/feature-flags";

function Toggle({
  actif,
  onChange,
  label,
}: {
  actif: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!actif)}
      className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-md transition-colors duration-150 ${
        actif ? "bg-[#4ADE80]/10 text-[#4ADE80]" : "bg-[#232326] text-[#8B8B8D]"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${actif ? "bg-[#4ADE80]" : "bg-[#55555A]"}`} />
      {label}
    </button>
  );
}

export function FeatureFlagsPanel({ flags }: { flags: AdminFeatureFlag[] }) {
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string, champ: "actif_pour_moi" | "actif_global", valeur: boolean) {
    startTransition(() => toggleFeatureFlag(id, champ, valeur));
  }

  return (
    <div>
      <div className="px-5 py-3 border-b border-[#232326] flex items-center justify-between">
        <p className="text-xs text-[#55555A]">
          Active une feature uniquement pour ton compte avant de la déployer pour tous les utilisateurs Estime.
        </p>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150 shrink-0"
        >
          + Nouveau flag
        </button>
      </div>

      {adding && (
        <form
          action={(formData) => {
            startTransition(async () => {
              await creerFeatureFlag(formData);
              setAdding(false);
            });
          }}
          className="px-5 py-4 border-b border-[#232326] grid sm:grid-cols-3 gap-2 items-end"
        >
          <div className="sm:col-span-1">
            <label className="block text-[11px] text-[#55555A] mb-1">Nom (identifiant)</label>
            <input
              type="text"
              name="nom"
              required
              placeholder="nouvelle-generation-post"
              className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-[11px] text-[#55555A] mb-1">Description</label>
            <input
              type="text"
              name="description"
              className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50 h-fit"
          >
            Créer
          </button>
        </form>
      )}

      {flags.length === 0 ? (
        <p className="px-5 py-6 text-sm text-[#55555A]">Aucun feature flag pour l&apos;instant.</p>
      ) : (
        <ul className="divide-y divide-[#232326]">
          {flags.map((f) => (
            <li key={f.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-[#EDEDED] font-mono truncate">{f.nom}</p>
                {f.description && <p className="text-xs text-[#55555A] truncate">{f.description}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <Toggle
                  actif={f.actif_pour_moi}
                  onChange={(v) => handleToggle(f.id, "actif_pour_moi", v)}
                  label="Pour moi"
                />
                <Toggle
                  actif={f.actif_global}
                  onChange={(v) => handleToggle(f.id, "actif_global", v)}
                  label="Global"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
