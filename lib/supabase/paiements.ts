import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ImpayeItem } from "@/components/espace/ImpaiesTab";
import type { PrevisionnelSemaine } from "@/components/espace/PrevisionnelTresorerie";

export interface SanteFinanciereData {
  tauxRecouvrement: number | null;
  delaiMoyenPaiement: number | null;
  nbFacturesEnRetard: number;
  montantTotalEnRetard: number;
}

export interface FinancesEtenduesData {
  sante: SanteFinanciereData;
  impayes: ImpayeItem[];
  previsionnel: {
    semaines: PrevisionnelSemaine[];
    encaissements30: number;
    encaissements60: number;
    encaissements90: number;
    depenses30: number;
  };
}

export async function getFinancesEtendues(
  supabase: SupabaseClient,
  userId: string
): Promise<FinancesEtenduesData> {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // All payments for this user
  const { data: paiements } = await supabase
    .from("paiements_chantier")
    .select("id, chantier_id, type, montant, statut, date_prevue, date_encaissement")
    .eq("user_id", userId);

  // Chantiers with costs for previsionnel
  const { data: chantiers } = await supabase
    .from("chantiers")
    .select("id, titre, montant, depenses, sous_traitance, frais_deplacement, autres_couts, client_nom, client_email, date_paiement_prevu")
    .eq("user_id", userId);

  // Relances count per chantier
  const { data: relances } = await supabase
    .from("relances_client")
    .select("chantier_id, type")
    .eq("user_id", userId);

  // Clients for IDs
  const { data: clients } = await supabase
    .from("clients")
    .select("id, prenom, nom, email")
    .eq("user_id", userId);

  const allPaiements = paiements ?? [];
  const allChantiers = chantiers ?? [];
  const allRelances = relances ?? [];
  const allClients = clients ?? [];

  // ── Santé financière ──────────────────────────────────────────────────────────
  const totalFacture = allPaiements.reduce((s, p) => s + (p.montant ?? 0), 0);
  const totalEncaisse = allPaiements
    .filter((p) => p.statut === "encaisse")
    .reduce((s, p) => s + (p.montant ?? 0), 0);
  const tauxRecouvrement = totalFacture > 0 ? (totalEncaisse / totalFacture) * 100 : null;

  // Délai moyen: encaissés avec date_prevue et date_encaissement
  const encaissesAvecDelai = allPaiements.filter(
    (p) => p.statut === "encaisse" && p.date_prevue && p.date_encaissement
  );
  const delaiMoyenPaiement =
    encaissesAvecDelai.length > 0
      ? encaissesAvecDelai.reduce((s, p) => {
          const diff =
            new Date(p.date_encaissement!).getTime() -
            new Date(p.date_prevue!).getTime();
          return s + diff / (1000 * 60 * 60 * 24);
        }, 0) / encaissesAvecDelai.length
      : null;

  const enRetard = allPaiements.filter((p) => p.statut === "en_retard");
  const nbFacturesEnRetard = enRetard.length;
  const montantTotalEnRetard = enRetard.reduce((s, p) => s + (p.montant ?? 0), 0);

  // ── Impayés ──────────────────────────────────────────────────────────────────
  const relancesParChantier = allRelances.reduce<Record<string, number>>((acc, r) => {
    acc[r.chantier_id] = (acc[r.chantier_id] ?? 0) + 1;
    return acc;
  }, {});

  const chantiersMap = Object.fromEntries(allChantiers.map((c) => [c.id, c]));

  const impayes: ImpayeItem[] = enRetard.map((p) => {
    const ch = chantiersMap[p.chantier_id];
    const joursRetard = p.date_prevue
      ? Math.floor(
          (today.getTime() - new Date(p.date_prevue).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
    const clientEmail = ch?.client_email ?? "";
    const clientNom = ch?.client_nom ?? "";
    const matchedClient = allClients.find(
      (c) => c.email?.toLowerCase() === clientEmail.toLowerCase()
    );
    return {
      paiementId: p.id,
      chantierId: p.chantier_id,
      chantiertTitre: ch?.titre ?? "Chantier inconnu",
      clientId: matchedClient?.id ?? null,
      clientNom,
      clientEmail,
      montant: p.montant ?? 0,
      datePrevue: p.date_prevue ?? todayStr,
      joursRetard: Math.max(0, joursRetard),
      nbRelances: relancesParChantier[p.chantier_id] ?? 0,
    };
  });

  // ── Prévisionnel ─────────────────────────────────────────────────────────────
  const pending = allPaiements.filter((p) => p.statut === "en_attente" && p.date_prevue);

  function addDays(d: Date, n: number) {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }

  const semaines: PrevisionnelSemaine[] = [];
  let soldeCumul = 0;
  for (let i = 0; i < 13; i++) {
    const debut = addDays(today, i * 7);
    const fin = addDays(today, (i + 1) * 7);
    const debutStr = debut.toISOString().slice(0, 10);
    const finStr = fin.toISOString().slice(0, 10);

    const enc = pending
      .filter((p) => p.date_prevue! >= debutStr && p.date_prevue! < finStr)
      .reduce((s, p) => s + (p.montant ?? 0), 0);

    const depCh = allChantiers.filter((c) => {
      if (!c.date_paiement_prevu) return false;
      return c.date_paiement_prevu >= debutStr && c.date_paiement_prevu < finStr;
    });
    const dep = depCh.reduce(
      (s, c) =>
        s +
        ((c.depenses ?? 0) +
          (c.sous_traitance ?? 0) +
          (c.frais_deplacement ?? 0) +
          (c.autres_couts ?? 0)),
      0
    );

    soldeCumul += enc - dep;
    semaines.push({
      label: `S${i + 1}`,
      dateDebut: debutStr,
      encaissements: enc,
      depenses: dep,
      solde: soldeCumul,
    });
  }

  function sumInDays(n: number) {
    const limit = addDays(today, n).toISOString().slice(0, 10);
    return pending
      .filter((p) => p.date_prevue! <= limit)
      .reduce((s, p) => s + (p.montant ?? 0), 0);
  }

  function depInDays(n: number) {
    const limit = addDays(today, n).toISOString().slice(0, 10);
    return allChantiers
      .filter((c) => c.date_paiement_prevu && c.date_paiement_prevu <= limit)
      .reduce(
        (s, c) =>
          s +
          ((c.depenses ?? 0) +
            (c.sous_traitance ?? 0) +
            (c.frais_deplacement ?? 0) +
            (c.autres_couts ?? 0)),
        0
      );
  }

  return {
    sante: {
      tauxRecouvrement,
      delaiMoyenPaiement,
      nbFacturesEnRetard,
      montantTotalEnRetard,
    },
    impayes,
    previsionnel: {
      semaines,
      encaissements30: sumInDays(30),
      encaissements60: sumInDays(60),
      encaissements90: sumInDays(90),
      depenses30: depInDays(30),
    },
  };
}

export async function getPaiementsChantier(
  supabase: SupabaseClient,
  chantierId: string,
  userId: string
) {
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("paiements_chantier")
    .select("id, type, montant, statut, date_prevue, date_encaissement")
    .eq("chantier_id", chantierId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  // Auto-pass overdue
  const overdue = (data ?? []).filter(
    (p) => p.statut === "en_attente" && p.date_prevue && p.date_prevue < today
  );
  if (overdue.length > 0) {
    const { supabase: adminSupabase } = { supabase };
    await adminSupabase
      .from("paiements_chantier")
      .update({ statut: "en_retard" })
      .in("id", overdue.map((p) => p.id));
    overdue.forEach((p) => {
      const row = (data ?? []).find((x) => x.id === p.id);
      if (row) row.statut = "en_retard";
    });
  }

  return data ?? [];
}
