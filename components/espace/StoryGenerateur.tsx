"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FilmStrip,
  Spinner,
  WarningCircle,
  DownloadSimple,
  ShareNetwork,
  CheckSquare,
} from "@phosphor-icons/react";

type Props = {
  chantierId: string;
  photoAvantUrl: string | null;
  photoApresUrl: string | null;
};

export function StoryGenerateur({ chantierId, photoAvantUrl, photoApresUrl }: Props) {
  const hasBoth = Boolean(photoAvantUrl && photoApresUrl);
  const defaultChoice: "avant" | "apres" = photoApresUrl ? "apres" : "avant";

  const [photoChoice, setPhotoChoice] = useState<"avant" | "apres">(defaultChoice);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storyUrl, setStoryUrl] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chantier/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chantierId, photoChoice }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? "Erreur de génération.");
      } else {
        setStoryUrl(json.url);
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!storyUrl) return;
    try {
      const blob = await fetch(storyUrl).then((r) => r.blob());
      const file = new File([blob], "story.jpg", { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Story Instagram, Estime" });
        return;
      }
    } catch {
      // fallback
    }
    const link = document.createElement("a");
    link.href = storyUrl;
    link.download = "story.jpg";
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-4">
        <FilmStrip size={18} className="text-braise" aria-hidden="true" />
        <h2 className="font-display text-lg font-bold text-dusk">Story Instagram</h2>
      </div>
      <p className="text-dusk/50 text-sm mb-5">
        Générez une story verticale 1080&times;1920 px prête à publier, avec votre logo et
        un call-to-action.
      </p>

      {/* Sélecteur de photo (seulement si les deux sont disponibles) */}
      {hasBoth && (
        <div className="mb-5">
          <p className="text-sm font-medium text-dusk/70 mb-2">
            Photo à utiliser pour la story :
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["avant", "apres"] as const).map((choice) => {
              const url = choice === "avant" ? photoAvantUrl : photoApresUrl;
              const isSelected = photoChoice === choice;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setPhotoChoice(choice)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ambre/50 ${
                    isSelected
                      ? "border-ambre shadow-sm"
                      : "border-dusk/10 hover:border-dusk/25"
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Utiliser la photo ${choice === "avant" ? "Avant" : "Après"}`}
                >
                  <div className="aspect-[3/4]">
                    <Image
                      src={url!}
                      alt={choice === "avant" ? "Photo avant" : "Photo après"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 40vw, 200px"
                      unoptimized
                    />
                  </div>
                  {/* Badge sélectionné */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-ambre rounded-full p-0.5">
                      <CheckSquare size={16} weight="fill" className="text-white" aria-hidden="true" />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                    <p className="text-white text-xs font-semibold uppercase tracking-wide">
                      {choice === "avant" ? "Avant" : "Après"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          <WarningCircle size={16} weight="bold" className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Aperçu story */}
      {storyUrl && (
        <div className="mb-5 flex flex-col sm:flex-row items-start gap-5">
          {/* Aperçu 9:16 réduit */}
          <div className="relative w-40 shrink-0 rounded-xl overflow-hidden border border-dusk/8 bg-dust shadow-sm"
               style={{ aspectRatio: "9/16" }}>
            <Image
              src={storyUrl}
              alt="Aperçu story générée"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-1">
            <a
              href={storyUrl}
              download="story-instagram.jpg"
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
              Partager sur Instagram
            </button>
          </div>
        </div>
      )}

      {/* Bouton générer */}
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
        ) : storyUrl ? (
          <>
            <FilmStrip size={16} aria-hidden="true" />
            Régénérer
          </>
        ) : (
          <>
            <FilmStrip size={16} aria-hidden="true" />
            Générer une story
          </>
        )}
      </button>
    </div>
  );
}
