import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ensureCodeParrainage, registerFilleulParrainage } from "@/lib/supabase/parrainage";
import { sendWelcomeEmail } from "@/lib/resend/send-welcome";
import { devError } from "@/lib/log";

export function profileCacheTag(userId: string) {
  return `profile-${userId}`;
}

export function getCachedProfile<T = { id: string }>(
  supabase: SupabaseClient,
  userId: string,
  columns: string
): Promise<T | null> {
  return unstable_cache(
    async () => {
      const { data } = await supabase
        .from("profiles")
        .select(columns)
        .eq("id", userId)
        .maybeSingle();
      return data as T | null;
    },
    ["profile", userId, columns],
    { revalidate: 300, tags: [profileCacheTag(userId)] }
  )();
}

export async function getBillingStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<{ trial_end: string | null; is_subscribed: boolean; subscription_id: string | null } | null> {
  const { data } = await supabase
    .from("profiles")
    .select("trial_end, is_subscribed, subscription_id")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export async function ensureProfile(supabase: SupabaseClient, user: User) {
  const existing = await getCachedProfile<{ id: string; code_parrainage: string | null }>(
    supabase,
    user.id,
    "id, code_parrainage"
  );

  const companyName = (user.user_metadata?.company_name as string | undefined) ?? null;

  if (!existing) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      company_name: companyName,
    });
  }

  if (!existing?.code_parrainage) {
    await ensureCodeParrainage(supabase, user.id, companyName ?? user.email ?? user.id);
  }
}

/**
 * À exécuter une seule fois par utilisateur, à la première visite de
 * /espace : enregistre le parrainage en attente (s'il y en a un, capturé
 * lors de l'inscription même sans session active) et envoie l'email de
 * bienvenue. L'update conditionnée sur first_login_processed = false sert
 * de verrou atomique pour éviter une double exécution en cas de requêtes
 * concurrentes.
 */
export async function processFirstLogin(supabase: SupabaseClient, user: User) {
  const { data: claimed, error } = await supabase
    .from("profiles")
    .update({ first_login_processed: true, referral_code_pending: null })
    .eq("id", user.id)
    .eq("first_login_processed", false)
    .select("referral_code_pending, email")
    .maybeSingle();

  if (error || !claimed) return;

  const email = claimed.email ?? user.email ?? null;

  if (claimed.referral_code_pending) {
    await registerFilleulParrainage(
      supabase,
      claimed.referral_code_pending,
      user.id,
      email ?? ""
    );
  }

  if (email) {
    sendWelcomeEmail({ email, prenom: null }).catch((err) =>
      devError("Échec de l'envoi de l'email de bienvenue", err)
    );
  }
}
