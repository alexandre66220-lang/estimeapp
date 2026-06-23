import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CritereScore = {
  cle: "chantiers" | "posts" | "emails" | "avis" | "profil";
  label: string;
  points: number;
  pointsMax: number;
  conseil: string;
};

export type NiveauScore = "debutant" | "progression" | "confirme" | "expert";

export type ReputationScore = {
  total: number;
  niveau: NiveauScore;
  criteres: CritereScore[];
};

export const NIVEAUX: Record<
  NiveauScore,
  { label: string; min: number; max: number; message: string }
> = {
  debutant: {
    label: "Débutant",
    min: 0,
    max: 25,
    message: "Créez votre premier chantier pour démarrer votre réputation sur Estime.",
  },
  progression: {
    label: "En progression",
    min: 26,
    max: 50,
    message: "Belle dynamique, continuez à publier vos chantiers et à relancer vos clients.",
  },
  confirme: {
    label: "Confirmé",
    min: 51,
    max: 75,
    message: "Votre activité est régulière, encore quelques avis et votre score s'envole.",
  },
  expert: {
    label: "Expert",
    min: 76,
    max: 100,
    message: "Excellent travail, votre réputation sur Estime est au top niveau.",
  },
};

export function niveauPourScore(score: number): NiveauScore {
  if (score <= 25) return "debutant";
  if (score <= 50) return "progression";
  if (score <= 75) return "confirme";
  return "expert";
}

/**
 * La fonction Postgres `public.get_reputation_badge` (utilisée par le badge
 * public) reproduit cette même formule de score. Toute modification des
 * pondérations ci-dessous doit être répercutée dans cette fonction SQL.
 */
export async function computeReputationScore(
  supabase: SupabaseClient,
  userId: string
): Promise<ReputationScore> {
  const [
    { count: totalChantiers },
    { count: totalPosts },
    { count: totalEmailsAvis },
    { count: totalAvisConfirmes },
    { data: chantiersPhotos },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("chantiers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("relances")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "avis")
      .eq("statut", "envoyee"),
    supabase
      .from("avis")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("chantiers")
      .select("id")
      .eq("user_id", userId)
      .or("photo_avant_url.not.is.null,photo_apres_url.not.is.null")
      .limit(1),
    supabase
      .from("profiles")
      .select("metier, ville, lien_avis_google")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  const pointsChantiers = Math.min((totalChantiers ?? 0) * 5, 25);
  const pointsPosts = Math.min((totalPosts ?? 0) * 3, 15);
  const pointsEmails = Math.min((totalEmailsAvis ?? 0) * 4, 20);
  const pointsAvis = Math.min((totalAvisConfirmes ?? 0) * 8, 40);

  const profilComplet = Boolean(
    profile?.metier && profile?.ville && profile?.lien_avis_google && (chantiersPhotos?.length ?? 0) > 0
  );
  const pointsProfil = profilComplet ? 10 : 0;

  const total = Math.min(
    Math.round(pointsChantiers + pointsPosts + pointsEmails + pointsAvis + pointsProfil),
    100
  );

  const criteres: CritereScore[] = [
    {
      cle: "chantiers",
      label: "Chantiers créés",
      points: pointsChantiers,
      pointsMax: 25,
      conseil: "Créez un nouveau chantier pour gagner jusqu'à 5 points.",
    },
    {
      cle: "posts",
      label: "Posts générés",
      points: pointsPosts,
      pointsMax: 15,
      conseil: "Générez un post Instagram sur un chantier pour gagner jusqu'à 3 points.",
    },
    {
      cle: "emails",
      label: "Demandes d'avis envoyées",
      points: pointsEmails,
      pointsMax: 20,
      conseil: "Envoyez une relance avis à un client pour gagner jusqu'à 4 points.",
    },
    {
      cle: "avis",
      label: "Avis reçus confirmés",
      points: pointsAvis,
      pointsMax: 40,
      conseil: "Marquez un avis Google reçu pour gagner jusqu'à 8 points.",
    },
    {
      cle: "profil",
      label: "Profil complet",
      points: pointsProfil,
      pointsMax: 10,
      conseil: "Complétez votre profil (métier, ville, lien Google, photo de chantier) pour gagner 10 points.",
    },
  ];

  return { total, niveau: niveauPourScore(total), criteres };
}

export async function enregistrerHistoriqueScore(
  supabase: SupabaseClient,
  userId: string,
  score: number
) {
  await supabase.from("reputation_history").upsert(
    {
      user_id: userId,
      score,
      recorded_on: new Date().toISOString().slice(0, 10),
    },
    { onConflict: "user_id,recorded_on" }
  );
}
