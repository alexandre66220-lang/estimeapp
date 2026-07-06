"use client";

import { useRef, useTransition, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { saveObjectifAnnuel } from "@/app/actions/finances";

export function ObjectifAnnuelForm({ objectif }: { objectif: number | null }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(inputRef.current?.value ?? "0");
    if (isNaN(val) || val < 0) return;
    setSaved(false);
    startTransition(async () => {
      await saveObjectifAnnuel(val);
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
      <input
        ref={inputRef}
        type="number"
        min="0"
        step="1000"
        defaultValue={objectif ?? ""}
        placeholder="Ex : 80 000"
        className="w-full sm:w-44 px-3 py-2 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-braise text-white text-sm font-semibold rounded-full hover:bg-ambre transition-colors duration-200 disabled:opacity-60 shrink-0"
      >
        {pending ? <CircleNotch size={14} className="animate-spin" /> : null}
        {pending ? "…" : "Enregistrer"}
      </button>
      {saved && !pending && (
        <span className="text-xs text-green-600 font-medium">Objectif mis à jour !</span>
      )}
    </form>
  );
}
