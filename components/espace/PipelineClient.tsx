"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Check,
  WarningCircle,
  X,
  CircleNotch,
} from "@phosphor-icons/react";
import { addProspect } from "@/app/actions/crm";
import { KanbanBoard } from "./KanbanBoard";
import type { Client } from "@/lib/supabase/clients";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
    >
      {pending ? <CircleNotch size={16} className="animate-spin" /> : null}
      {pending ? "Ajout…" : "Ajouter le prospect"}
    </button>
  );
}

export function PipelineClient({
  clients,
  message,
  error,
}: {
  clients: Client[];
  message?: string;
  error?: string;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {message && (
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-ambre/10 text-braise text-sm px-4 py-3">
          <Check size={16} weight="bold" className="shrink-0" />
          {message}
        </p>
      )}
      {error && (
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          <WarningCircle size={16} weight="bold" className="shrink-0" />
          {error}
        </p>
      )}

      <KanbanBoard
        initialClients={clients}
        onAddProspect={() => setShowModal(true)}
      />

      {/* Modal ajout prospect */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-dusk/50 backdrop-blur-sm z-40"
            onClick={() => setShowModal(false)}
            aria-hidden="true"
          />
          <div className="fixed z-50 inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold text-dusk">
                  Nouveau prospect
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-dusk/8 transition-colors"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              <form action={addProspect} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-dusk/60 mb-1">
                      Prénom <span className="text-braise">*</span>
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      required
                      placeholder="Jean"
                      className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dusk/60 mb-1">
                      Nom <span className="text-braise">*</span>
                    </label>
                    <input
                      type="text"
                      name="nom"
                      required
                      placeholder="Dupont"
                      className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-dusk/60 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="jean@exemple.fr"
                    className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dusk/60 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    placeholder="06 12 34 56 78"
                    className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all"
                  />
                </div>
                <SubmitButton />
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
