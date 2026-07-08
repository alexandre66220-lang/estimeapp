"use client";

import { useState } from "react";
import { CalendarPlus, X, Check, CircleNotch } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  chantierId: string;
  postId: string;
  textePost: string;
  hashtags: string[];
  imageUrl: string | null;
};

export function ProgrammerPublicationButton({ chantierId, postId, textePost, hashtags, imageUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // unused postId kept for future reference tracking
  void postId;

  async function save() {
    if (!date) return;
    setStatus("saving");
    setErrorMsg(null);

    const datePublication = `${date}T${time}:00`;
    const supabase = createClient();
    const { error } = await supabase.from("posts_programmes").insert({
      chantier_id: chantierId,
      texte_post: textePost,
      hashtags,
      image_url: imageUrl,
      date_publication: datePublication,
      statut: "programme",
    });

    if (error) {
      setErrorMsg("Erreur lors de la programmation. Réessayez.");
      setStatus("error");
    } else {
      setStatus("success");
      setTimeout(() => { setOpen(false); setStatus("idle"); }, 1500);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-medium text-dusk/70 border border-dusk/15 hover:bg-dusk/5 px-4 py-2.5 rounded-full transition-colors duration-200"
      >
        <CalendarPlus size={16} aria-hidden="true" />
        Programmer la publication
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dusk/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-dusk">Programmer la publication</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-dusk/40 hover:text-dusk transition-colors duration-200">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <p className="text-sm text-dusk/60 leading-relaxed line-clamp-3">
              {textePost}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dusk/70 mb-1.5">Date de publication</label>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-braise/30 focus:border-braise/50 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dusk/70 mb-1.5">Heure</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-braise/30 focus:border-braise/50 transition-colors duration-200"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={save}
              disabled={!date || status === "saving" || status === "success"}
              className="w-full flex items-center justify-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-3 rounded-full hover:bg-ambre disabled:opacity-60 transition-all duration-200"
            >
              {status === "saving" && <CircleNotch size={16} className="animate-spin" aria-hidden="true" />}
              {status === "success" && <Check size={16} weight="bold" aria-hidden="true" />}
              {status === "saving" ? "Programmation…" : status === "success" ? "Programmé !" : "Programmer"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
