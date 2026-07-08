import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/server";
import { PlanningCalendar, type PostProgramme, type ChantierPost } from "@/components/espace/PlanningCalendar";
import { PlanningNotifBanner } from "@/components/espace/PlanningNotifBanner";
import type { ReseauSocial } from "@/lib/planning/creneaux";

export const metadata: Metadata = {
  title: "Planning éditorial - Estime",
};

export default async function PlanningPage() {
  const { supabase, user } = await getCurrentUser();

  const [{ data: postsProgrammes }, { data: posts }] = await Promise.all([
    supabase
      .from("posts_programmes")
      .select("id, chantier_id, texte_post, hashtags, image_url, date_publication, statut, reseau_social")
      .eq("user_id", user!.id)
      .neq("statut", "annule")
      .order("date_publication", { ascending: true }),
    supabase
      .from("posts")
      .select("id, contenu, image_url, hashtags, chantier_id, chantiers(titre)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  const chantierTitles = new Map<string, string>();
  for (const p of posts ?? []) {
    const titre = (p.chantiers as { titre?: string } | null)?.titre;
    if (p.chantier_id && titre) chantierTitles.set(p.chantier_id, titre);
  }

  const planningPosts: PostProgramme[] = (postsProgrammes ?? []).map((p) => ({
    id: p.id,
    chantier_id: p.chantier_id,
    texte_post: p.texte_post ?? "",
    hashtags: p.hashtags ?? [],
    image_url: p.image_url,
    date_publication: p.date_publication,
    statut: p.statut as PostProgramme["statut"],
    chantier_titre: p.chantier_id ? chantierTitles.get(p.chantier_id) ?? null : null,
    reseau_social: (p.reseau_social as ReseauSocial) ?? "instagram",
  }));

  const chantierPosts: ChantierPost[] = (posts ?? [])
    .filter((p) => p.chantier_id && p.contenu)
    .map((p) => ({
      chantier_id: p.chantier_id!,
      chantier_titre: (p.chantiers as { titre?: string } | null)?.titre ?? "Chantier",
      post_id: p.id,
      texte_post: p.contenu,
      hashtags: (p.hashtags as string[]) ?? [],
      image_url: p.image_url,
    }));

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-dusk">Planning éditorial</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Programmez vos posts et gérez votre calendrier de publication.
        </p>
      </div>
      <PlanningNotifBanner />
      <PlanningCalendar posts={planningPosts} chantierPosts={chantierPosts} />
    </div>
  );
}
