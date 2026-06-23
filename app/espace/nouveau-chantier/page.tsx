"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ImageSquare,
  X,
  Check,
  CircleNotch,
  WarningCircle,
  ArrowsClockwise,
  Plus,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { ShareActions } from "@/components/espace/ShareActions";
import { NotationChantier } from "@/components/espace/NotationChantier";

type Photo = { file: File; preview: string };

type Status = "idle" | "uploading" | "generating" | "success" | "error";

type GeneratedPost = { contenu: string; image_url: string };

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
            <Image
              src={photo.preview}
              alt={`Aperçu photo ${label.toLowerCase()}`}
              fill
              unoptimized
              className="object-cover"
            />
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

export default function NouveauChantier() {
  const [titre, setTitre] = useState("");
  const [avant, setAvant] = useState<Photo | null>(null);
  const [apres, setApres] = useState<Photo | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [post, setPost] = useState<GeneratedPost | null>(null);
  const [caption, setCaption] = useState("");

  const [chantierId, setChantierId] = useState<string | null>(null);
  const isBusy = status === "uploading" || status === "generating";

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

  async function generatePost(chantierId: string) {
    setStatus("generating");
    const response = await fetch("/api/generate-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chantierId }),
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error ?? "La génération du post a échoué.");
    }
    setPost(json.post);
    setCaption(json.post.contenu);
    setStatus("success");
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Votre session a expiré. Reconnectez-vous puis réessayez.");
      }
      const userId = user.id;

      const newChantierId = crypto.randomUUID();

      async function uploadPhoto(photo: Photo, name: "avant" | "apres") {
        const path = `${userId}/${newChantierId}/${name}.jpg`;
        const { error } = await supabase.storage
          .from("chantiers")
          .upload(path, photo.file, { contentType: photo.file.type, upsert: true });
        if (error) {
          throw new Error(`L'envoi de la photo ${name} a échoué. Réessayez.`);
        }
        return supabase.storage.from("chantiers").getPublicUrl(path).data.publicUrl;
      }

      const photoAvantUrl = avant ? await uploadPhoto(avant, "avant") : null;
      const photoApresUrl = apres ? await uploadPhoto(apres, "apres") : null;

      const { error: insertError } = await supabase.from("chantiers").insert({
        id: newChantierId,
        user_id: userId,
        titre: titre.trim(),
        photo_avant_url: photoAvantUrl,
        photo_apres_url: photoApresUrl,
      });
      if (insertError) {
        throw new Error("La création du chantier a échoué. Réessayez.");
      }

      setChantierId(newChantierId);
      await generatePost(newChantierId);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  }

  async function handleRetryGenerate() {
    if (!chantierId) return;
    setErrorMessage(null);
    try {
      await generatePost(chantierId);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  }

  function handleReset() {
    if (avant) URL.revokeObjectURL(avant.preview);
    if (apres) URL.revokeObjectURL(apres.preview);
    setTitre("");
    setAvant(null);
    setApres(null);
    setStatus("idle");
    setErrorMessage(null);
    setPost(null);
    setCaption("");
    setChantierId(null);
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

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Nouveau chantier</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Ajoutez vos photos avant/après, Estime génère votre post Instagram.
        </p>
      </div>

      {status === "success" && post ? (
        <>
        <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
          <div className="flex items-center gap-2 text-braise mb-5">
            <Check size={18} weight="bold" aria-hidden="true" />
            <span className="text-sm font-semibold">Post Instagram généré</span>
          </div>

          <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-5 bg-dust-dark">
            <Image
              src={post.image_url}
              alt="Photo du chantier utilisée pour le post"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>

          <label htmlFor="caption" className="block text-sm font-medium text-dusk/70 mb-1.5">
            Légende
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={7}
            className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200 resize-none"
          />
          <p className="text-dusk/45 text-xs mt-1.5 mb-6">
            Ajustez le texte si besoin, puis publiez-le manuellement avec la photo sur vos réseaux.
          </p>

          <div className="mb-6">
            <ShareActions caption={caption} imageUrl={post.image_url} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-dusk/8">
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
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 space-y-6"
        >
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
              onChange={(event) => setTitre(event.target.value)}
              placeholder="Ravalement façade, 12 rue des Tilleuls"
              className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200 disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PhotoField
              inputId="photo-avant"
              label="Photo avant"
              photo={avant}
              disabled={isBusy}
              onSelect={(file) => setPhoto("avant", file)}
              onClear={() => clearPhoto("avant")}
            />
            <PhotoField
              inputId="photo-apres"
              label="Photo après"
              photo={apres}
              disabled={isBusy}
              onSelect={(file) => setPhoto("apres", file)}
              onClear={() => clearPhoto("apres")}
            />
          </div>
          <p className="text-dusk/45 text-xs">
            Au moins une des deux photos est nécessaire.
          </p>

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
            {isBusy && <CircleNotch size={18} weight="bold" className="animate-spin" aria-hidden="true" />}
            {status === "uploading" && "Envoi des photos en cours..."}
            {status === "generating" && "Génération du post (environ 30 secondes)..."}
            {!isBusy && "Générer mon post"}
          </button>
        </form>
      )}
    </div>
  );
}
