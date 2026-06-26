"use client";

import { X } from "@phosphor-icons/react";
import { addClient } from "@/app/actions/clients";

export function AjouterClientModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-dusk/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-client-title"
    >
      <div className="bg-white rounded-2xl p-6 lg:p-8 w-full max-w-md">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 id="add-client-title" className="font-display text-xl font-bold text-dusk">
            Ajouter un client
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 flex items-center justify-center rounded-full text-dusk/40 hover:bg-dusk/5 transition-colors duration-200"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form action={addClient} className="space-y-5">
          <input type="hidden" name="redirectTo" value="/espace/clients" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-dusk/70 mb-1.5">
                Prénom
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                required
                className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
                placeholder="Jean"
              />
            </div>
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-dusk/70 mb-1.5">
                Nom
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                required
                className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
                placeholder="Dupont"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dusk/70 mb-1.5">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
              placeholder="jean@exemple.fr"
            />
          </div>
          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-dusk/70 mb-1.5">
              Téléphone (optionnel)
            </label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
              placeholder="06 12 34 56 78"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
          >
            Ajouter
          </button>
        </form>
      </div>
    </div>
  );
}
