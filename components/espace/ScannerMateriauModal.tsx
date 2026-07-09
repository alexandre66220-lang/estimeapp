"use client";

import { useRef, useState, useTransition } from "react";
import { X, Camera, Warning, Check } from "@phosphor-icons/react";
import { analyserPhotoMateriau, associerScanMateriau } from "@/app/actions/materiau";
import { MateriauScanResult } from "./MateriauScanResult";
import type { AnalyseMateriau } from "@/lib/anthropic/analyze-materiau";

type Chantier = { id: string; titre: string };

const TAILLE_MAX_PX = 1200;
const QUALITE_COMPRESSION = 0.85;

async function compresserImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(1, TAILLE_MAX_PX / Math.max(bitmap.width, bitmap.height));
    const largeur = Math.round(bitmap.width * ratio);
    const hauteur = Math.round(bitmap.height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = largeur;
    canvas.height = hauteur;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, largeur, hauteur);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITE_COMPRESSION)
    );
    if (!blob) return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    // En cas d'échec de compression (navigateur incompatible…), on envoie l'original
    return file;
  }
}

export function ScannerMateriauModal({
  chantierId,
  chantiers,
  trigger,
}: {
  chantierId?: string;
  chantiers?: Chantier[];
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [analyse, setAnalyse] = useState<AnalyseMateriau | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [chantierAssocie, setChantierAssocie] = useState("");
  const [associationSauvegardee, setAssociationSauvegardee] = useState(false);
  const [isAssociating, startAssociating] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const chantierPreselectionne = Boolean(chantierId);

  function reset() {
    setPreview(null);
    setFile(null);
    setError(null);
    setAnalyse(null);
    setScanId(null);
    setChantierAssocie("");
    setAssociationSauvegardee(false);
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    setAnalyse(null);
    const compressed = await compresserImage(f);
    setFile(compressed);
    setPreview(URL.createObjectURL(compressed));
  }

  function handleAnalyser() {
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.set("image", file);
    if (chantierId) formData.set("chantier_id", chantierId);

    startTransition(async () => {
      const result = await analyserPhotoMateriau(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.analyse) {
        setAnalyse(result.analyse);
        setScanId(result.scanId ?? null);
      }
    });
  }

  function handleAssocier() {
    if (!scanId || !chantierAssocie) return;
    startAssociating(async () => {
      const result = await associerScanMateriau(scanId, chantierAssocie);
      if (!result.error) setAssociationSauvegardee(true);
    });
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
          <Camera size={16} weight="bold" />
          Scanner un matériau
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-dusk/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dusk/8 shrink-0">
              <h2 className="font-display text-base font-bold text-dusk">Scanner un matériau</h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-dusk/40 hover:text-dusk transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {!analyse && (
                <>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {preview ? (
                    <div className="relative rounded-xl overflow-hidden border border-dusk/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="Aperçu du matériau" className="w-full h-56 object-cover" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="w-full h-40 rounded-xl border-2 border-dashed border-dusk/20 flex flex-col items-center justify-center gap-2 text-dusk/40 hover:text-dusk/60 hover:border-dusk/30 transition-colors"
                    >
                      <Camera size={28} />
                      <span className="text-sm font-medium">Prendre ou choisir une photo</span>
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
                    onClick={handleAnalyser}
                    disabled={!file || isPending}
                    className="w-full py-3 bg-braise text-white text-sm font-semibold rounded-full hover:bg-ambre transition-colors disabled:opacity-50"
                  >
                    {isPending ? "Analyse en cours…" : "Analyser le matériau"}
                  </button>

                  <p className="text-xs text-dusk/35 text-center">
                    jpg, png ou webp · 10 Mo maximum
                  </p>
                </>
              )}

              {analyse && (
                <MateriauScanResult
                  analyse={analyse}
                  imagePreview={preview}
                  onFermer={handleClose}
                  footer={
                    chantierPreselectionne ? (
                      <p className="text-xs text-green-600 font-medium text-center">
                        Ajouté au journal du chantier
                      </p>
                    ) : associationSauvegardee ? (
                      <p className="text-xs text-green-600 font-medium text-center">
                        Associé au chantier
                      </p>
                    ) : chantiers && chantiers.length > 0 ? (
                      <div className="space-y-2 rounded-xl bg-dust/60 border border-dusk/8 p-3">
                        <label className="block text-xs text-dusk/50">Associer à un chantier (optionnel)</label>
                        <div className="flex gap-2">
                          <select
                            value={chantierAssocie}
                            onChange={(e) => setChantierAssocie(e.target.value)}
                            className="flex-1 px-3 py-2 border border-dusk/15 rounded-xl text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30 bg-white"
                          >
                            <option value="">Aucun chantier</option>
                            {chantiers.map((c) => (
                              <option key={c.id} value={c.id}>{c.titre}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleAssocier}
                            disabled={!chantierAssocie || isAssociating}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-braise text-white text-sm font-semibold rounded-xl hover:bg-ambre transition-colors disabled:opacity-50 shrink-0"
                          >
                            <Check size={14} weight="bold" />
                            {isAssociating ? "…" : "OK"}
                          </button>
                        </div>
                        <p className="text-xs text-dusk/35">
                          Sans association, la fiche reste dans vos scans non associés.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 font-medium text-center">
                        Fiche enregistrée dans vos scans
                      </p>
                    )
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
