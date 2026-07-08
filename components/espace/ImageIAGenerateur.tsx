"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkle, ArrowsClockwise, CircleNotch, Check, Warning } from "@phosphor-icons/react";

const THEMES_PAR_METIER: Record<string, { label: string; prompt: string }[]> = {
  peintre: [
    { label: "Peinture de façade", prompt: "Peintre professionnel en train de peindre une façade" },
    { label: "Intérieur rénové", prompt: "Intérieur rénové avec peinture fraîche moderne et lumineuse" },
    { label: "Artisan au travail", prompt: "Artisan peintre avec ses outils sur un chantier propre" },
  ],
  plombier: [
    { label: "Salle de bain neuve", prompt: "Plombier professionnel installant une salle de bain moderne" },
    { label: "Robinetterie neuve", prompt: "Robinetterie neuve installée proprement, chrome brillant" },
    { label: "Chauffe-eau installé", prompt: "Chauffe-eau neuf installé par un artisan professionnel" },
  ],
  electricien: [
    { label: "Tableau électrique", prompt: "Tableau électrique neuf et propre, câblage impeccable" },
    { label: "Électricien au travail", prompt: "Électricien professionnel sur un chantier résidentiel" },
    { label: "Installation moderne", prompt: "Installation électrique moderne dans une maison rénovée" },
  ],
  macon: [
    { label: "Façade rénovée", prompt: "Façade rénovée proprement, crépi neuf, finitions soignées" },
    { label: "Mur en pierre", prompt: "Mur en pierre rénové par un artisan maçon professionnel" },
    { label: "Maçon au travail", prompt: "Maçon professionnel sur un chantier de rénovation" },
  ],
  carreleur: [
    { label: "Carrelage posé", prompt: "Carrelage grand format posé impeccablement dans une salle de bain moderne" },
    { label: "Cuisine carrelée", prompt: "Carrelage cuisine posé avec précision par un artisan carreleur" },
    { label: "Sol rénové", prompt: "Sol rénové avec carrelage neuf, joints parfaits" },
  ],
  couvreur: [
    { label: "Toiture rénovée", prompt: "Toiture rénovée avec tuiles neuves, travail de couvreur professionnel" },
    { label: "Couvreur au travail", prompt: "Couvreur professionnel sur une toiture en cours de rénovation" },
    { label: "Zinguerie neuve", prompt: "Gouttières et zinguerie neuves installées proprement" },
  ],
  menuisier: [
    { label: "Fenêtres posées", prompt: "Menuisier professionnel posant des fenêtres double vitrage modernes" },
    { label: "Porte sur mesure", prompt: "Porte en bois sur mesure installée par un menuisier artisan" },
    { label: "Volets neufs", prompt: "Volets en bois vernis installés par un menuisier professionnel" },
  ],
  default: [
    { label: "Artisan au travail", prompt: "Artisan BTP professionnel au travail, qualité et sérieux" },
    { label: "Chantier terminé", prompt: "Chantier de rénovation terminé avec soin, résultat impeccable" },
    { label: "Avant-après", prompt: "Transformation avant-après d'une rénovation maison impressionnante" },
  ],
};

function getThemes(metier: string | null): { label: string; prompt: string }[] {
  if (!metier) return THEMES_PAR_METIER.default;
  const key = metier.toLowerCase().replace(/[éèê]/g, "e").replace(/s$/, "");
  for (const [k, v] of Object.entries(THEMES_PAR_METIER)) {
    if (key.includes(k)) return v;
  }
  return THEMES_PAR_METIER.default;
}

type Props = {
  metier: string | null;
  ville: string | null;
  onUseImage: (imageUrl: string) => void;
};

export function ImageIAGenerateur({ metier, ville, onUseImage }: Props) {
  const themes = getThemes(metier);
  const [selectedTheme, setSelectedTheme] = useState<string>(themes[0].prompt);
  const [customPrompt, setCustomPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const finalPrompt = (customPrompt.trim() || selectedTheme) +
    (ville ? `, ambiance ville française, ${ville}` : "");

  async function generate() {
    setStatus("loading");
    setErrorMsg(null);
    setImageUrl(null);

    try {
      const res = await fetch("/api/chantier/generer-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "La génération a échoué.");
        setStatus("error");
        return;
      }
      setImageUrl(data.url);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      setStatus("success");
    } catch {
      setErrorMsg("Erreur réseau. Vérifiez votre connexion et réessayez.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-5">
      {/* Thèmes prédéfinis */}
      <div>
        <p className="text-sm font-medium text-dusk/70 mb-2">Choisir un thème</p>
        <div className="flex flex-col gap-2">
          {themes.map((t) => (
            <button
              key={t.prompt}
              type="button"
              onClick={() => { setSelectedTheme(t.prompt); setCustomPrompt(""); }}
              className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors duration-200 ${
                selectedTheme === t.prompt && !customPrompt
                  ? "bg-braise/10 border-braise/30 text-braise"
                  : "border-dusk/12 text-dusk/70 hover:bg-dusk/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt personnalisé */}
      <div>
        <label htmlFor="custom-prompt" className="block text-sm font-medium text-dusk/70 mb-1.5">
          Personnaliser (optionnel)
        </label>
        <textarea
          id="custom-prompt"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Décrivez précisément l'image que vous souhaitez générer..."
          rows={3}
          className="w-full bg-white border border-dusk/15 rounded-xl px-4 py-3 text-sm text-dusk placeholder-dusk/35 resize-none focus:outline-none focus:ring-2 focus:ring-braise/30 focus:border-braise/50 transition-colors duration-200"
        />
      </div>

      {/* Prompt actif */}
      <p className="text-xs text-dusk/40 italic leading-relaxed">
        Prompt : « {finalPrompt} »
      </p>

      {/* Bouton générer */}
      <button
        type="button"
        onClick={generate}
        disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-3 rounded-full hover:bg-ambre disabled:opacity-60 transition-all duration-200"
      >
        {status === "loading" ? (
          <>
            <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
            Génération en cours (15-20 sec.)…
          </>
        ) : (
          <>
            <Sparkle size={16} weight="fill" aria-hidden="true" />
            Générer l&apos;image
          </>
        )}
      </button>

      {remaining !== null && (
        <p className="text-center text-xs text-dusk/40">
          {remaining} génération{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""} aujourd&apos;hui
        </p>
      )}

      {/* Erreur */}
      {status === "error" && errorMsg && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <Warning size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          {errorMsg}
        </div>
      )}

      {/* Aperçu image */}
      {status === "success" && imageUrl && (
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-dust-dark">
            <Image
              src={imageUrl}
              alt="Image générée par IA"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={generate}
              className="flex-1 flex items-center justify-center gap-2 border border-dusk/20 text-dusk/70 font-medium text-sm px-4 py-2.5 rounded-full hover:bg-dusk/5 transition-colors duration-200"
            >
              <ArrowsClockwise size={15} aria-hidden="true" />
              Regénérer
            </button>
            <button
              type="button"
              onClick={() => onUseImage(imageUrl)}
              className="flex-1 flex items-center justify-center gap-2 bg-dusk text-dust font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-dusk/80 transition-colors duration-200"
            >
              <Check size={15} weight="bold" aria-hidden="true" />
              Utiliser cette image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
