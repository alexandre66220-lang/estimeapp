"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Images,
  Spinner,
  WarningCircle,
  DownloadSimple,
  ShareNetwork,
} from "@phosphor-icons/react";

type Props = {
  chantierId: string;
  /** URL signée de l'image déjà générée (si existante en DB) */
  existingUrl: string | null;
};

export function AvantApresGenerateur({ chantierId, existingUrl }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(existingUrl);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/avant-apres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chantierId }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? "Erreur de génération.");
      } else {
        setImageUrl(json.url);
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!imageUrl) return;
    try {
      const blob = await fetch(imageUrl).then((r) => r.blob());
      const file = new File([blob], "avant-apres.jpg", { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Avant/Après chantier — Estime" });
        return;
      }
    } catch {
      // fallback : téléchargement
    }
    // Fallback : téléchargement direct
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "avant-apres.jpg";
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-4">
        <Images size={18} className="text-braise" aria-hidden="true" />
        <h2 className="font-display text-lg font-bold text-dusk">Visuel avant/après</h2>
      </div>
      <p className="text-dusk/50 text-sm mb-5">
        Générez un visuel 1080&times;1080 px prêt à publier sur Instagram, avec votre logo en
        filigrane.
      </p>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          <WarningCircle size={16} weight="bold" className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {imageUrl && (
        <div className="mb-5">
          <div className="relative aspect-square w-full max-w-sm rounded-xl overflow-hidden border border-dusk/8 bg-dust">
            <Image
              src={imageUrl}
              alt="Visuel avant/après généré"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <a
              href={imageUrl}
              download="avant-apres.jpg"
              className="inline-flex items-center gap-2 text-dusk font-medium text-sm px-5 py-2.5 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
            >
              <DownloadSimple size={16} aria-hidden="true" />
              Télécharger
            </a>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-dusk font-medium text-sm px-5 py-2.5 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
            >
              <ShareNetwork size={16} aria-hidden="true" />
              Partager
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
      >
        {loading ? (
          <>
            <Spinner size={16} className="animate-spin" aria-hidden="true" />
            Génération en cours…
          </>
        ) : imageUrl ? (
          <>
            <Images size={16} aria-hidden="true" />
            Régénérer
          </>
        ) : (
          <>
            <Images size={16} aria-hidden="true" />
            Générer avant/après
          </>
        )}
      </button>
    </div>
  );
}
