"use client";

import { useRef, useState, useTransition } from "react";
import { PencilSimple, Check, CircleNotch } from "@phosphor-icons/react";
import { updateMontantChantier } from "@/app/actions/finances";

export function MontantChantierForm({
  chantierId,
  montant,
}: {
  chantierId: string;
  montant: number;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(inputRef.current?.value ?? "0");
    if (isNaN(val)) return;
    startTransition(async () => {
      await updateMontantChantier(chantierId, val);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="number"
          min="0"
          step="100"
          defaultValue={montant}
          autoFocus
          className="w-28 px-2 py-1 rounded-lg border border-ambre/50 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-ambre/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-braise text-white"
        >
          {pending ? (
            <CircleNotch size={12} className="animate-spin" />
          ) : (
            <Check size={12} weight="bold" />
          )}
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-dusk">
        {montant.toLocaleString("fr-FR")} €
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Modifier le montant"
        className="w-6 h-6 flex items-center justify-center rounded-full text-dusk/30 hover:text-dusk/60 hover:bg-dusk/8 transition-colors"
      >
        <PencilSimple size={12} weight="bold" />
      </button>
    </div>
  );
}
