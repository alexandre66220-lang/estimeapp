"use client";

import { useTransition, useState } from "react";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { recalculerAlterEgoManuel } from "@/app/actions/alter-ego";

export function RecalculerAlterEgoButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await recalculerAlterEgoManuel();
      if (result.error) setError(result.error);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 text-dusk font-medium text-sm px-5 py-2.5 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
      >
        <ArrowsClockwise size={16} weight="bold" className={isPending ? "animate-spin" : ""} />
        {isPending ? "Analyse en cours…" : "Recalculer maintenant"}
      </button>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
