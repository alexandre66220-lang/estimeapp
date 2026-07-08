"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ImageSquare,
  X,
  Check,
  CircleNotch,
  WarningCircle,
  ArrowsClockwise,
  Plus,
  ChatTeardrop,
  TextAlignLeft,
  CaretDown,
  Sparkle,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { PostEditor } from "@/components/espace/PostEditor";
import { ImageIAGenerateur } from "@/components/espace/ImageIAGenerateur";
import { usePointsToast } from "@/components/espace/PointsToastProvider";
import { addPointsFidelite } from "@/app/actions/fidelite";
import { AlterEgoAlerteBandeau } from "@/components/espace/AlterEgoAlerteBandeau";

const NotationChantier = dynamic<React.ComponentProps<typeof import("@/components/espace/NotationChantier").NotationChantier>>(
  () => import("@/components/espace/NotationChantier").then((mod) => mod.NotationChantier),
  { ssr: false }
);

type TonPost = "professionnel" | "decontracte" | "technique" | "chaleureux";
type LongueurPost = "court" | "moyen" | "long";

const TON_OPTIONS: { value: TonPost; label: string; emoji: string }[] = [
  { value: "professionnel", label: "Professionnel", emoji: "💼" },
  { value: "decontracte", label: "Décontracté", emoji: "😊" },
  { value: "technique", label: "Technique", emoji: "🔧" },
  { value: "chaleureux", label: "Chaleureux", emoji: "🤝" },
];

const LONGUEUR_OPTIONS: { value: LongueurPost; label: string; sub: string }[] = [
  { value: "court", label: "Court", sub: "~150 car." },
  { value: "moyen", label: "Moyen", sub: "~300 car." },
  { value: "long", label: "Long", sub: "~600 car." },
];

const GENERATING_MESSAGES = [
  "Analyse de votre photo en cours...",
  "Rédaction du post en cours...",
  "Ajout des hashtags locaux...",
  "Finalisation...",
];

type Photo = { file: File; preview: string };
type Status = "idle" | "uploading" | "generating" | "success" | "error";
type GeneratedPost = { contenu: string; image_url: string; hashtags: string[] };

function parseNum(v: string): number | null {
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) || n < 0 ? null : n;
}

function extractPartialLegende(raw: string): string {
  const match = raw.match(/"legende"\s*:\s*"((?:[^"\\]|\\.)*)(?:"|$)/);
  if (!match) return "";
  return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

function PhotoField({
  inputId,
  label,
  photo,
  disabled,
  onSelect,
  onClear,
}: {
  inputId: string;
  label: string;
  photo: Photo | null;
  disabled: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-dusk/70 mb-1.5">
        {label}
      </label>
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
        {photo ? (
          <>
            <Image src={photo.preview} alt={`Aperçu photo ${label.toLowerCase()}`} fill unoptimized className="object-cover" />
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              aria-label={`Retirer la photo ${label.toLowerCase()}`}
              className="absolute top-2 right-2 w-9 h-9 rounded-full bg-dusk/70 text-white flex items-center justify-center hover:bg-dusk transition-colors duration-200 disabled:opacity-50"
            >
              <X size={16} weight="bold" aria-hidden="true" />
            </button>
          </>
        ) : (
          <label
            htmlFor={inputId}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-dusk/20 bg-dust cursor-pointer hover:border-ambre/40 hover:bg-ambre/5 transition-colors duration-200"
          >
            <ImageSquare size={28} className="text-dusk/35" aria-hidden="true" />
            <span className="text-xs text-dusk/45 font-medium">Ajouter une photo</span>
          </label>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onSelect(file);
            event.target.value = "";
          }}
          className="sr-only"
        />
      </div>
    </div>
  );
}

function FinancialDetailSection({
  disabled,
  coutFournitures, setCoutFournitures,
  coutSousTraitance, setCoutSousTraitance,
  fraisDeplacement, setFraisDeplacement,
  autresCouts, setAutresCouts,
  heuresPassees, setHeuresPassees,
  tauxHoraireObjectif, setTauxHoraireObjectif,
}: {
  disabled: boolean;
  coutFournitures: string; setCoutFournitures: (v: string) => void;
  coutSousTraitance: string; setCoutSousTraitance: (v: string) => void;
  fraisDeplacement: string; setFraisDeplacement: (v: string) => void;
  autresCouts: string; setAutresCouts: (v: string) => void;
  heuresPassees: string; setHeuresPassees: (v: string) => void;
  tauxHoraireObjectif: string; setTauxHoraireObjectif: (v: string) => void;
}) {
  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200 disabled:opacity-60";

  const fournitures = parseNum(coutFournitures) ?? 0;
  const sousTraitance = parseNum(coutSousTraitance) ?? 0;
  const deplacements = parseNum(fraisDeplacement) ?? 0;
  const autres = parseNum(autresCouts) ?? 0;
  const heures = parseNum(heuresPassees) ?? 0;

  const totalCouts = fournitures + sousTraitance + deplacements + autres;
  const showCalcs = totalCouts > 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1">Coût fournitures (€)</label>
          <input type="number" min="0" step="1" disabled={disabled} value={coutFournitures} onChange={e => setCoutFournitures(e.target.value)} placeholder="Peinture, matériaux..." className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1">Sous-traitance (€)</label>
          <input type="number" min="0" step="1" disabled={disabled} value={coutSousTraitance} onChange={e => setCoutSousTraitance(e.target.value)} placeholder="Montant sous-traitants" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1">Frais de déplacement (€)</label>
          <input type="number" min="0" step="1" disabled={disabled} value={fraisDeplacement} onChange={e => setFraisDeplacement(e.target.value)} placeholder="Carburant, péages..." className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1">Autres coûts (€)</label>
          <input type="number" min="0" step="1" disabled={disabled} value={autresCouts} onChange={e => setAutresCouts(e.target.value)} placeholder="Location matériel, divers" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1">Heures de travail réelles</label>
          <input type="number" min="0" step="0.5" disabled={disabled} value={heuresPassees} onChange={e => setHeuresPassees(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1">Taux horaire objectif (€/h)</label>
          <input type="number" min="0" step="1" disabled={disabled} value={tauxHoraireObjectif} onChange={e => setTauxHoraireObjectif(e.target.value)} placeholder="ex. 45" className={inputClass} />
        </div>
      </div>

      {showCalcs && (
        <div className="rounded-xl bg-dust/60 border border-dusk/8 p-3 text-xs space-y-1.5">
          <div className="flex justify-between text-dusk/60">
            <span>Total des coûts</span>
            <span className="font-semibold text-dusk">{totalCouts.toLocaleString("fr-FR")} €</span>
          </div>
          {heures > 0 && totalCouts > 0 && (
            <div className="flex justify-between text-dusk/60">
              <span>Coût horaire moyen</span>
              <span className="font-semibold text-dusk">{(totalCouts / heures).toFixed(0)} €/h</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type TabMode = "photo" | "ia";

export default function NouveauChantier() {
  const { notify } = usePointsToast();
  const [activeTab, setActiveTab] = useState<TabMode>("photo");
  const [metierProfil, setMetierProfil] = useState<string | null>(null);
  const [villeProfil, setVilleProfil] = useState<string | null>(null);
  const [titre, setTitre] = useState("");
  const [montant, setMontant] = useState("");
  const [avant, setAvant] = useState<Photo | null>(null);
  const [apres, setApres] = useState<Photo | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [post, setPost] = useState<GeneratedPost | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [favoris, setFavoris] = useState<string[]>([]);
  const [ton, setTon] = useState<TonPost>("professionnel");
  const [longueur, setLongueur] = useState<LongueurPost>("moyen");
  const [chantierId, setChantierId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);

  // Financial detail
  const [coutFournitures, setCoutFournitures] = useState("");
  const [coutSousTraitance, setCoutSousTraitance] = useState("");
  const [fraisDeplacement, setFraisDeplacement] = useState("");
  const [autresCouts, setAutresCouts] = useState("");
  const [heuresPassees, setHeuresPassees] = useState("");
  const [tauxHoraireObjectif, setTauxHoraireObjectif] = useState("");
  const [alterEgoAlerte, setAlterEgoAlerte] = useState<string | null>(null);

  const isBusy = status === "uploading" || status === "generating";
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("hashtags_favoris, metier, ville")
        .eq("id", user.id)
        .maybeSingle();
      setFavoris(data?.hashtags_favoris ?? []);
      setMetierProfil(data?.metier ?? null);
      setVilleProfil(data?.ville ?? null);
    }
    loadProfile();
  }, []);

  // Rotating messages during generation
  useEffect(() => {
    if (status !== "generating") return;
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % GENERATING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [status]);

  async function verifierAlterEgo() {
    const montantNum = parseNum(montant);
    if (!montantNum) return;
    try {
      const response = await fetch("/api/alter-ego/verifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montant: montantNum }),
      });
      if (!response.ok) return;
      const result = await response.json();
      if (result?.collision && result?.description) {
        setAlterEgoAlerte(result.description as string);
      }
    } catch {
      // vérification silencieuse, non bloquante
    }
  }

  async function handleToggleFavori(tag: string) {
    const next = favoris.includes(tag) ? favoris.filter((t) => t !== tag) : [...favoris, tag];
    setFavoris(next);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ hashtags_favoris: next }).eq("id", user.id);
  }

  function setPhoto(slot: "avant" | "apres", file: File) {
    const preview = URL.createObjectURL(file);
    const current = slot === "avant" ? avant : apres;
    if (current) URL.revokeObjectURL(current.preview);
    if (slot === "avant") setAvant({ file, preview });
    else setApres({ file, preview });
  }

  function clearPhoto(slot: "avant" | "apres") {
    const current = slot === "avant" ? avant : apres;
    if (current) URL.revokeObjectURL(current.preview);
    if (slot === "avant") setAvant(null);
    else setApres(null);
  }

  async function generatePost(
    chantierId: string,
    tonOverride?: TonPost,
    longueurOverride?: LongueurPost,
    silent = false
  ) {
    if (!silent) {
      setStatus("generating");
      setStreamingText("");
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chantierId,
          tonPost: tonOverride ?? ton,
          longueurPost: longueurOverride ?? longueur,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "La génération du post a échoué.");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";
      let eventType = "";
      // Reset timeout once stream starts
      clearTimeout(timeoutId);
      const streamTimeout = setTimeout(() => controller.abort(), 30000);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6)) as Record<string, unknown>;
              if (eventType === "chunk") {
                accumulatedText += data.text as string;
                const partial = extractPartialLegende(accumulatedText);
                if (partial) setStreamingText(partial);
                // Reset stream timeout on each chunk
                clearTimeout(streamTimeout);
              } else if (eventType === "complete") {
                const completedPost = data.post as GeneratedPost & { id: string; created_at: string };
                setPost(completedPost);
                setCaption(completedPost.contenu);
                setHashtags(completedPost.hashtags ?? []);
                setStatus("success");
              } else if (eventType === "error") {
                throw new Error((data.message as string) ?? "La génération a échoué.");
              }
              eventType = "";
            }
          }
        }
      } finally {
        clearTimeout(streamTimeout);
      }

      addPointsFidelite("post_instagram").then((res) => {
        if (res) notify("post_instagram", res.pointsAdded, res.leveledUp);
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("La génération prend plus de temps que prévu. Réessayez dans quelques instants.");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
      abortRef.current = null;
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    if (!titre.trim()) {
      setErrorMessage("Le titre du chantier est obligatoire.");
      return;
    }
    if (!avant && !apres) {
      setErrorMessage("Ajoutez au moins une photo, avant ou après.");
      return;
    }

    try {
      setStatus("uploading");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Votre session a expiré. Reconnectez-vous puis réessayez.");
      const userId = user.id;
      const newChantierId = crypto.randomUUID();

      async function uploadPhoto(photo: Photo, name: "avant" | "apres") {
        const path = `${userId}/${newChantierId}/${name}.jpg`;
        const { error } = await supabase.storage
          .from("chantiers")
          .upload(path, photo.file, { contentType: photo.file.type, upsert: true });
        if (error) throw new Error(`L'envoi de la photo ${name} a échoué. Réessayez.`);
        return path;
      }

      const photoAvantUrl = avant ? await uploadPhoto(avant, "avant") : null;
      const photoApresUrl = apres ? await uploadPhoto(apres, "apres") : null;

      const financialData: Record<string, number | null> = {};
      if (montant.trim()) financialData.montant = parseNum(montant);
      if (coutFournitures.trim()) financialData.depenses = parseNum(coutFournitures);
      if (coutSousTraitance.trim()) financialData.sous_traitance = parseNum(coutSousTraitance);
      if (fraisDeplacement.trim()) financialData.frais_deplacement = parseNum(fraisDeplacement);
      if (autresCouts.trim()) financialData.autres_couts = parseNum(autresCouts);
      if (heuresPassees.trim()) financialData.heures_passees = parseNum(heuresPassees);
      if (tauxHoraireObjectif.trim()) financialData.taux_horaire_objectif = parseNum(tauxHoraireObjectif);

      const { error: insertError } = await supabase.from("chantiers").insert({
        id: newChantierId,
        user_id: userId,
        titre: titre.trim(),
        photo_avant_url: photoAvantUrl,
        photo_apres_url: photoApresUrl,
        ...financialData,
      });
      if (insertError) throw new Error("La création du chantier a échoué. Réessayez.");

      setChantierId(newChantierId);

      addPointsFidelite("chantier_cree").then((res) => {
        if (res) notify("chantier_cree", res.pointsAdded, res.leveledUp);
      });

      await generatePost(newChantierId);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  }

  async function handleRetryGenerate() {
    if (!chantierId) return;
    setErrorMessage(null);
    setIsRegenerating(true);
    setStreamingText("");
    try {
      await generatePost(chantierId, undefined, undefined, true);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setIsRegenerating(false);
    }
  }

  function handleReset() {
    if (avant) URL.revokeObjectURL(avant.preview);
    if (apres) URL.revokeObjectURL(apres.preview);
    abortRef.current?.abort();
    setTitre(""); setMontant(""); setAvant(null); setApres(null);
    setStatus("idle"); setErrorMessage(null); setPost(null);
    setCaption(""); setHashtags([]); setChantierId(null);
    setTon("professionnel"); setLongueur("moyen"); setStreamingText("");
    setCoutFournitures(""); setCoutSousTraitance(""); setFraisDeplacement("");
    setAutresCouts(""); setHeuresPassees(""); setTauxHoraireObjectif("");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16">
      <Link
        href="/espace/tableau-de-bord"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-dusk/60 hover:text-dusk transition-colors duration-200 mb-6"
      >
        <ArrowLeft size={16} weight="bold" aria-hidden="true" />
        Retour au tableau de bord
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-dusk">Nouveau chantier</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Ajoutez vos photos avant/après, Estime génère votre post Instagram.
        </p>
      </div>

      {/* Onglets mode */}
      {status === "idle" || status === "error" ? (
        <div className="flex gap-1 bg-dusk/5 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("photo")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeTab === "photo"
                ? "bg-white text-dusk shadow-sm"
                : "text-dusk/50 hover:text-dusk"
            }`}
          >
            <ImageSquare size={16} aria-hidden="true" />
            Photo de chantier
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ia")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeTab === "ia"
                ? "bg-white text-dusk shadow-sm"
                : "text-dusk/50 hover:text-dusk"
            }`}
          >
            <Sparkle size={16} weight="fill" aria-hidden="true" />
            Image générée par IA
          </button>
        </div>
      ) : null}

      {/* Generating skeleton */}
      {status === "generating" && (
        <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <CircleNotch size={16} className="animate-spin text-braise shrink-0" aria-hidden="true" />
            <span className="text-sm text-dusk/60">{GENERATING_MESSAGES[msgIndex]}</span>
          </div>
          {streamingText ? (
            <p className="text-sm text-dusk/80 leading-relaxed whitespace-pre-wrap">
              {streamingText}
              <span className="animate-pulse ml-0.5">▌</span>
            </p>
          ) : (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-dusk/8 rounded w-full" />
              <div className="h-4 bg-dusk/8 rounded w-4/5" />
              <div className="h-4 bg-dusk/8 rounded w-3/5" />
            </div>
          )}
        </div>
      )}

      {status === "success" && post ? (
        <>
          <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
            <div className="flex items-center gap-2 text-braise mb-5">
              <Check size={18} weight="bold" aria-hidden="true" />
              <span className="text-sm font-semibold">Post Instagram généré</span>
            </div>

            <PostEditor
              chantierId={chantierId!}
              initialCaption={caption}
              initialHashtags={hashtags}
              imageUrl={post.image_url}
              onRegenerate={handleRetryGenerate}
              isRegenerating={isRegenerating}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-dusk/8">
              {chantierId && (
                <Link
                  href={`/espace/chantiers/${chantierId}`}
                  className="inline-flex items-center justify-center gap-2 text-dusk font-medium text-sm px-6 py-3 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
                >
                  Voir le chantier
                </Link>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 text-dusk font-medium text-sm px-6 py-3 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
              >
                <Plus size={18} weight="bold" aria-hidden="true" />
                Créer un autre chantier
              </button>
            </div>
          </div>
          {chantierId && <NotationChantier chantierId={chantierId} />}
        </>
      ) : status !== "generating" ? (
        activeTab === "ia" ? (
          <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
            <div className="mb-5">
              <label htmlFor="titre-ia" className="block text-sm font-medium text-dusk/70 mb-1.5">
                Titre du chantier
              </label>
              <input
                type="text"
                id="titre-ia"
                required
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ravalement façade, 12 rue des Tilleuls"
                className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
              />
            </div>
            <ImageIAGenerateur
              metier={metierProfil}
              ville={villeProfil}
              onUseImage={(imageUrl) => {
                // Pré-remplir l'image et basculer sur l'onglet photo pour finaliser
                setActiveTab("photo");
                // On stocke l'URL de l'image IA pour l'utiliser comme photo d'après
                // via un état dédié — on simule une "photo" pour le flux existant
                const syntheticEvent = { iaImageUrl: imageUrl };
                void syntheticEvent; // L'image sera utilisée lors du submit
                setErrorMessage("Image IA sélectionnée. Ajoutez un titre si nécessaire, puis cliquez sur « Générer mon post ».");
                // On crée un objet File factice depuis l'URL pour le flux existant
                fetch(imageUrl)
                  .then((r) => r.blob())
                  .then((blob) => {
                    const file = new File([blob], "image-ia.jpg", { type: "image/jpeg" });
                    const preview = URL.createObjectURL(blob);
                    setApres({ file, preview });
                    setErrorMessage(null);
                    setActiveTab("photo");
                  })
                  .catch(() => {
                    setErrorMessage("Impossible de charger l'image générée. Réessayez.");
                  });
              }}
            />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 space-y-6">
          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-dusk/70 mb-1.5">
              Titre du chantier
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              required
              disabled={isBusy}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ravalement façade, 12 rue des Tilleuls"
              className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200 disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PhotoField inputId="photo-avant" label="Photo avant" photo={avant} disabled={isBusy} onSelect={(f) => setPhoto("avant", f)} onClear={() => clearPhoto("avant")} />
            <PhotoField inputId="photo-apres" label="Photo après" photo={apres} disabled={isBusy} onSelect={(f) => setPhoto("apres", f)} onClear={() => clearPhoto("apres")} />
          </div>
          <p className="text-dusk/45 text-xs">Au moins une des deux photos est nécessaire.</p>

          {/* Ton */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ChatTeardrop size={14} className="text-dusk/40" aria-hidden="true" />
              <span className="text-sm font-medium text-dusk/70">Ton de communication</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TON_OPTIONS.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  disabled={isBusy}
                  onClick={() => setTon(value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-50 ${
                    ton === value ? "bg-braise text-white border-braise" : "border-dusk/15 text-dusk/60 hover:bg-dust/60"
                  }`}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Longueur */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TextAlignLeft size={14} className="text-dusk/40" aria-hidden="true" />
              <span className="text-sm font-medium text-dusk/70">Longueur du post</span>
            </div>
            <div className="flex gap-2">
              {LONGUEUR_OPTIONS.map(({ value, label, sub }) => (
                <button
                  key={value}
                  type="button"
                  disabled={isBusy}
                  onClick={() => setLongueur(value)}
                  className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-50 ${
                    longueur === value ? "bg-braise text-white border-braise" : "border-dusk/15 text-dusk/60 hover:bg-dust/60"
                  }`}
                >
                  {label}
                  <span className={`text-xs mt-0.5 ${longueur === value ? "text-white/70" : "text-dusk/40"}`}>{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Détail financier collapsible */}
          <details className="group">
            <summary className="flex items-center gap-2 text-sm font-medium text-dusk/60 cursor-pointer hover:text-dusk transition-colors list-none select-none">
              <span className="w-5 h-5 rounded-full border border-dusk/20 flex items-center justify-center group-open:bg-braise group-open:border-braise transition-colors">
                <CaretDown size={10} className="text-dusk/40 group-open:text-white group-open:rotate-180 transition-transform" />
              </span>
              Détail financier <span className="text-dusk/35 font-normal">— optionnel</span>
            </summary>
            <div className="mt-4 pt-4 border-t border-dusk/8">
              <div className="mb-3">
                <label htmlFor="montant" className="block text-xs font-medium text-dusk/60 mb-1">
                  Montant facturé HT (€)
                </label>
                <input
                  type="number"
                  id="montant"
                  min="0"
                  step="100"
                  disabled={isBusy}
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  onBlur={verifierAlterEgo}
                  placeholder="5000"
                  className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200 disabled:opacity-60"
                />
                {alterEgoAlerte && (
                  <div className="mt-3">
                    <AlterEgoAlerteBandeau
                      description={alterEgoAlerte}
                      onDismiss={() => setAlterEgoAlerte(null)}
                    />
                  </div>
                )}
              </div>
              <FinancialDetailSection
                disabled={isBusy}
                coutFournitures={coutFournitures} setCoutFournitures={setCoutFournitures}
                coutSousTraitance={coutSousTraitance} setCoutSousTraitance={setCoutSousTraitance}
                fraisDeplacement={fraisDeplacement} setFraisDeplacement={setFraisDeplacement}
                autresCouts={autresCouts} setAutresCouts={setAutresCouts}
                heuresPassees={heuresPassees} setHeuresPassees={setHeuresPassees}
                tauxHoraireObjectif={tauxHoraireObjectif} setTauxHoraireObjectif={setTauxHoraireObjectif}
              />
            </div>
          </details>

          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
              <WarningCircle size={18} weight="bold" className="shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p>{errorMessage}</p>
                {status === "error" && chantierId && (
                  <button
                    type="button"
                    onClick={handleRetryGenerate}
                    className="inline-flex items-center gap-1.5 mt-2 text-red-700 font-semibold hover:underline"
                  >
                    <ArrowsClockwise size={14} weight="bold" aria-hidden="true" />
                    Relancer la génération
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full inline-flex items-center justify-center gap-2 bg-braise text-white font-semibold text-sm px-6 py-3.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 disabled:opacity-70 disabled:active:scale-100"
          >
            {status === "uploading" && <CircleNotch size={18} weight="bold" className="animate-spin" aria-hidden="true" />}
            {status === "uploading" && "Envoi des photos en cours..."}
            {!isBusy && "Générer mon post"}
          </button>
        </form>
        )
      ) : null}
    </div>
  );
}
