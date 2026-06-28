"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileCacheTag } from "@/lib/supabase/profile";
import {
  SESSION_STATUS_COOKIE,
  SESSION_STATUS_COOKIE_OPTIONS,
  signSessionStatus,
} from "@/lib/supabase/session-status-cookie";

async function setSessionStatusCookie(
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_subscribed, trial_end")
    .eq("id", userId)
    .maybeSingle();

  const signedValue = await signSessionStatus({
    onboardingComplete: true,
    isSubscribed: profile?.is_subscribed ?? false,
    trialEnd: profile?.trial_end ?? null,
  });
  if (signedValue) {
    (await cookies()).set(SESSION_STATUS_COOKIE, signedValue, SESSION_STATUS_COOKIE_OPTIONS);
  }
}

export async function completeOnboarding(formData: FormData) {
  const prenom = (formData.get("prenom") as string)?.trim();
  const nom = (formData.get("nom") as string)?.trim();
  const metier = (formData.get("metier") as string)?.trim();
  const ville = (formData.get("ville") as string)?.trim();
  const lienAvisGoogle = (formData.get("lienAvisGoogle") as string)?.trim();
  const tonPost = (formData.get("tonPost") as string)?.trim();

  if (lienAvisGoogle && !/^https?:\/\//i.test(lienAvisGoogle)) {
    redirect(
      `/espace/onboarding?error=${encodeURIComponent(
        "Le lien doit commencer par http:// ou https://."
      )}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      prenom: prenom || null,
      nom: nom || null,
      metier: metier || null,
      ville: ville || null,
      lien_avis_google: lienAvisGoogle || null,
      ton_post: tonPost || null,
      onboarding_complete: true,
    })
    .eq("id", user.id);

  if (error) {
    redirect(
      `/espace/onboarding?error=${encodeURIComponent(
        "Impossible d'enregistrer vos informations. Réessayez."
      )}`
    );
  }

  updateTag(profileCacheTag(user.id));
  await setSessionStatusCookie(user.id, supabase);

  redirect(
    `/espace/tableau-de-bord?message=${encodeURIComponent(
      "Bienvenue sur Estime !"
    )}`
  );
}

export async function skipOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  await supabase
    .from("profiles")
    .update({ onboarding_complete: true })
    .eq("id", user.id);

  updateTag(profileCacheTag(user.id));
  await setSessionStatusCookie(user.id, supabase);

  redirect("/espace/tableau-de-bord");
}
