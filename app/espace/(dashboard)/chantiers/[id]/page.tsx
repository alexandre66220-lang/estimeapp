import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Check,
  WarningCircle,
  ClipboardText,
  ClockCounterClockwise,
} from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { getSignedChantierPhotoUrl } from "@/lib/supabase/storage";
import { updateClientInfo } from "@/app/actions/chantier";
import { addClientFromChantier } from "@/app/actions/clients";
import RelanceAction from "@/components/espace/RelanceAction";
import { MarquerAvisRecu } from "@/components/espace/MarquerAvisRecu";
import { EtoilesNote } from "@/components/espace/EtoilesNote";
import { AvantApresGenerateur } from "@/components/espace/AvantApresGenerateur";
import { StoryGenerateur } from "@/components/espace/StoryGenerateur";
import { NotesChantier } from "@/components/espace/NotesChantier";
import { RentabiliteChantier } from "@/components/espace/RentabiliteChantier";
import { ProgrammerPublicationButton } from "@/components/espace/ProgrammerPublicationButton";
import { SuiviPaiements } from "@/components/espace/SuiviPaiements";
import { getPaiementsChantier } from "@/lib/supabase/paiements";
import { JournalMateriauxChantier } from "@/components/espace/JournalMateriauxChantier";
import { NotesVocalesChantier } from "@/components/espace/NotesVocalesChantier";

export const metadata: Metadata = {
  title: "Chantier - Estime",
};

const RELANCE_LABELS: Record<string, string> = {
  avis: "Demande d'avis",
  recommandation: "Demande de recommandation",
};

const STATUT_LABELS: Record<string, string> = {
  envoyee: "Envoyée",
  en_attente: "En attente",
  echec: "Échec",
};

export default async function FicheChantier({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { id } = await params;
  const { message, error } = await searchParams;

  const { supabase, user } = await getCurrentUser();

  // Guard redondant avec le layout, mais évite les assertions user! partout
  if (!user) redirect("/connexion");

  const [
    { data: chantier, error: chantierError },
    { data: profile },
    { data: posts },
    { data: relances },
    { data: carnetClients },
    { data: avis },
    { data: notes },
    paiements,
    { data: materiauScans },
    { data: notesVocales },
  ] = await Promise.all([
    supabase
      .from("chantiers")
      .select("id, titre, photo_avant_url, photo_apres_url, avant_apres_url, statut, client_nom, client_email, termine_at, created_at, montant, depenses, heures_passees, sous_traitance, frais_deplacement, autres_couts, taux_horaire_objectif, taux_charges_sociales")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("lien_avis_google")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("posts")
      .select("id, contenu, image_url, plateforme, created_at")
      .eq("chantier_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("relances")
      .select("id, type, statut, envoyee_at, created_at")
      .eq("chantier_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("prenom, nom, email")
      .eq("user_id", user.id),
    supabase
      .from("avis")
      .select("id, note_google, date_avis")
      .eq("chantier_id", id)
      .maybeSingle(),
    supabase
      .from("notes_chantier")
      .select("id, contenu, created_at")
      .eq("chantier_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    getPaiementsChantier(supabase, id, user.id),
    supabase
      .from("materiau_scans")
      .select("id, created_at, image_url, analyse_json")
      .eq("chantier_id", id)
      .eq("artisan_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("notes_vocales")
      .select("id, created_at, duree_secondes, audio_url")
      .eq("chantier_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const materiauScansAvecUrl = await Promise.all(
    (materiauScans ?? []).map(async (scan) => {
      const { data: signed } = await supabase.storage
        .from("materiau-scans")
        .createSignedUrl(scan.image_url, 3600);
      return {
        id: scan.id,
        created_at: scan.created_at,
        analyse_json: scan.analyse_json,
        imageUrl: signed?.signedUrl ?? null,
      };
    })
  );

  const notesVocalesAvecUrl = await Promise.all(
    (notesVocales ?? []).map(async (note) => {
      const { data: signed } = await supabase.storage
        .from("notes-vocales")
        .createSignedUrl(note.audio_url, 3600);
      return {
        id: note.id,
        created_at: note.created_at,
        duree_secondes: note.duree_secondes,
        audioUrl: signed?.signedUrl ?? null,
      };
    })
  );

  if (chantierError) {
    console.error("[FicheChantier] erreur requête chantier:", chantierError.message, "id:", id, "user:", user.id);
  }

  if (!chantier) {
    redirect("/espace/mes-chantiers");
  }

  const hasPhoto = Boolean(chantier.photo_avant_url || chantier.photo_apres_url);

  const [photoAvantUrl, photoApresUrl, avantApresSignedUrl] = await Promise.all([
    getSignedChantierPhotoUrl(supabase, chantier.photo_avant_url),
    getSignedChantierPhotoUrl(supabase, chantier.photo_apres_url),
    getSignedChantierPhotoUrl(supabase, chantier.avant_apres_url ?? null),
  ]);

  const isTermine = chantier.statut === "termine";
  const hasLienAvisGoogle = Boolean(profile?.lien_avis_google);
  const hasClientEmail = Boolean(chantier.client_email);
  const estDejaDansLeCarnet = (carnetClients ?? []).some(
    (client) => client.email.toLowerCase() === chantier.client_email?.toLowerCase()
  );
  const proposerAjoutCarnet = hasClientEmail && !estDejaDansLeCarnet;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
      <Link
        href="/espace/mes-chantiers"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-dusk/60 hover:text-dusk transition-colors duration-200 mb-6"
      >
        <ArrowLeft size={16} weight="bold" aria-hidden="true" />
        Retour à mes chantiers
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-dusk">{chantier.titre}</h1>
          <p className="text-dusk/50 text-sm mt-1">
            Créé le{" "}
            {new Date(chantier.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${
            isTermine
              ? "bg-dusk/5 text-dusk/60"
              : "bg-ambre/10 text-braise"
          }`}
        >
          {isTermine ? "Terminé" : "En cours"}
        </span>
      </div>

      {(photoAvantUrl || photoApresUrl) && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {photoAvantUrl && (
            <div>
              <p className="text-xs font-medium text-dusk/45 mb-1.5">Avant</p>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-dust-dark">
                <Image
                  src={photoAvantUrl}
                  alt={`Photo avant du chantier ${chantier.titre}`}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 384px"
                />
              </div>
            </div>
          )}
          {photoApresUrl && (
            <div>
              <p className="text-xs font-medium text-dusk/45 mb-1.5">Après</p>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-dust-dark">
                <Image
                  src={photoApresUrl}
                  alt={`Photo après du chantier ${chantier.titre}`}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 384px"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visuel avant/après — visible seulement si au moins une photo */}
      {hasPhoto && (
        <div className="mb-6">
          <AvantApresGenerateur
            chantierId={chantier.id}
            existingUrl={avantApresSignedUrl}
          />
        </div>
      )}

      {/* Story Instagram — visible seulement si au moins une photo */}
      {hasPhoto && (
        <div className="mb-6">
          <StoryGenerateur
            chantierId={chantier.id}
            photoAvantUrl={photoAvantUrl}
            photoApresUrl={photoApresUrl}
          />
        </div>
      )}

      {posts && posts.length > 0 && (
        <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-2 text-braise mb-4">
            <ClipboardText size={18} weight="bold" aria-hidden="true" />
            <span className="text-sm font-semibold">Post Instagram généré</span>
          </div>
          <p className="text-dusk/70 text-sm leading-relaxed whitespace-pre-wrap mb-4">
            {posts[0].contenu}
          </p>
          <ProgrammerPublicationButton
            chantierId={chantier.id}
            postId={posts[0].id}
            textePost={posts[0].contenu}
            hashtags={[]}
            imageUrl={posts[0].image_url}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-6">
        <h2 className="font-display text-lg font-bold text-dusk mb-1">
          Informations client
        </h2>
        <p className="text-dusk/50 text-sm mb-5">
          Nécessaires pour pouvoir envoyer la relance avis en fin de chantier.
        </p>

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

        <form action={updateClientInfo} className="space-y-5">
          <input type="hidden" name="chantierId" value={chantier.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="clientNom"
                className="block text-sm font-medium text-dusk/70 mb-1.5"
              >
                Nom du client
              </label>
              <input
                type="text"
                id="clientNom"
                name="clientNom"
                defaultValue={chantier.client_nom ?? ""}
                placeholder="Jean Dupont"
                className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
              />
            </div>
            <div>
              <label
                htmlFor="clientEmail"
                className="block text-sm font-medium text-dusk/70 mb-1.5"
              >
                Email du client
              </label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                list="carnet-clients-emails"
                defaultValue={chantier.client_email ?? ""}
                placeholder="jean@exemple.fr"
                className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
              />
              <datalist id="carnet-clients-emails">
                {(carnetClients ?? []).map((client) => (
                  <option key={client.email} value={client.email}>
                    {client.prenom} {client.nom}
                  </option>
                ))}
              </datalist>
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 text-dusk font-medium text-sm px-5 py-2.5 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
          >
            Enregistrer
          </button>
        </form>

        {proposerAjoutCarnet && (
          <form
            action={addClientFromChantier}
            className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-dust px-4 py-3.5"
          >
            <input type="hidden" name="chantierId" value={chantier.id} />
            <input type="hidden" name="nomComplet" value={chantier.client_nom ?? ""} />
            <input type="hidden" name="email" value={chantier.client_email ?? ""} />
            <p className="text-xs text-dusk/60">
              Ce client n&apos;est pas encore dans votre carnet d&apos;adresses.
            </p>
            <button
              type="submit"
              className="shrink-0 text-xs font-semibold text-ambre hover:underline"
            >
              Ajouter au carnet
            </button>
          </form>
        )}
      </div>

      <RentabiliteChantier
        chantierId={id}
        initial={{
          montant: chantier.montant ?? null,
          depenses: chantier.depenses ?? null,
          heures_passees: chantier.heures_passees ?? null,
          sous_traitance: chantier.sous_traitance ?? null,
          frais_deplacement: chantier.frais_deplacement ?? null,
          autres_couts: chantier.autres_couts ?? null,
          taux_horaire_objectif: chantier.taux_horaire_objectif ?? null,
        }}
      />

      <SuiviPaiements
        chantierId={id}
        montantHT={chantier.montant ?? null}
        tauxCharges={chantier.taux_charges_sociales ?? 22.5}
        totalCouts={
          (chantier.depenses ?? 0) +
          (chantier.sous_traitance ?? 0) +
          (chantier.frais_deplacement ?? 0) +
          (chantier.autres_couts ?? 0)
        }
        paiements={paiements.map((p) => ({
          id: p.id,
          type: p.type as "acompte" | "intermediaire" | "solde" | "autre",
          montant: p.montant,
          statut: p.statut as "en_attente" | "encaisse" | "en_retard",
          date_prevue: p.date_prevue,
          date_encaissement: p.date_encaissement,
        }))}
      />

      <NotesChantier
        chantierId={id}
        initialNotes={
          (notes ?? []).map((n) => ({
            id: n.id,
            contenu: n.contenu,
            created_at: n.created_at,
          }))
        }
      />

      <div className="mb-6">
        <JournalMateriauxChantier chantierId={id} scans={materiauScansAvecUrl as any} />
      </div>

      <div className="mb-6">
        <NotesVocalesChantier chantierId={id} notes={notesVocalesAvecUrl} />
      </div>

      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-6">
        <h2 className="font-display text-lg font-bold text-dusk mb-4">
          Statut du chantier
        </h2>

        {!isTermine && !hasClientEmail && (
          <p className="flex items-start gap-2.5 rounded-xl bg-dust text-dusk/60 text-sm px-4 py-3">
            <WarningCircle size={18} weight="bold" className="shrink-0 mt-0.5 text-dusk/40" aria-hidden="true" />
            Renseignez l&apos;email du client ci-dessus pour pouvoir marquer ce
            chantier comme terminé et lui envoyer une relance.
          </p>
        )}

        {!isTermine && hasClientEmail && !hasLienAvisGoogle && (
          <p className="flex items-start gap-2.5 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
            <WarningCircle size={18} weight="bold" className="shrink-0 mt-0.5" aria-hidden="true" />
            Renseignez votre lien vers votre fiche Google dans les{" "}
            <Link href="/espace/parametres" className="font-semibold underline shrink-0">
              paramètres
            </Link>{" "}
            avant de pouvoir envoyer une relance.
          </p>
        )}

        {(isTermine || (hasClientEmail && hasLienAvisGoogle)) && (
          <RelanceAction
            chantierId={chantier.id}
            isTermine={isTermine}
            termineAt={chantier.termine_at}
          />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-6">
        <h2 className="font-display text-lg font-bold text-dusk mb-1">Avis Google</h2>
        <p className="text-dusk/50 text-sm mb-5">
          Renseignez manuellement l&apos;avis Google laissé par ce client.
        </p>

        {avis ? (
          <div className="flex items-center gap-3">
            <EtoilesNote note={avis.note_google} />
            <p className="text-dusk/50 text-sm">
              Reçu le{" "}
              {new Date(avis.date_avis).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        ) : (
          <MarquerAvisRecu
            chantierId={chantier.id}
            clientPrenom={chantier.client_nom}
            clientEmail={chantier.client_email}
          />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
        <div className="flex items-center gap-2 text-dusk/70 mb-4">
          <ClockCounterClockwise size={18} aria-hidden="true" />
          <h2 className="font-display text-lg font-bold text-dusk">
            Historique des relances
          </h2>
        </div>

        {!relances || relances.length === 0 ? (
          <p className="text-dusk/45 text-sm">
            Aucune relance envoyée pour l&apos;instant.
          </p>
        ) : (
          <ul className="divide-y divide-dusk/8">
            {relances.map((relance) => (
              <li key={relance.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-dusk">
                    {RELANCE_LABELS[relance.type] ?? relance.type}
                  </p>
                  <p className="text-dusk/45 text-xs mt-0.5">
                    {new Date(relance.envoyee_at ?? relance.created_at).toLocaleDateString(
                      "fr-FR",
                      { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }
                    )}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${
                    relance.statut === "envoyee"
                      ? "bg-ambre/10 text-braise"
                      : relance.statut === "echec"
                        ? "bg-red-50 text-red-700"
                        : "bg-dusk/5 text-dusk/60"
                  }`}
                >
                  {STATUT_LABELS[relance.statut] ?? relance.statut}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
