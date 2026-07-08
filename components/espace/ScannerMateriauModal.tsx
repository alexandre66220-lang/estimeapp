"use client";

import { useRef, useState, useTransition } from "react";
import { X, Camera, Warning } from "@phosphor-icons/react";
import { analyserPhotoMateriau } from "@/app/actions/materiau";
import { MateriauScanResult } from "./MateriauScanResult";
import type { AnalyseMateriau } from "@/lib/anthropic/analyze-materiau";

type Chantier = { id: string; titre: string };

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
  const [chantierChoisi, setChantierChoisi] = useState(chantierId ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setPreview(null);
    setFile(null);
    setError(null);
    setAnalyse(null);
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
    setAnalyse(null);
    setPreview(URL.createObjectURL(f));
  }

  function handleAnalyser() {
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.set("image", file);
    if (chantierChoisi) formData.set("chantier_id", chantierChoisi);

    startTransition(async () => {
      const result = await analyserPhotoMateriau(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.analyse) setAnalyse(result.analyse);
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
                  {!chantierId && chantiers && chantiers.length > 0 && (
                    <div>
                      <label className="block text-xs text-dusk/50 mb-1.5">Chantier associé (optionnel)</label>
                      <select
                        value={chantierChoisi}
                        onChange={(e) => setChantierChoisi(e.target.value)}
                        className="w-full px-4 py-2.5 border border-dusk/15 rounded-xl text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30 bg-white"
                      >
                        <option value="">Aucun chantier</option>
                        {chantiers.map((c) => (
                          <option key={c.id} value={c.id}>{c.titre}</option>
                        ))}
                      </select>
                    </div>
                  )}

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
                    <p className="text-xs text-green-600 font-medium text-center">
                      {chantierChoisi
                        ? "Ajouté au journal du chantier"
                        : "Fiche enregistrée dans vos scans"}
                    </p>
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
