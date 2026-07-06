"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowClockwise, CircleNotch, Check, WarningCircle } from "@phosphor-icons/react";

export function GenererRapportButton({ currentMonthKey }: { currentMonthKey: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleGenerate() {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/rapports/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate: new Date().toISOString() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Erreur lors de la génération");
      }
      setStatus("success");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={status === "loading" || status === "success"}
        className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
      >
        {status === "loading" && <CircleNotch size={15} className="animate-spin" />}
        {status === "success" && <Check size={15} weight="bold" />}
        {status === "idle" && <ArrowClockwise size={15} weight="bold" />}
        {status === "loading" && "Génération en cours…"}
        {status === "success" && "Rapport généré !"}
        {(status === "idle" || status === "error") && "Générer le rapport du mois"}
      </button>
      {status === "error" && errorMsg && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <WarningCircle size={13} weight="bold" />
          {errorMsg}
        </p>
      )}
    </div>
  );
}
