"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Globe, ArrowSquareOut } from "@phosphor-icons/react";
import { saveVisibleAnnuaire } from "@/app/actions/annuaire";

export function VisibleAnnuaireToggle({
  defaultValue,
  slug,
}: {
  defaultValue: boolean;
  slug: string | null;
}) {
  const [visible, setVisible] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggle() {
    const next = !visible;
    setVisible(next);
    setSaved(false);
    startTransition(async () => {
      await saveVisibleAnnuaire(next);
      setSaved(true);
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 max-w-2xl">
      <div className="flex items-start gap-3 mb-5">
        <Globe size={20} className="text-dusk/40 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg font-bold text-dusk mb-1">Annuaire public</h2>
          <p className="text-sm text-dusk/50">
            Apparaissez dans l&apos;annuaire public sur <strong>estime-app.com/annuaire</strong> pour être trouvé par des clients potentiels.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-dust/50 border border-dusk/8">
        <div>
          <p className="text-sm font-medium text-dusk">Apparaître dans l&apos;annuaire</p>
          <p className="text-xs text-dusk/45 mt-0.5">
            {visible ? "Votre profil est visible dans l'annuaire" : "Votre profil est masqué de l'annuaire"}
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={isPending}
          aria-label={visible ? "Masquer de l'annuaire" : "Afficher dans l'annuaire"}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${
            visible ? "bg-[var(--color-accent,#C75D3B)]" : "bg-dusk/20"
          } disabled:opacity-50`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              visible ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {saved && !isPending && (
        <p className="text-xs text-green-600 font-medium mt-2">
          {visible ? "Votre profil est maintenant visible dans l'annuaire." : "Votre profil a été masqué de l'annuaire."}
        </p>
      )}

      {slug && (
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/annuaire?metier=&ville=`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-dusk/60 hover:text-dusk transition-colors"
          >
            <ArrowSquareOut size={14} />
            Voir l&apos;annuaire
          </Link>
          <Link
            href={`/artisan/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent,#C75D3B)] hover:opacity-80 transition-opacity"
          >
            <ArrowSquareOut size={14} />
            Voir mon profil public
          </Link>
        </div>
      )}
    </div>
  );
}
