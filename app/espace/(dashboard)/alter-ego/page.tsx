import type { Metadata } from "next";
import { Brain } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { RecalculerAlterEgoButton } from "@/components/espace/RecalculerAlterEgoButton";

export const metadata: Metadata = { title: "Alter ego stratégique — Estime" };

const NIVEAU_COULEUR = (score: number) => {
  if (score >= 70) return "text-red-600 bg-red-50";
  if (score >= 40) return "text-orange-600 bg-orange-50";
  return "text-dusk/50 bg-dust";
};

export default async function AlterEgoPage() {
  const { supabase, user } = await getCurrentUser();

  const [{ data: profile }, { data: premierChantier }, { data: patterns }] = await Promise.all([
    supabase
      .from("profiles")
      .select("alter_ego_portrait, alter_ego_derniere_analyse")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("chantiers")
      .select("created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("alter_ego_insights")
      .select("id, type_pattern, description, frequence, score_confiance, derniere_detection")
      .eq("artisan_id", user!.id)
      .order("frequence", { ascending: false }),
  ]);

  const moisEcoules = premierChantier?.created_at
    ? (Date.now() - new Date(premierChantier.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
    : 0;

  const donneesInsuffisantes = moisEcoules < 3;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Brain size={24} className="text-braise" />
            <h1 className="font-display text-3xl font-bold text-dusk">Alter ego stratégique</h1>
          </div>
          <p className="text-dusk/50 text-sm">
            Le profil comportemental construit à partir de tes décisions passées.
          </p>
        </div>
        {!donneesInsuffisantes && <RecalculerAlterEgoButton />}
      </div>

      {donneesInsuffisantes ? (
        <div className="bg-white rounded-2xl border border-dusk/8 py-20 px-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-ambre/10 rounded-full flex items-center justify-center mb-5">
            <Brain size={30} className="text-ambre" />
          </div>
          <h2 className="font-display text-xl font-bold text-dusk mb-2">Ton alter ego se construit</h2>
          <p className="text-dusk/50 text-sm max-w-[44ch]">
            Il a besoin d&apos;un peu plus de données pour te connaître. Reviens dans quelques semaines.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Portrait */}
          <section className="bg-dusk rounded-2xl p-6 lg:p-8">
            <h2 className="font-display text-lg font-bold text-dust mb-3">Portrait de toi</h2>
            {profile?.alter_ego_portrait ? (
              <p className="text-dust/80 text-sm leading-relaxed whitespace-pre-wrap">
                {profile.alter_ego_portrait}
              </p>
            ) : (
              <p className="text-dust/50 text-sm">
                Aucune analyse pour le moment. Clique sur « Recalculer maintenant » pour générer ton premier portrait.
              </p>
            )}
            {profile?.alter_ego_derniere_analyse && (
              <p className="text-dust/40 text-xs mt-4">
                Dernière analyse le{" "}
                {new Date(profile.alter_ego_derniere_analyse).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </section>

          {/* Patterns */}
          <section>
            <h2 className="font-display text-lg font-bold text-dusk mb-4">Patterns détectés</h2>
            {!patterns || patterns.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dusk/8 p-8 text-center">
                <p className="text-dusk/40 text-sm">Aucun pattern détecté pour l&apos;instant.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {patterns.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-dusk/8 p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-display text-sm font-bold text-dusk leading-snug">{p.type_pattern}</p>
                      <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${NIVEAU_COULEUR(p.score_confiance)}`}>
                        {p.score_confiance}%
                      </span>
                    </div>
                    <p className="text-dusk/60 text-sm leading-relaxed mb-3">{p.description}</p>
                    <div className="flex items-center justify-between text-xs text-dusk/40">
                      <span>Détecté {p.frequence} fois</span>
                      <span>
                        {new Date(p.derniere_detection).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
