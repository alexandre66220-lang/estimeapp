"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Check, WarningCircle, UploadSimple, Spinner } from "@phosphor-icons/react";
import { uploadLogo } from "@/app/actions/profile";

export function LogoUpload({ currentLogoUrl }: { currentLogoUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentLogoUrl);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setResult({ type: "err", text: "Le logo ne doit pas dépasser 2 Mo." });
      e.target.value = "";
      return;
    }
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await uploadLogo(formData);
      if (res.error) {
        setResult({ type: "err", text: res.error });
      } else {
        setResult({ type: "ok", text: "Logo enregistré." });
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 max-w-2xl">
      <h2 className="font-display text-lg font-bold text-dusk mb-1">Votre logo</h2>
      <p className="text-dusk/50 text-sm mb-5">
        Utilisé en filigrane sur les visuels avant/après générés.{" "}
        <span className="text-dusk/40">Format PNG avec fond transparent recommandé.</span>
      </p>

      {result?.type === "ok" && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-ambre/10 text-braise text-sm px-4 py-3">
          <Check size={16} weight="bold" className="shrink-0" aria-hidden="true" />
          {result.text}
        </p>
      )}
      {result?.type === "err" && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          <WarningCircle size={16} weight="bold" className="shrink-0" aria-hidden="true" />
          {result.text}
        </p>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-start gap-5">
          {/* Aperçu */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-dusk/15 bg-dust flex items-center justify-center overflow-hidden hover:border-ambre/40 transition-colors duration-200"
            aria-label="Choisir un logo"
          >
            {preview ? (
              <Image
                src={preview}
                alt="Aperçu logo"
                width={96}
                height={96}
                className="object-contain w-full h-full p-1"
                unoptimized
              />
            ) : (
              <UploadSimple size={24} className="text-dusk/30" aria-hidden="true" />
            )}
          </button>

          <div className="flex-1">
            <label className="block text-sm font-medium text-dusk/70 mb-1.5">
              Fichier logo
            </label>
            <input
              ref={inputRef}
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="w-full text-sm text-dusk/60 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ambre/10 file:text-braise hover:file:bg-ambre/20 transition-all duration-200"
            />
            <p className="text-dusk/35 text-xs mt-1.5">PNG transparent · max 2 Mo</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !preview}
          className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isPending ? (
            <>
              <Spinner size={16} className="animate-spin" aria-hidden="true" />
              Sauvegarde…
            </>
          ) : (
            "Sauvegarder le logo"
          )}
        </button>
      </form>
    </div>
  );
}
