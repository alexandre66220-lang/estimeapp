"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Sparkle,
  ArrowsClockwise,
  CircleNotch,
  Check,
  Warning,
  CalendarPlus,
  Copy,
  Download,
  TextT,
  X,
  Star,
  Clock,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { getCreneauxRecommandes, RESEAU_META, type ReseauSocial } from "@/lib/planning/creneaux";

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

function getThemes(metier: string | null) {
  if (!metier) return THEMES_PAR_METIER.default;
  const key = metier.toLowerCase().replace(/[éèê]/g, "e").replace(/s$/, "");
  for (const [k, v] of Object.entries(THEMES_PAR_METIER)) {
    if (key.includes(k)) return v;
  }
  return THEMES_PAR_METIER.default;
}

const RESEAUX: { value: ReseauSocial; label: string; emoji: string }[] = [
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "facebook", label: "Facebook", emoji: "👤" },
  { value: "tiktok", label: "TikTok", emoji: "🎵" },
];

type Mode = "image" | "image_texte";

type Props = {
  metier: string | null;
  ville: string | null;
  onUseImage: (imageUrl: string) => void;
};

export function ImageIAGenerateur({ metier, ville, onUseImage }: Props) {
  const themes = getThemes(metier);
  const [mode, setMode] = useState<Mode>("image");
  const [selectedTheme, setSelectedTheme] = useState<string>(themes[0].prompt);
  const [customPrompt, setCustomPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  // Texte IA
  const [texteGenere, setTexteGenere] = useState<string | null>(null);
  const [hashtagsGeneres, setHashtagsGeneres] = useState<string[]>([]);
  const [generatingTexte, setGeneratingTexte] = useState(false);

  // Modal planning
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [planningWithTexte, setPlanningWithTexte] = useState(false);
  const [reseau, setReseau] = useState<ReseauSocial>("instagram");
  const [planDate, setPlanDate] = useState("");
  const [planTime, setPlanTime] = useState("09:00");
  const [planSaving, setPlanSaving] = useState(false);
  const [planSuccess, setPlanSuccess] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [texteEdite, setTexteEdite] = useState("");

  const finalPrompt = (customPrompt.trim() || selectedTheme) + (ville ? `, ambiance ville française, ${ville}` : "");
  const today = new Date().toISOString().slice(0, 10);
  const dateForCreneaux = planDate ? new Date(planDate + "T12:00:00") : new Date();
  const creneaux = getCreneauxRecommandes(reseau, dateForCreneaux);

  async function generate() {
    setStatus("loading");
    setErrorMsg(null);
    setImageUrl(null);
    setTexteGenere(null);
    setHashtagsGeneres([]);

    try {
      const res = await fetch("/api/chantier/generer-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      const data = await res.json() as { url?: string; remaining?: number; error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? "La génération a échoué.");
        setStatus("error");
        return;
      }
      setImageUrl(data.url ?? null);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      setStatus("success");

      // Auto-générer le texte si mode image+texte
      if (mode === "image_texte") {
        await generateTexte(finalPrompt);
      }
    } catch {
      setErrorMsg("Erreur réseau. Vérifiez votre connexion et réessayez.");
      setStatus("error");
    }
  }

  async function generateTexte(promptDesc: string) {
    setGeneratingTexte(true);
    try {
      const res = await fetch("/api/generate-post-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptDesc, metier, ville, ton: "professionnel", longueur: "moyen" }),
      });
      const data = await res.json() as { texte?: string; hashtags?: string[]; error?: string };
      if (res.ok && data.texte) {
        setTexteGenere(data.texte);
        setHashtagsGeneres(data.hashtags ?? []);
        setTexteEdite(data.texte);
      }
    } catch {
      // silent
    } finally {
      setGeneratingTexte(false);
    }
  }

  function openPlanningModal(withTexte: boolean) {
    setPlanningWithTexte(withTexte);
    setPlanSuccess(false);
    setPlanError(null);
    if (withTexte && !texteGenere) {
      generateTexte(finalPrompt);
    }
    setShowPlanningModal(true);
  }

  async function handlePlanSave() {
    if (!imageUrl || !planDate) return;
    setPlanSaving(true);
    setPlanError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const texte = planningWithTexte ? (texteEdite || texteGenere || "") : "";
      const hashtags = planningWithTexte ? hashtagsGeneres : [];

      const { error } = await supabase.from("posts_programmes").insert({
        user_id: user.id,
        texte_post: texte || " ",
        hashtags,
        image_url: imageUrl,
        date_publication: `${planDate}T${planTime}:00`,
        statut: "programme",
        reseau_social: reseau,
      });
      if (error) throw new Error(error.message);
      setPlanSuccess(true);
      setTimeout(() => setShowPlanningModal(false), 1500);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setPlanSaving(false);
    }
  }

  function copyPost() {
    const text = [texteGenere, ...hashtagsGeneres].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function downloadImage() {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "image-ia-estime.jpg";
    a.target = "_blank";
    a.click();
  }

  return (
    <div className="space-y-5">
      {/* Toggle mode */}
      <div className="flex gap-1 bg-dusk/5 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setMode("image")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${mode === "image" ? "bg-white text-dusk shadow-sm" : "text-dusk/50 hover:text-dusk"}`}
        >
          <Sparkle size={14} weight="fill" aria-hidden="true" />
          Image uniquement
        </button>
        <button
          type="button"
          onClick={() => setMode("image_texte")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${mode === "image_texte" ? "bg-white text-dusk shadow-sm" : "text-dusk/50 hover:text-dusk"}`}
        >
          <TextT size={14} aria-hidden="true" />
          Image + texte
        </button>
      </div>

      {/* Thèmes */}
      <div>
        <p className="text-sm font-medium text-dusk/70 mb-2">Choisir un thème</p>
        <div className="flex flex-col gap-2">
          {themes.map((t) => (
            <button
              key={t.prompt}
              type="button"
              onClick={() => { setSelectedTheme(t.prompt); setCustomPrompt(""); }}
              className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors duration-200 ${selectedTheme === t.prompt && !customPrompt ? "bg-braise/10 border-braise/30 text-braise" : "border-dusk/12 text-dusk/70 hover:bg-dusk/5"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt personnalisé */}
      <div>
        <label htmlFor="custom-prompt" className="block text-sm font-medium text-dusk/70 mb-1.5">Personnaliser (optionnel)</label>
        <textarea
          id="custom-prompt"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Décrivez précisément l'image que vous souhaitez générer..."
          rows={3}
          className="w-full bg-white border border-dusk/15 rounded-xl px-4 py-3 text-sm text-dusk placeholder-dusk/35 resize-none focus:outline-none focus:ring-2 focus:ring-braise/30 focus:border-braise/50 transition-colors duration-200"
        />
      </div>

      <p className="text-xs text-dusk/40 italic leading-relaxed">Prompt : « {finalPrompt} »</p>

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
            {mode === "image_texte" ? "Générer l'image + le texte" : "Générer l'image"}
          </>
        )}
      </button>

      {remaining !== null && (
        <p className="text-center text-xs text-dusk/40">
          {remaining} génération{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""} aujourd&apos;hui
        </p>
      )}

      {status === "error" && errorMsg && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <Warning size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          {errorMsg}
        </div>
      )}

      {/* Résultat */}
      {status === "success" && imageUrl && (
        <div className="space-y-4">
          {mode === "image_texte" ? (
            /* Layout côte à côte image + texte */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-dust-dark">
                <Image src={imageUrl} alt="Image générée par IA" fill unoptimized className="object-cover" />
              </div>
              <div className="flex flex-col gap-3">
                {generatingTexte ? (
                  <div className="flex-1 flex items-center justify-center gap-2 text-sm text-dusk/50">
                    <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
                    Génération du texte…
                  </div>
                ) : texteGenere ? (
                  <>
                    <textarea
                      value={texteEdite}
                      onChange={(e) => setTexteEdite(e.target.value)}
                      rows={6}
                      className="flex-1 w-full bg-dust border border-dusk/12 rounded-xl px-3 py-2.5 text-sm text-dusk resize-none focus:outline-none focus:ring-2 focus:ring-braise/30"
                    />
                    {hashtagsGeneres.length > 0 && (
                      <p className="text-xs text-ambre truncate">{hashtagsGeneres.slice(0, 5).join(" ")}</p>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => generateTexte(finalPrompt)}
                    className="flex items-center gap-2 text-sm text-dusk/60 hover:text-dusk"
                  >
                    <ArrowsClockwise size={14} aria-hidden="true" />
                    Générer le texte
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-dust-dark">
              <Image src={imageUrl} alt="Image générée par IA" fill unoptimized className="object-cover" />
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-col gap-2">
            {mode === "image_texte" && texteGenere && (
              <button
                type="button"
                onClick={copyPost}
                className="flex items-center justify-center gap-2 border border-dusk/20 text-dusk/70 font-medium text-sm px-4 py-2.5 rounded-full hover:bg-dusk/5 transition-colors duration-200"
              >
                <Copy size={15} aria-hidden="true" />
                Copier le post complet
              </button>
            )}
            <div className="flex gap-2">
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
                onClick={downloadImage}
                className="flex-1 flex items-center justify-center gap-2 border border-dusk/20 text-dusk/70 font-medium text-sm px-4 py-2.5 rounded-full hover:bg-dusk/5 transition-colors duration-200"
              >
                <Download size={15} aria-hidden="true" />
                Télécharger
              </button>
            </div>
            <button
              type="button"
              onClick={() => openPlanningModal(false)}
              className="flex items-center justify-center gap-2 border border-braise/30 text-braise font-medium text-sm px-4 py-2.5 rounded-full hover:bg-braise/5 transition-colors duration-200"
            >
              <CalendarPlus size={15} aria-hidden="true" />
              Ajouter au planning
            </button>
            <button
              type="button"
              onClick={() => openPlanningModal(true)}
              className="flex items-center justify-center gap-2 bg-braise text-white font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-ambre transition-colors duration-200"
            >
              <Sparkle size={15} weight="fill" aria-hidden="true" />
              Programmer avec texte
            </button>
            <button
              type="button"
              onClick={() => onUseImage(imageUrl)}
              className="flex items-center justify-center gap-2 bg-dusk text-dust font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-dusk/80 transition-colors duration-200"
            >
              <Check size={15} weight="bold" aria-hidden="true" />
              Utiliser cette image
            </button>
          </div>
        </div>
      )}

      {/* Modal planning depuis image IA */}
      {showPlanningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dusk/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-dusk">
                {planningWithTexte ? "Programmer avec texte" : "Ajouter au planning"}
              </h3>
              <button type="button" onClick={() => setShowPlanningModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-dusk/50 hover:bg-dusk/8">
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Miniature image */}
            {imageUrl && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-dust">
                <Image src={imageUrl} alt="Aperçu" fill unoptimized className="object-cover" />
              </div>
            )}

            {/* Texte si planningWithTexte */}
            {planningWithTexte && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-dusk/70 mb-2">Texte du post</label>
                {generatingTexte ? (
                  <div className="flex items-center gap-2 text-sm text-dusk/50 py-3">
                    <CircleNotch size={14} className="animate-spin" aria-hidden="true" />
                    Génération du texte en cours…
                  </div>
                ) : texteGenere ? (
                  <textarea
                    value={texteEdite}
                    onChange={(e) => setTexteEdite(e.target.value)}
                    rows={4}
                    className="w-full bg-dust border border-dusk/12 rounded-xl px-3 py-2.5 text-sm text-dusk resize-none focus:outline-none focus:ring-2 focus:ring-braise/30"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => generateTexte(finalPrompt)}
                    className="flex items-center gap-2 text-sm text-braise hover:underline"
                  >
                    <Sparkle size={14} weight="fill" aria-hidden="true" />
                    Générer le texte
                  </button>
                )}
              </div>
            )}

            {/* Réseau social */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-dusk/70 mb-2">Réseau social</label>
              <div className="flex gap-2">
                {RESEAUX.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReseau(r.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${reseau === r.value ? "border-braise/40 bg-braise/8 text-dusk" : "border-dusk/12 text-dusk/60 hover:bg-dust/60"}`}
                  >
                    <span>{r.emoji}</span>
                    <span className="hidden sm:inline">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date / Heure */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-dusk/60 mb-1">Date</label>
                <input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} min={today} className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-braise/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dusk/60 mb-1">Heure</label>
                <input type="time" value={planTime} onChange={(e) => setPlanTime(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-braise/30" />
              </div>
            </div>

            {/* Créneaux recommandés */}
            <div className="mb-5">
              <p className="text-xs font-medium text-dusk/60 mb-2">Créneaux recommandés ({RESEAU_META[reseau].label})</p>
              <div className="flex flex-wrap gap-2">
                {creneaux.map((c) => (
                  <button
                    key={c.heure}
                    type="button"
                    onClick={() => setPlanTime(c.heure)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${planTime === c.heure ? "bg-braise text-white border-braise" : "border-dusk/15 text-dusk/70 hover:bg-dust/60"}`}
                  >
                    {c.meilleur && <Star size={10} weight="fill" className={planTime === c.heure ? "text-white/80" : "text-ambre"} aria-hidden="true" />}
                    {c.label}
                    {c.meilleur && <span className={`text-[10px] ${planTime === c.heure ? "text-white/70" : "text-ambre"}`}>Meilleur</span>}
                  </button>
                ))}
              </div>
            </div>

            {planError && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{planError}</p>
            )}

            <button
              type="button"
              onClick={handlePlanSave}
              disabled={!planDate || planSaving || planSuccess || (planningWithTexte && generatingTexte)}
              className="w-full flex items-center justify-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-3 rounded-full hover:bg-ambre disabled:opacity-50 transition-all duration-200"
            >
              {planSuccess ? (
                <><Check size={15} weight="bold" aria-hidden="true" /> Programmé !</>
              ) : planSaving ? (
                <><CircleNotch size={15} className="animate-spin" aria-hidden="true" /> Enregistrement…</>
              ) : (
                <><Clock size={15} aria-hidden="true" /> Programmer</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
