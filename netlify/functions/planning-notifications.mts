/**
 * Netlify Scheduled Function : notifications push planning éditorial
 * Se déclenche toutes les heures
 *
 * Variables d'environnement requises :
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   APP_URL (ex: https://estime-app.com)
 */
import type { Config } from "@netlify/functions";
import { withErrorNotification } from "./_utils/notify-error";
import { createSupabaseAdmin } from "./_utils/supabase-admin";

export const config: Config = {
  schedule: "0 * * * *",
};

async function handler() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[planning-notifications] Missing Supabase env vars");
    return;
  }

  const supabase = createSupabaseAdmin(supabaseUrl, supabaseServiceKey);

  // Trouver les posts dont la date_publication est dans la dernière heure
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const { data: posts, error } = await supabase
    .from("posts_programmes")
    .select("id, user_id, texte_post, chantier_id, date_publication")
    .eq("statut", "programme")
    .gte("date_publication", oneHourAgo.toISOString())
    .lte("date_publication", now.toISOString());

  if (error) {
    console.error("[planning-notifications] Fetch error:", error.message);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log("[planning-notifications] No posts to notify");
    return;
  }

  console.log(`[planning-notifications] ${posts.length} post(s) à notifier`);

  for (const post of posts) {
    // Marquer comme publié et notification envoyée
    const { error: updateError } = await supabase
      .from("posts_programmes")
      .update({ statut: "publie", notification_envoyee: true })
      .eq("id", post.id);

    if (updateError) {
      console.error(`[planning-notifications] Update error for ${post.id}:`, updateError.message);
      continue;
    }

    // Récupérer le push subscription de l'utilisateur
    const { data: profile } = await supabase
      .from("profiles")
      .select("push_subscription")
      .eq("id", post.user_id)
      .maybeSingle();

    if (!profile?.push_subscription) continue;

    // Envoyer la notification push via l'API web-push de l'app
    const appUrl = process.env.APP_URL ?? "https://estime.app";
    try {
      const res = await fetch(`${appUrl}/api/push/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.RAPPORT_SECRET_KEY,
          subscription: profile.push_subscription,
          title: "⏰ Heure de publier !",
          body: post.texte_post.slice(0, 100) + (post.texte_post.length > 100 ? "…" : ""),
          url: `/espace/planning`,
        }),
      });
      if (!res.ok) {
        console.error(`[planning-notifications] Push failed for user ${post.user_id}: ${res.status}`);
      }
    } catch (err) {
      console.error(`[planning-notifications] Push error for user ${post.user_id}:`, err);
    }
  }
}

export default withErrorNotification("planning-notifications", handler);
