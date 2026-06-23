"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  X,
  Trash,
  MagnifyingGlass,
  Check,
  WarningCircle,
  AddressBook,
} from "@phosphor-icons/react";
import { addClient, deleteClient } from "@/app/actions/clients";

export type Client = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  created_at: string;
};

export function ClientsManager({
  clients,
  message,
  error,
}: {
  clients: Client[];
  message?: string;
  error?: string;
}) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) =>
      `${client.prenom} ${client.nom} ${client.email}`.toLowerCase().includes(query)
    );
  }, [clients, search]);

  return (
    <div>
      {message && (
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-ambre/10 text-braise text-sm px-4 py-3">
          <Check size={16} weight="bold" className="shrink-0" aria-hidden="true" />
          {message}
        </p>
      )}
      {error && (
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          <WarningCircle size={16} weight="bold" className="shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-dusk/35"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-dusk/15 bg-white text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
          />
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 shrink-0"
        >
          <Plus size={18} weight="bold" aria-hidden="true" />
          Ajouter un client
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dusk/8 py-20 px-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-ambre/10 rounded-full flex items-center justify-center mb-5">
            <AddressBook size={26} className="text-ambre" aria-hidden="true" />
          </div>
          <h3 className="font-display text-xl font-bold text-dusk mb-2">
            {clients.length === 0 ? "Aucun client pour l'instant" : "Aucun résultat"}
          </h3>
          <p className="text-dusk/50 text-sm max-w-[40ch]">
            {clients.length === 0
              ? "Ajoutez vos clients pour gagner du temps lors de vos demandes d'avis."
              : "Essayez une autre recherche."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/8">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-dusk truncate">
                  {client.prenom} {client.nom}
                </p>
                <p className="text-dusk/45 text-xs mt-0.5 truncate">{client.email}</p>
              </div>
              <form action={deleteClient}>
                <input type="hidden" name="clientId" value={client.id} />
                <button
                  type="submit"
                  aria-label={`Supprimer ${client.prenom} ${client.nom}`}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-dusk/40 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                >
                  <Trash size={16} weight="bold" aria-hidden="true" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
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
                onClick={() => setModalOpen(false)}
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
      )}
    </div>
  );
}
