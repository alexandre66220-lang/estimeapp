"use client";

import { useEffect, useState } from "react";
import {
  ClipboardText,
  Check,
  FacebookLogo,
  InstagramLogo,
  DownloadSimple,
} from "@phosphor-icons/react";

export function ShareActions({
  caption,
  imageUrl,
}: {
  caption: string;
  imageUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [instagramHint, setInstagramHint] = useState(false);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(caption)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleOpenInstagram() {
    if (isMobile) {
      window.location.href = "instagram://camera";
    } else {
      setInstagramHint(true);
      setTimeout(() => setInstagramHint(false), 4000);
    }
  }

  async function handleDownload() {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "photo-chantier.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2 className="font-display text-sm font-bold text-dusk mb-3">Partager</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
        >
          {copied ? (
            <Check size={18} weight="bold" aria-hidden="true" />
          ) : (
            <ClipboardText size={18} weight="bold" aria-hidden="true" />
          )}
          {copied ? "Copié !" : "Copier le texte"}
        </button>

        <button
          type="button"
          onClick={handleShareFacebook}
          className="inline-flex items-center justify-center gap-2 text-dusk font-medium text-sm px-5 py-3 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
        >
          <FacebookLogo size={18} weight="fill" className="text-ambre" aria-hidden="true" />
          Partager sur Facebook
        </button>

        <button
          type="button"
          onClick={handleOpenInstagram}
          className="inline-flex items-center justify-center gap-2 text-dusk font-medium text-sm px-5 py-3 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
        >
          <InstagramLogo size={18} weight="fill" className="text-ambre" aria-hidden="true" />
          Ouvrir Instagram
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 text-dusk font-medium text-sm px-5 py-3 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
        >
          <DownloadSimple size={18} weight="bold" aria-hidden="true" />
          Télécharger la photo
        </button>
      </div>

      {instagramHint && (
        <p className="mt-3 text-dusk/55 text-xs">
          Instagram ne permet pas le partage direct depuis le web. Copiez le
          texte et ouvrez Instagram pour publier.
        </p>
      )}
    </div>
  );
}
