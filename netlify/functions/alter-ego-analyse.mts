/**
 * Netlify Scheduled Function — analyse comportementale alter ego
 * Se déclenche une fois par semaine, le lundi à 05h00 UTC
 *
 * Variables d'environnement requises :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   RAPPORT_SECRET_KEY
 *   APP_URL (ex: https://estime-app.com)
 *   ANTHROPIC_API_KEY
 */
import type { Config } from "@netlify/functions";
import { withErrorNotification } from "./_utils/notify-error";
import { createSupabaseAdmin } from "./_utils/supabase-admin";

export const config: Config = {
  schedule: "0 5 * * 1",
};

const MOIS_MINIMUM_DONNEES = 3;

async function handler() {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const secret = process.env.RAPPORT_SECRET_KEY!;
  const appUrl = process.env.APP_URL ?? process.env.URL ?? "https://estime-app.com";

  const admin = createSupabaseAdmin(supabaseUrl, supabaseKey);

  const { data: artisans, error } = await admin.from("profiles").select("id");

  if (error || !artisans?.length) {
    console.error("[alter-ego-analyse] Aucun artisan trouvé", error);
    return { statusCode: 200, body: "Aucun artisan" };
  }

  let analysés = 0;
  let ignorés = 0;
  let erreurs = 0;

  for (const artisan of artisans) {
    const { data: premierChantier } = await admin
      .from("chantiers")
      .select("created_at")
      .eq("user_id", artisan.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!premierChantier?.created_at) {
      ignorés++;
      continue;
    }

    const moisEcoules =
      (Date.now() - new Date(premierChantier.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (moisEcoules < MOIS_MINIMUM_DONNEES) {
      ignorés++;
      continue;
    }

    try {
      const response = await fetch(`${appUrl}/api/alter-ego/analyser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: artisan.id, secret }),
      });

      if (!response.ok) {
        erreurs++;
        console.error(`[alter-ego-analyse] Échec artisan ${artisan.id}: HTTP ${response.status}`);
      } else {
        analysés++;
      }
    } catch (err) {
      erreurs++;
      console.error(`[alter-ego-analyse] Exception artisan ${artisan.id}:`, err);
    }
  }

  console.log(
    `[alter-ego-analyse] Terminé : ${analysés} analysés, ${ignorés} ignorés, ${erreurs} erreurs`
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ analysés, ignorés, erreurs }),
  };
}

export default withErrorNotification("alter-ego-analyse", handler);
