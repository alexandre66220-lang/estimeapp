"use client";

import { useRef, useState } from "react";
import { X, PaperPlaneTilt, Spinner, Check, WarningCircle } from "@phosphor-icons/react";

type Props = {
  slug: string;
  artisanNom: string;
};

export function ContactModal({ slug, artisanNom }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openModal = () => {
    setOpen(true);
    setSent(false);
    setError(null);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  };

  const closeModal = () => {
    dialogRef.current?.close();
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      slug,
      prenom: fd.get("prenom") as string,
      nom: fd.get("nom") as string,
      email: fd.get("email") as string,
      telephone: fd.get("telephone") as string,
      message: fd.get("message") as string,
    };

    try {
      const res = await fetch("/api/artisan/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? "Erreur d'envoi.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-2 bg-[#C75D3B] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#B8512F] active:scale-[0.97] transition-all duration-200 shadow-sm"
      >
        <PaperPlaneTilt size={16} weight="bold" aria-hidden="true" />
        Nous contacter
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-[#2B2521]/60 backdrop-blur-sm z-40"
          onClick={closeModal}
          aria-hidden="true"
        />
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="fixed z-50 m-auto w-full max-w-md rounded-2xl bg-[#F8F5F2] p-0 shadow-2xl backdrop:bg-transparent open:flex open:flex-col"
        style={{ border: "none", maxHeight: "90dvh", overflow: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2B2521]/8">
          <div>
            <h2 className="text-base font-bold text-[#2B2521]">Contacter {artisanNom}</h2>
            <p className="text-xs text-[#2B2521]/50 mt-0.5">Votre message sera envoyé directement.</p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-2 rounded-full hover:bg-[#2B2521]/8 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-5">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#C75D3B]/10 flex items-center justify-center">
                <Check size={24} className="text-[#C75D3B]" weight="bold" />
              </div>
              <p className="font-semibold text-[#2B2521]">Message envoyé !</p>
              <p className="text-sm text-[#2B2521]/60">{artisanNom} vous répondra par email.</p>
              <button
                type="button"
                onClick={closeModal}
                className="mt-2 text-sm font-medium text-[#C75D3B] hover:underline"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="flex items-center gap-2 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
                  <WarningCircle size={16} weight="bold" className="shrink-0" />
                  {error}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#2B2521]/60 mb-1">
                    Prénom <span className="text-[#C75D3B]">*</span>
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    required
                    placeholder="Jean"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#2B2521]/12 bg-white text-[#2B2521] text-sm placeholder:text-[#2B2521]/30 focus:outline-none focus:ring-2 focus:ring-[#C75D3B]/30 focus:border-[#C75D3B]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2B2521]/60 mb-1">
                    Nom <span className="text-[#C75D3B]">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    required
                    placeholder="Dupont"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#2B2521]/12 bg-white text-[#2B2521] text-sm placeholder:text-[#2B2521]/30 focus:outline-none focus:ring-2 focus:ring-[#C75D3B]/30 focus:border-[#C75D3B]/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2B2521]/60 mb-1">
                  Email <span className="text-[#C75D3B]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="jean@exemple.fr"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#2B2521]/12 bg-white text-[#2B2521] text-sm placeholder:text-[#2B2521]/30 focus:outline-none focus:ring-2 focus:ring-[#C75D3B]/30 focus:border-[#C75D3B]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2B2521]/60 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  placeholder="06 12 34 56 78"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#2B2521]/12 bg-white text-[#2B2521] text-sm placeholder:text-[#2B2521]/30 focus:outline-none focus:ring-2 focus:ring-[#C75D3B]/30 focus:border-[#C75D3B]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2B2521]/60 mb-1">
                  Message <span className="text-[#C75D3B]">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  maxLength={2000}
                  placeholder="Bonjour, je souhaite obtenir un devis pour…"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#2B2521]/12 bg-white text-[#2B2521] text-sm placeholder:text-[#2B2521]/30 focus:outline-none focus:ring-2 focus:ring-[#C75D3B]/30 focus:border-[#C75D3B]/50 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#C75D3B] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#B8512F] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Spinner size={16} className="animate-spin" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    <PaperPlaneTilt size={16} weight="bold" />
                    Envoyer le message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
