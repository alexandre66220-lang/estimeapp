"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Crown,
  Check,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/client";
import { updateClientDetails } from "@/app/actions/crm";
import { NotesClient } from "@/components/espace/NotesClient";
import { StatutSelector } from "@/components/espace/StatutSelector";
import { COLONNES } from "@/components/espace/KanbanBoard";
import type { ClientStatut } from "@/lib/supabase/clients";

const SOURCES = [
  "Bouche à oreille",
  "Google",
  "Instagram",
  "Panneau chantier",
  "Site web",
  "Autre",
];

type Client = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  statut: ClientStatut;
  source: string | null;
  est_vip: boolean;
  derniere_interaction: string | null;
  montant_estime: number | null;
  created_at: string;
  est_mauvais_payeur: boolean;
  delai_moyen_paiement: number | null;
  taux_recouvrement: number | null;
  total_encaisse: number | null;
};

type Note = { id: string; contenu: string; created_at: string };
type Chantier = { id: string; titre: string; montant: number | null; statut: string; created_at: string };
type Paiement = {
  id: string;
  chantier_id: string;
  type: string;
  montant: number | null;
  statut: string;
  date_prevue: string | null;
  date_encaissement: string | null;
};

export default function FicheClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const error = searchParams.get("error");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [avisCount, setAvisCount] = useState(0);
  const [paiementsClient, setPaiementsClient] = useState<Paiement[]>([]);

  useEffect(() => {
    document.title = "Fiche client, Estime";
  }, []);

  useEffect(() => {
    let cancelled = false;
    const id = params.id;

    async function load() {
      setLoading(true);
      setLoadError(null);
      setNotFoundState(false);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/connexion");
          return;
        }

        const [
          { data: clientData, error: clientError },
          { data: notesData, error: notesError },
          { data: chantiersData, error: chantiersError },
          { data: avisData, error: avisError },
          { data: paiementsData, error: paiementsError },
        ] = await Promise.all([
          supabase
            .from("clients")
            .select(
              "id, prenom, nom, email, telephone, statut, source, est_vip, derniere_interaction, montant_estime, created_at, est_mauvais_payeur, delai_moyen_paiement, taux_recouvrement, total_encaisse"
            )
            .eq("id", id)
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("notes_client")
            .select("id, contenu, created_at")
            .eq("client_id", id)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("chantiers")
            .select("id, titre, montant, statut, created_at")
            .eq("client_id", id)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("avis")
            .select("id, note_google")
            .eq("user_id", user.id),
          supabase
            .from("paiements_chantier")
            .select("id, chantier_id, type, montant, statut, date_prevue, date_encaissement")
            .eq("user_id", user.id)
            .order("date_encaissement", { ascending: false })
            .order("created_at", { ascending: false }),
        ]);

        if (cancelled) return;

        if (clientError) throw clientError;
        if (notesError) throw notesError;
        if (chantiersError) throw chantiersError;
        if (avisError) throw avisError;
        if (paiementsError) throw paiementsError;

        if (!clientData) {
          setNotFoundState(true);
          return;
        }

        setClient(clientData);
        setNotes(notesData ?? []);
        setChantiers(chantiersData ?? []);
        setAvisCount(avisData?.length ?? 0);
        setPaiementsClient(paiementsData ?? []);
      } catch (err) {
        if (cancelled) return;
        console.error("[fiche-client]", err);
        setLoadError(
          err instanceof Error ? err.message : "Une erreur inattendue est survenue."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id, router]);

  if (loading) {
    return <FicheClientSkeleton />;
  }

  if (notFoundState) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display text-xl font-bold text-dusk mb-2">Client introuvable</h1>
        <p className="text-dusk/50 text-sm mb-6">
          Ce client n&apos;existe pas ou vous n&apos;y avez pas accès.
        </p>
        <Link
          href="/espace/clients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-braise hover:text-dusk transition-colors"
        >
          <ArrowLeft size={16} weight="bold" aria-hidden="true" />
          Retour aux clients
        </Link>
      </div>
    );
  }

  if (loadError || !client) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <WarningCircle size={28} weight="bold" className="text-red-600" />
        </div>
        <h1 className="font-display text-xl font-bold text-dusk mb-2">
          Impossible d&apos;afficher cette fiche client
        </h1>
        <p className="text-dusk/50 text-sm mb-6">{loadError ?? "Une erreur inattendue est survenue."}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="px-5 py-2.5 rounded-full bg-braise text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Réessayer
          </button>
          <Link
            href="/espace/clients"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-dusk/15 text-dusk text-sm font-semibold hover:bg-dusk/5 transition-colors"
          >
            <ArrowLeft size={16} weight="bold" />
            Retour aux clients
          </Link>
        </div>
      </div>
    );
  }

  const col = COLONNES.find((c) => c.statut === client.statut);
  const totalCA = chantiers.reduce((s, c) => s + (c.montant ?? 0), 0);
  const nbChantiers = chantiers.length;
  const premierChantier = chantiers.at(-1)?.created_at;
  const dernierChantier = chantiers.at(0)?.created_at;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
      <Link
        href="/espace/clients"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-dusk/60 hover:text-dusk transition-colors duration-200 mb-6"
      >
        <ArrowLeft size={16} weight="bold" aria-hidden="true" />
        Mes clients
      </Link>

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-dusk">
              {client.prenom} {client.nom}
            </h1>
            {client.est_vip && (
              <Crown size={20} weight="fill" className="text-ambre mt-1" aria-label="VIP" />
            )}
          </div>
          <p className="text-dusk/45 text-sm mt-1">{client.email}</p>
          {client.telephone && (
            <p className="text-dusk/45 text-sm">{client.telephone}</p>
          )}
        </div>
        {col && (
          <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${col.bg} ${col.couleur}`}>
            {col.label}
          </span>
        )}
      </div>

      {/* Alerte mauvais payeur */}
      {client.est_mauvais_payeur && (
        <div className="mb-6 flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4">
          <WarningCircle size={20} weight="fill" className="text-orange-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              Attention : ce client a un historique de retards de paiement
            </p>
            <p className="text-xs text-orange-700 mt-0.5">
              Ce client a été signalé automatiquement suite à plusieurs paiements en retard.
            </p>
          </div>
        </div>
      )}

      {message && (
        <p className="mb-6 flex items-center gap-2 rounded-xl bg-ambre/10 text-braise text-sm px-4 py-3">
          <Check size={16} weight="bold" className="shrink-0" />
          {message}
        </p>
      )}
      {error && (
        <p className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          <WarningCircle size={16} weight="bold" className="shrink-0" />
          {error}
        </p>
      )}

      <div className="space-y-6">
        {/* Statut pipeline */}
        <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
          <h2 className="font-display text-lg font-bold text-dusk mb-4">Statut pipeline</h2>
          <StatutSelector clientId={client.id} currentStatut={client.statut} />
        </div>

        {/* Infos client */}
        <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
          <h2 className="font-display text-lg font-bold text-dusk mb-5">Informations</h2>
          <form action={updateClientDetails} className="space-y-5">
            <input type="hidden" name="clientId" value={client.id} />

            {/* Source */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-dusk/70 mb-1.5">
                Source
              </label>
              <select
                id="source"
                name="source"
                defaultValue={client.source ?? ""}
                className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all"
              >
                <option value="">(Non renseigné)</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Montant estimé */}
            <div>
              <label htmlFor="montantEstime" className="block text-sm font-medium text-dusk/70 mb-1.5">
                Montant estimé des travaux (€)
              </label>
              <input
                type="number"
                id="montantEstime"
                name="montantEstime"
                min="0"
                step="100"
                defaultValue={client.montant_estime ?? ""}
                placeholder="5000"
                className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all"
              />
            </div>

            {/* VIP */}
            <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-dust">
              <div>
                <p className="text-sm font-medium text-dusk">Client VIP</p>
                <p className="text-xs text-dusk/45 mt-0.5">
                  Affiche une couronne sur la carte pipeline.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="estVip"
                  value="true"
                  defaultChecked={client.est_vip}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-dusk/20 peer-focus:ring-2 peer-focus:ring-ambre/30 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ambre" />
              </label>
              <input type="hidden" name="estVip" value="false" />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 text-dusk font-medium text-sm px-5 py-2.5 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
            >
              Enregistrer
            </button>
          </form>
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
          <h2 className="font-display text-lg font-bold text-dusk mb-5">Statistiques</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard emoji="💶" label="CA total" value={totalCA > 0 ? `${totalCA.toLocaleString("fr-FR")} €` : "-"} />
            <StatCard emoji="🏗️" label="Chantiers" value={nbChantiers > 0 ? String(nbChantiers) : "-"} />
            <StatCard emoji="⭐" label="Avis Google" value={String(avisCount)} />
            {premierChantier && (
              <StatCard emoji="📅" label="1er chantier" value={fmt(premierChantier)} small />
            )}
            {dernierChantier && dernierChantier !== premierChantier && (
              <StatCard emoji="🔄" label="Dernier chantier" value={fmt(dernierChantier)} small />
            )}
            {client.created_at && (
              <StatCard emoji="👤" label="Client depuis" value={fmt(client.created_at)} small />
            )}
          </div>
        </div>

        {/* Chantiers liés */}
        {chantiers.length > 0 && (
          <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
            <h2 className="font-display text-lg font-bold text-dusk mb-4">Chantiers réalisés</h2>
            <ul className="divide-y divide-dusk/8">
              {chantiers.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <Link
                      href={`/espace/chantiers/${c.id}`}
                      className="text-sm font-medium text-dusk hover:text-braise transition-colors"
                    >
                      {c.titre}
                    </Link>
                    <p className="text-xs text-dusk/40 mt-0.5">{fmt(c.created_at)}</p>
                  </div>
                  {c.montant && (
                    <span className="text-sm font-semibold text-dusk/70 shrink-0">
                      {c.montant.toLocaleString("fr-FR")} €
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Historique financier */}
        <HistoriqueFinancier
          client={client}
          paiements={paiementsClient}
          chantiersIds={chantiers.map((c) => c.id)}
          chantiersMap={Object.fromEntries(chantiers.map((c) => [c.id, c.titre]))}
        />

        {/* Notes */}
        <NotesClient clientId={client.id} notes={notes} />
      </div>
    </div>
  );
}

function FicheClientSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16 animate-pulse">
      <div className="h-4 w-24 bg-dusk/10 rounded mb-6" />
      <div className="h-8 w-64 bg-dusk/10 rounded mb-2" />
      <div className="h-4 w-40 bg-dusk/10 rounded mb-8" />
      <div className="space-y-6">
        <div className="h-24 bg-white rounded-2xl border border-dusk/8" />
        <div className="h-64 bg-white rounded-2xl border border-dusk/8" />
        <div className="h-40 bg-white rounded-2xl border border-dusk/8" />
      </div>
    </div>
  );
}

function StatCard({
  emoji,
  label,
  value,
  small = false,
}: {
  emoji: string;
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="bg-dust rounded-xl p-4">
      <span className="text-xl" aria-hidden="true">{emoji}</span>
      <p className={`font-bold text-dusk mt-2 ${small ? "text-sm" : "text-2xl font-display"}`}>
        {value}
      </p>
      <p className="text-dusk/45 text-xs mt-0.5">{label}</p>
    </div>
  );
}

function HistoriqueFinancier({
  client,
  paiements,
  chantiersIds,
  chantiersMap,
}: {
  client: {
    total_encaisse?: number | null;
    taux_recouvrement?: number | null;
    delai_moyen_paiement?: number | null;
    est_mauvais_payeur?: boolean | null;
  };
  paiements: Array<{
    id: string;
    chantier_id: string;
    type: string;
    montant: number | null;
    statut: string;
    date_prevue: string | null;
    date_encaissement: string | null;
  }>;
  chantiersIds: string[];
  chantiersMap: Record<string, string>;
}) {
  const filtered = paiements.filter((p) => chantiersIds.includes(p.chantier_id));
  if (filtered.length === 0 && !client.total_encaisse) return null;

  const totalEncaisse = filtered
    .filter((p) => p.statut === "encaisse")
    .reduce((s, p) => s + (p.montant ?? 0), 0);
  const nbPayes = filtered.filter((p) => p.statut === "encaisse").length;
  const nbEnAttente = filtered.filter((p) => p.statut !== "encaisse").length;
  const nbRetards = filtered.filter((p) => p.statut === "en_retard").length;

  const TYPE_LABELS: Record<string, string> = {
    acompte: "Acompte",
    intermediaire: "Intermédiaire",
    solde: "Solde",
    autre: "Autre",
  };

  const STATUT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
    encaisse: { bg: "bg-green-50", text: "text-green-700", label: "Encaissé" },
    en_retard: { bg: "bg-red-50", text: "text-red-600", label: "En retard" },
    en_attente: { bg: "bg-dusk/5", text: "text-dusk/60", label: "En attente" },
  };

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
      <h2 className="font-display text-lg font-bold text-dusk mb-5">Historique financier</h2>

      {/* Indicateurs financiers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs text-green-700 mb-1">Total encaissé</p>
          <p className="text-lg font-bold text-green-700">
            {totalEncaisse.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
          </p>
        </div>
        <div className="bg-dust rounded-xl p-3">
          <p className="text-xs text-dusk/60 mb-1">Payés / En attente</p>
          <p className="text-lg font-bold text-dusk">
            {nbPayes} / {nbEnAttente}
          </p>
        </div>
        <div className="bg-dust rounded-xl p-3">
          <p className="text-xs text-dusk/60 mb-1">Délai moyen paiement</p>
          <p className="text-lg font-bold text-dusk">
            {client.delai_moyen_paiement != null
              ? `${Math.round(client.delai_moyen_paiement)} j`
              : "-"}
          </p>
        </div>
        <div className="bg-dust rounded-xl p-3">
          <p className="text-xs text-dusk/60 mb-1">Taux recouvrement</p>
          <p className="text-lg font-bold text-dusk">
            {client.taux_recouvrement != null
              ? `${Math.round(client.taux_recouvrement)}%`
              : "-"}
          </p>
        </div>
      </div>

      {/* Badge payeur */}
      <div className="flex flex-wrap gap-2 mb-5">
        {nbRetards === 0 && nbPayes > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
            ✅ Bon payeur
          </span>
        )}
        {nbRetards >= 2 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
            ⚠️ Mauvais payeur ({nbRetards} retards)
          </span>
        )}
      </div>

      {/* Historique paiements */}
      {filtered.length > 0 && (
        <div className="divide-y divide-dusk/6">
          {filtered.slice(0, 10).map((p) => {
            const style = STATUT_STYLE[p.statut] ?? STATUT_STYLE.en_attente;
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-dusk truncate">
                    {chantiersMap[p.chantier_id] ?? "Chantier"} · {TYPE_LABELS[p.type] ?? p.type}
                  </p>
                  {p.date_encaissement && (
                    <p className="text-xs text-dusk/40 mt-0.5">
                      {new Date(p.date_encaissement).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-dusk">
                    {(p.montant ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
