"use client";

import { useState, useTransition } from "react";
import { X, Plus } from "@phosphor-icons/react";
import { ajouterEntreeFinanciere } from "@/app/actions/finances-manuelles";

const CATEGORIES_DEPENSE = [
  { value: "fournitures", label: "Fournitures" },
  { value: "sous_traitance", label: "Sous-traitance" },
  { value: "deplacement", label: "Déplacement" },
  { value: "autre", label: "Autre" },
];

const CATEGORIES_RENTREE = [
  { value: "acompte", label: "Acompte" },
  { value: "solde", label: "Solde" },
  { value: "autre_rentree", label: "Autre rentrée" },
];

type Chantier = { id: string; titre: string };

export function AjouterDonneeFinanciereModal({ chantiers }: { chantiers: Chantier[] }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"depense" | "rentree">("rentree");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const categories = type === "depense" ? CATEGORIES_DEPENSE : CATEGORIES_RENTREE;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("type", type);
    startTransition(async () => {
      const result = await ajouterEntreeFinanciere(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
      >
        <Plus size={16} weight="bold" />
        Ajouter une donnée
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-dusk/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dusk/8">
              <h2 className="font-display text-base font-bold text-dusk">Ajouter une donnée financière</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-dusk/40 hover:text-dusk transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type toggle */}
              <div className="flex rounded-xl border border-dusk/15 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setType("rentree")}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                    type === "rentree"
                      ? "bg-braise text-white"
                      : "bg-white text-dusk/50 hover:text-dusk"
                  }`}
                >
                  Rentrée d&apos;argent
                </button>
                <button
                  type="button"
                  onClick={() => setType("depense")}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                    type === "depense"
                      ? "bg-braise text-white"
                      : "bg-white text-dusk/50 hover:text-dusk"
                  }`}
                >
                  Dépense
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Montant */}
                <div>
                  <label className="block text-xs text-dusk/50 mb-1.5">Montant (€) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="montant"
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-dusk/15 rounded-xl text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30 pr-7"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dusk/40 text-xs">€</span>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs text-dusk/50 mb-1.5">Date *</label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={today}
                    className="w-full px-4 py-2.5 border border-dusk/15 rounded-xl text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30"
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs text-dusk/50 mb-1.5">Catégorie *</label>
                <select
                  name="categorie"
                  required
                  key={type}
                  className="w-full px-4 py-2.5 border border-dusk/15 rounded-xl text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Chantier associé (optionnel) */}
              {chantiers.length > 0 && (
                <div>
                  <label className="block text-xs text-dusk/50 mb-1.5">Chantier associé (optionnel)</label>
                  <select
                    name="chantier_id"
                    className="w-full px-4 py-2.5 border border-dusk/15 rounded-xl text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30 bg-white"
                  >
                    <option value="">Aucun chantier</option>
                    {chantiers.map((c) => (
                      <option key={c.id} value={c.id}>{c.titre}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-xs text-dusk/50 mb-1.5">Note libre</label>
                <textarea
                  name="note"
                  rows={2}
                  placeholder="Précision optionnelle…"
                  className="w-full px-4 py-2.5 border border-dusk/15 rounded-xl text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30 resize-none"
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 border border-dusk/15 text-sm text-dusk/60 font-medium rounded-full hover:bg-dust/50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-braise text-white text-sm font-semibold rounded-full hover:bg-ambre transition-colors disabled:opacity-50"
                >
                  {isPending ? "Ajout…" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
