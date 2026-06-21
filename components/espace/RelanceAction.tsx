"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CircleNotch,
  WarningCircle,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

async function sendRelance(chantierId: string) {
  const response = await fetch("/api/envoyer-relance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chantierId }),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error ?? "L'envoi de la relance a échoué.");
  }
}

export default function RelanceAction({
  chantierId,
  isTermine,
  termineAt,
}: {
  chantierId: string;
  isTermine: boolean;
  termineAt: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleMarquerTermine() {
    setStatus("loading");
    setErrorMessage(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("chantiers")
      .update({ statut: "termine", termine_at: new Date().toISOString() })
      .eq("id", chantierId);

    if (updateError) {
      setStatus("error");
      setErrorMessage("La mise à jour du chantier a échoué. Réessayez.");
      return;
    }

    try {
      await sendRelance(chantierId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    } finally {
      router.refresh();
    }
  }

  async function handleResend() {
    setStatus("loading");
    setErrorMessage(null);
    try {
      await sendRelance(chantierId);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    }
  }

  if (isTermine) {
    const formatted = termineAt
      ? new Date(termineAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-2 bg-dusk/5 text-dusk/70 text-sm font-medium px-4 py-2 rounded-full">
          <Check size={16} weight="bold" className="text-ambre" aria-hidden="true" />
          {formatted ? `Terminé le ${formatted}` : "Terminé"}
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={status === "loading"}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-dusk/60 hover:text-dusk transition-colors duration-200 disabled:opacity-50"
        >
          {status === "loading" ? (
            <CircleNotch size={14} weight="bold" className="animate-spin" aria-hidden="true" />
          ) : (
            <ArrowsClockwise size={14} weight="bold" aria-hidden="true" />
          )}
          Renvoyer la relance
        </button>
        {status === "error" && errorMessage && (
          <p className="flex items-start gap-1.5 text-sm text-red-700 w-full">
            <WarningCircle size={14} weight="bold" className="shrink-0 mt-0.5" aria-hidden="true" />
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleMarquerTermine}
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 disabled:opacity-70"
      >
        {status === "loading" ? (
          <CircleNotch size={18} weight="bold" className="animate-spin" aria-hidden="true" />
        ) : (
          <Check size={18} weight="bold" aria-hidden="true" />
        )}
        {status === "loading" ? "Envoi de la relance..." : "Marquer comme terminé"}
      </button>
      {status === "error" && errorMessage && (
        <p className="flex items-start gap-2 mt-3 text-sm text-red-700">
          <WarningCircle size={16} weight="bold" className="shrink-0 mt-0.5" aria-hidden="true" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
