"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon, Warning, Check } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

type Chantier = { id: string; titre: string };

export function AjouterPhotoChantierModal({
  chantiers,
  trigger,
}: {
  chantiers: Chantier[];
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [chantierId, setChantierId] = useState("");
  const [slot, setSlot] = useState<"avant" | "apres">("apres");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setChantierId("");
    setSlot("apres");
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    setSuccess(false);
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!chantierId || !file) return;
    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expirée.");

      const path = `${user.id}/${chantierId}/${slot}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("chantiers")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (uploadError) throw new Error("Échec de l'envoi de la photo.");

      const column = slot === "avant" ? "photo_avant_url" : "photo_apres_url";
      const { error: updateError } = await supabase
        .from("chantiers")
        .update({ [column]: path })
        .eq("id", chantierId)
        .eq("user_id", user.id);
      if (updateError) throw new Error("Impossible d'associer la photo au chantier.");

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
        >
          <ImageIcon size={16} weight="bold" />
          Ajouter une photo
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-dusk/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dusk/8 shrink-0">
              <h2 className="font-display text-base font-bold text-dusk">Ajouter une photo</h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-dusk/40 hover:text-dusk transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {success ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                    <Check size={24} className="text-green-600" weight="bold" />
                  </div>
                  <p className="text-sm font-semibold text-dusk">Photo ajoutée au chantier</p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-2 text-sm font-medium text-braise hover:underline"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-dusk/50 mb-1.5">Chantier</label>
                    <select
                      value={chantierId}
                      onChange={(e) => setChantierId(e.target.value)}
                      className="w-full px-4 py-2.5 border border-dusk/15 rounded-xl text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30 bg-white"
                    >
                      <option value="">Choisir un chantier</option>
                      {chantiers.map((c) => (
                        <option key={c.id} value={c.id}>{c.titre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-dusk/50 mb-1.5">Type de photo</label>
                    <div className="flex rounded-xl border border-dusk/15 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setSlot("avant")}
                        className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                          slot === "avant" ? "bg-braise text-white" : "bg-white text-dusk/50 hover:text-dusk"
                        }`}
                      >
                        Avant
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlot("apres")}
                        className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                          slot === "apres" ? "bg-braise text-white" : "bg-white text-dusk/50 hover:text-dusk"
                        }`}
                      >
                        Après
                      </button>
                    </div>
                  </div>

                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {preview ? (
                    <div className="relative rounded-xl overflow-hidden border border-dusk/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="Aperçu de la photo" className="w-full h-48 object-cover" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="w-full h-36 rounded-xl border-2 border-dashed border-dusk/20 flex flex-col items-center justify-center gap-2 text-dusk/40 hover:text-dusk/60 hover:border-dusk/30 transition-colors"
                    >
                      <ImageIcon size={26} />
                      <span className="text-sm font-medium">Choisir une photo</span>
                    </button>
                  )}

                  {preview && (
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="text-xs text-dusk/40 hover:text-dusk/60 underline"
                    >
                      Changer de photo
                    </button>
                  )}

                  {error && (
                    <p className="text-sm text-red-500 flex items-center gap-1.5">
                      <Warning size={14} weight="fill" />
                      {error}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!chantierId || !file || isUploading}
                    className="w-full py-3 bg-braise text-white text-sm font-semibold rounded-full hover:bg-ambre transition-colors disabled:opacity-50"
                  >
                    {isUploading ? "Envoi en cours…" : "Ajouter la photo"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
