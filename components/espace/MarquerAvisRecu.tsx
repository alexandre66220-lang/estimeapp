"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Check, CircleNotch, X } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

export function MarquerAvisRecu({
  chantierId,
  clientPrenom,
  clientEmail,
}: {
  chantierId: string;
  clientPrenom: string | null;
  clientEmail: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [dateAvis, setDateAvis] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  function closeModal() {
    setOpen(false);
    setNote(0);
    setStatus("idle");
  }

  async function handleConfirm() {
    if (note === 0) return;
    setStatus("saving");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus("error");
      return;
    }

    const { error } = await supabase.from("avis").insert({
      user_id: user.id,
      chantier_id: chantierId,
      client_prenom: clientPrenom?.trim() || "Client",
      client_email: clientEmail,
      note_google: note,
      date_avis: dateAvis,
    });

    if (error) {
      setStatus("error");
      return;
    }

    closeModal();
    router.refresh();
  }

  const displayed = hovered || note;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
      >
        <Star size={16} weight="fill" aria-hidden="true" />
        Marquer comme avis reçu
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-dusk/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="marquer-avis-titre"
        >
          <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-md w-full">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 id="marquer-avis-titre" className="font-display text-lg font-bold text-dusk">
                Avis Google reçu
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Fermer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-dusk/40 hover:bg-dusk/5 transition-colors duration-200"
              >
                <X size={16} weight="bold" aria-hidden="true" />
              </button>
            </div>

            <p className="text-sm font-medium text-dusk/70 mb-1.5">Note Google reçue</p>
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

            <label htmlFor="date-avis" className="block text-sm font-medium text-dusk/70 mb-1.5">
              Date de réception de l&apos;avis
            </label>
            <input
              id="date-avis"
              type="date"
              value={dateAvis}
              onChange={(event) => setDateAvis(event.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200 mb-5"
            />

            {status === "error" && (
              <p className="text-red-700 text-xs mb-4">
                Impossible d&apos;enregistrer l&apos;avis. Réessayez.
              </p>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={note === 0 || status === "saving"}
              className="w-full inline-flex items-center justify-center gap-2 bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
            >
              {status === "saving" ? (
                <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden="true" />
              ) : (
                <Check size={16} weight="bold" aria-hidden="true" />
              )}
              Confirmer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
