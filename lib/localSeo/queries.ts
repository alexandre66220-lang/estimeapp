import { createAdminClient } from "@/lib/supabase/admin";
import type { ArtisanAnnuaire } from "@/app/actions/annuaire";

const SELECT_FIELDS =
  "id, prenom, nom, metier, ville, slug, photo_profil, theme_couleur, score_actuel, niveau, statut_disponibilite, certifications, created_at, nombre_avis, note_moyenne";

function sanitize(a: Record<string, unknown>): ArtisanAnnuaire {
  return {
    id: a.id as string,
    prenom: (a.prenom as string | null) ?? null,
    nom: (a.nom as string | null) ?? null,
    metier: (a.metier as string | null) ?? null,
    ville: (a.ville as string | null) ?? null,
    slug: a.slug as string,
    photo_profil: (a.photo_profil as string | null) ?? null,
    photoUrl: null,
    theme_couleur: (a.theme_couleur as string | null) ?? null,
    score_actuel: (a.score_actuel as number | null) ?? null,
    niveau: (a.niveau as string | null) ?? null,
    statut_disponibilite: (a.statut_disponibilite as string | null) ?? null,
    certifications: (a.certifications as string[] | null) ?? [],
    nombre_avis: (a.nombre_avis as number | null) ?? null,
    note_moyenne: (a.note_moyenne as number | null) ?? null,
    created_at: a.created_at as string,
  };
}

export async function getArtisansByMetierVille(
  metierLabel: string,
  villeLabel: string,
  limit = 12
): Promise<ArtisanAnnuaire[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select(SELECT_FIELDS)
    .eq("is_subscribed", true)
    .eq("visible_annuaire", true)
    .ilike("metier", `%${metierLabel}%`)
    .ilike("ville", `%${villeLabel}%`)
    .order("score_actuel", { ascending: false, nullsFirst: false })
    .limit(limit);
  return (data ?? []).map(sanitize);
}

export async function getArtisansByVille(
  villeLabel: string,
  limit = 12
): Promise<ArtisanAnnuaire[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select(SELECT_FIELDS)
    .eq("is_subscribed", true)
    .eq("visible_annuaire", true)
    .ilike("ville", `%${villeLabel}%`)
    .order("score_actuel", { ascending: false, nullsFirst: false })
    .limit(limit);
  return (data ?? []).map(sanitize);
}

export async function getArtisansByMetier(
  metierLabel: string,
  limit = 12
): Promise<ArtisanAnnuaire[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select(SELECT_FIELDS)
    .eq("is_subscribed", true)
    .eq("visible_annuaire", true)
    .ilike("metier", `%${metierLabel}%`)
    .order("score_actuel", { ascending: false, nullsFirst: false })
    .limit(limit);
  return (data ?? []).map(sanitize);
}
