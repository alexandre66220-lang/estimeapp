"use client";

import { useState } from "react";
import { Brain, X } from "@phosphor-icons/react";

export function AlterEgoAlerteBandeau({
  description,
  onDismiss,
}: {
  description: string;
  onDismiss?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="rounded-xl bg-braise/5 border border-braise/20 p-4 flex items-start gap-3">
      <Brain size={20} className="text-braise shrink-0 mt-0.5" weight="fill" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-dusk mb-1">
          Ton alter ego détecte quelque chose
        </p>
        <p className="text-sm text-dusk/70 leading-relaxed">
          {expanded ? description : "Basé sur tes décisions passées, une décision similaire pourrait poser problème."}
        </p>
        <div className="flex items-center gap-4 mt-2">
          {!expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-xs font-semibold text-braise hover:underline"
            >
              Voir le détail
            </button>
          )}
          <span className="text-xs text-dusk/40">Tu as quand même le dernier mot.</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className="text-dusk/30 hover:text-dusk/60 transition-colors shrink-0"
        aria-label="Ignorer l'alerte"
      >
        <X size={16} />
      </button>
    </div>
  );
}
