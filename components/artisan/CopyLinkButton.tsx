"use client";

import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback : sélectionner le texte
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 text-dusk font-medium text-sm px-4 py-2 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
    >
      {copied ? (
        <>
          <Check size={15} weight="bold" className="text-braise" />
          Copié !
        </>
      ) : (
        <>
          <Copy size={15} />
          Copier le lien
        </>
      )}
    </button>
  );
}
