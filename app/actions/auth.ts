"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { translateAuthError } from "@/lib/supabase/auth-errors";
import { devError } from "@/lib/log";
import {
  SESSION_STATUS_COOKIE,
  SESSION_STATUS_COOKIE_OPTIONS,
  signSessionStatus,
} from "@/lib/supabase/session-status-cookie";

type LoginProfile = {
  onboarding_complete: boolean | null;
  is_subscribed: boolean | null;
  trial_end: string | null;
} | null;

/**
 * Le premier appel Supabase juste après signInWithPassword échoue parfois
 * silencieusement (connexion réseau pas encore chaude) : on retente 3 fois
 * avant d'abandonner et de poser un cookie avec des valeurs par défaut.
 */
async function fetchProfileWithRetry(
  supabase: SupabaseClient,
  userId: string
): Promise<LoginProfile> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const { data, error } = await supabase
      .from("profiles")
      .select("onboarding_complete, is_subscribed, trial_end")
      .eq("id", userId)
      .maybeSingle();

    if (!error) return data;

    devError(`login: échec de la récupération du profil (tentative ${attempt}/3)`, error);
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return null;
}

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect(
      `/connexion?error=${encodeURIComponent("Tous les champs sont obligatoires.")}`
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      `/connexion?error=${encodeURIComponent(translateAuthError(error.message))}`
    );
  }

  if (data.user) {
    const profile = await fetchProfileWithRetry(supabase, data.user.id);

    const signedValue = await signSessionStatus({
      onboardingComplete: profile?.onboarding_complete ?? false,
      isSubscribed: profile?.is_subscribed ?? false,
      trialEnd: profile?.trial_end ?? null,
    });
    if (signedValue) {
      (await cookies()).set(SESSION_STATUS_COOKIE, signedValue, SESSION_STATUS_COOKIE_OPTIONS);
    }
  }

  redirect("/espace/tableau-de-bord");
}

export async function signup(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const companyName = (formData.get("companyName") as string)?.trim();
  const ref = (formData.get("ref") as string)?.trim();

  if (!email || !password || !companyName) {
    redirect(
      `/inscription?error=${encodeURIComponent("Tous les champs sont obligatoires.")}`
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { company_name: companyName },
    },
  });

  if (error) {
    redirect(
      `/inscription?error=${encodeURIComponent(translateAuthError(error.message))}`
    );
  }

  // Le code de parrainage est mémorisé dès maintenant (avant même la
  // confirmation d'email), pour être traité de façon fiable à la première
  // visite de /espace dans app/espace/layout.tsx — même si la confirmation
  // d'email est activée et qu'aucune session n'est encore ouverte ici.
  if (data.user && ref) {
    const admin = createAdminClient();
    const { error: refError } = await admin
      .from("profiles")
      .upsert(
        { id: data.user.id, email: data.user.email ?? "", referral_code_pending: ref },
        { onConflict: "id", ignoreDuplicates: false }
      );
    if (refError) {
      devError("Échec de l'enregistrement du code de parrainage en attente", refError);
    }
  }

  if (data.user && data.session) {
    redirect("/espace/tableau-de-bord");
  }

  redirect(
    `/connexion?message=${encodeURIComponent(
      "Compte créé. Vérifiez vos emails pour confirmer votre adresse, puis connectez-vous."
    )}`
  );
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(SESSION_STATUS_COOKIE);
  redirect("/connexion");
}
