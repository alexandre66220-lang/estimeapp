import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type RapportLog = {
  id: string;
  mois: string;
  statut: string;
  erreur: string | null;
  email_envoye: boolean | null;
  created_at: string;
};

/**
 * Seule source de logs déjà en place côté Estime : l'historique du job
 * planifié "rapport mensuel" (rapport_logs). Il n'y a pas d'intégration
 * Sentry ni de table de logs applicatifs généraliste dans le projet — voir
 * le message de fin d'étape pour la proposition de mise en place.
 */
export async function getRapportLogsRecents(limite = 20): Promise<RapportLog[]> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("rapport_logs")
    .select("id, mois, statut, erreur, email_envoye, created_at")
    .order("created_at", { ascending: false })
    .limit(limite);

  return data ?? [];
}
