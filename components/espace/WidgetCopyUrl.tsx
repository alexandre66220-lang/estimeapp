"use client";

import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

export function WidgetCopyUrl({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://estime-app.com/widget/${userId}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-3">
      <p className="text-dusk/55 text-sm mb-2">URL de votre widget iOS :</p>
      <div className="flex items-center gap-2">
        <span className="flex-1 font-mono text-xs bg-dust/60 border border-dusk/10 rounded-xl px-3 py-2 text-dusk/70 truncate">
          {url}
        </span>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dusk text-white text-xs font-semibold hover:bg-dusk/80 transition-colors"
          aria-label="Copier l'URL du widget"
        >
          {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
          {copied ? "Copié !" : "Copier"}
        </button>
      </div>
    </div>
  );
}
