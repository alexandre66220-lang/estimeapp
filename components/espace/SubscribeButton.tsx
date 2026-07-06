"use client";

import { useState } from "react";
import { CircleNotch, WarningCircle } from "@phosphor-icons/react";

export default function SubscribeButton({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });
      const json = await response.json();
      if (!response.ok || !json.url) {
        throw new Error(json.error ?? "Impossible de démarrer le paiement.");
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`${className} disabled:opacity-70`}
      >
        {loading && <CircleNotch size={18} weight="bold" className="animate-spin" aria-hidden="true" />}
        {loading ? "Redirection vers le paiement..." : label}
      </button>
      {error && (
        <div className="flex items-center gap-2 mt-3 text-red-700 text-sm">
          <WarningCircle size={16} weight="bold" className="shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
