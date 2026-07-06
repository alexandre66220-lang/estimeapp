"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type ArtisanAnnuaire = {
  id: string;
  prenom: string | null;
  nom: string | null;
  metier: string | null;
  ville: string | null;
  slug: string;
  photo_profil: string | null;
  photoUrl: string | null;
  theme_couleur: string | null;
  score_actuel: number | null;
  niveau: string | null;
  statut_disponibilite: string | null;
  certifications: string[];
  nombre_avis: number | null;
  note_moyenne: number | null;
  created_at: string;
};

export type AnnuaireResult = {
  artisans: ArtisanAnnuaire[];
  total: number;
};

const VALID_THEME_COLORS = ["#C75D3B", "#385144", "#2D4A6B", "#7B2D3E", "#C8922A", "#3D3D3D"];
const PAGE_SIZE = 12;

export async function searchAnnuaire(params: {
  metier?: string;
  ville?: string;
  note_min?: number;
  disponible?: boolean;
  tri?: "note" | "avis" | "anciennete";
  page?: number;
}): Promise<AnnuaireResult> {
  const admin = createAdminClient();
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = admin
    .from("profiles")
    .select(
      "id, prenom, nom, metier, ville, slug, photo_profil, theme_couleur, score_actuel, niveau, statut_disponibilite, certifications, created_at",
      { count: "exact" }
    )
    .eq("is_subscribed", true)
    .eq("visible_annuaire", true)
    .not("slug", "is", null);

  if (params.metier) {
    query = query.ilike("metier", `%${params.metier}%`);
  }
  if (params.ville) {
    query = query.ilike("ville", `%${params.ville}%`);
  }
  if (params.disponible) {
    query = query.eq("statut_disponibilite", "disponible");
  }

  if (params.tri === "anciennete") {
    query = query.order("created_at", { ascending: true });
  } else {
    query = query.order("score_actuel", { ascending: false, nullsFirst: false });
  }

  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error || !data) return { artisans: [], total: 0 };

  // Signer les URLs photos
  const artisans: ArtisanAnnuaire[] = await Promise.all(
    data.map(async (p) => {
      let photoUrl: string | null = null;
      if (p.photo_profil) {
        const { data: signed } = await admin.storage
          .from("profiles")
          .createSignedUrl(p.photo_profil, 3600);
        photoUrl = signed?.signedUrl ?? null;
      }
      const theme = VALID_THEME_COLORS.includes(p.theme_couleur ?? "")
        ? p.theme_couleur!
        : "#C75D3B";
      return {
        ...p,
        slug: p.slug!,
        certifications: (p.certifications ?? []) as string[],
        photoUrl,
        theme_couleur: theme,
        nombre_avis: null,
        note_moyenne: null,
      };
    })
  );

  return { artisans, total: count ?? 0 };
}

export async function getMetiersSuggestions(q: string): Promise<string[]> {
  if (!q || q.length < 2) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("metier")
    .eq("is_subscribed", true)
    .eq("visible_annuaire", true)
    .ilike("metier", `%${q}%`)
    .not("metier", "is", null)
    .limit(8);
  const unique = [...new Set((data ?? []).map((p) => p.metier as string).filter(Boolean))];
  return unique.slice(0, 6);
}

export async function getVillesSuggestions(q: string): Promise<string[]> {
  if (!q || q.length < 2) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("ville")
    .eq("is_subscribed", true)
    .eq("visible_annuaire", true)
    .ilike("ville", `%${q}%`)
    .not("ville", "is", null)
    .limit(8);
  const unique = [...new Set((data ?? []).map((p) => p.ville as string).filter(Boolean))];
  return unique.slice(0, 6);
}

export async function saveVisibleAnnuaire(visible: boolean): Promise<{ error?: string }> {
  const { createClient } = await import("@/lib/supabase/server");
  const { updateTag } = await import("next/cache");
  const { profileCacheTag } = await import("@/lib/supabase/profile");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("profiles")
    .update({ visible_annuaire: visible })
    .eq("id", user.id);

  if (error) return { error: "Impossible d'enregistrer." };
  updateTag(profileCacheTag(user.id));
  return {};
}
