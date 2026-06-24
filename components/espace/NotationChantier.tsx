"use client";

import { useState } from "react";
import { Star, Check, CircleNotch } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

export function NotationChantier({ chantierId }: { chantierId: string }) {
  const [note, setNote] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    if (note === 0) return;
    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("chantiers")
      .update({ note, commentaire_interne: commentaire.trim() || null })
      .eq("id", chantierId);

    setStatus(error ? "error" : "saved");
  }

  const displayed = hovered || note;

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-6">
      <h2 className="font-display text-lg font-bold text-dusk mb-1">
        Comment s&apos;est passé ce chantier ?
      </h2>
      <p className="text-dusk/50 text-sm mb-5">
        Notez votre satisfaction pour vos propres statistiques. C&apos;est
        optionnel, et seulement visible par vous.
      </p>

      <div className="flex items-center gap-1.5 mb-5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
            onClick={() => setNote(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5"
          >
            <Star
              size={28}
              weight={value <= displayed ? "fill" : "regular"}
              className={value <= displayed ? "text-ambre" : "text-dusk/20"}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      <label
        htmlFor="commentaire_interne"
        className="block text-sm font-medium text-dusk/70 mb-1.5"
      >
        Note privée (visible uniquement par vous)
      </label>
      <textarea
        id="commentaire_interne"
        value={commentaire}
        onChange={(event) => setCommentaire(event.target.value)}
        rows={3}
        placeholder="Ce qui s'est bien passé, ce qui pourrait être amélioré..."
        className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200 resize-none mb-4"
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={note === 0 || status === "saving"}
        className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
      >
        {status === "saving" && (
          <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden="true" />
        )}
        {status === "saved" && <Check size={16} weight="bold" aria-hidden="true" />}
        {status === "saved" ? "Enregistré" : "Enregistrer"}
      </button>

      {status === "error" && (
        <p className="text-red-700 text-xs mt-2">
          Impossible d&apos;enregistrer la note. Réessayez.
        </p>
      )}
    </div>
  );
}
