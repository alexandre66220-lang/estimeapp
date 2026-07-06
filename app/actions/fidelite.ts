"use server";

import { createClient } from "@/lib/supabase/server";
import {
  ACTIONS_POINTS,
  NIVEAUX_FIDELITE,
  NIVEAUX_ORDER,
  STRIPE_CREDITS,
  niveauPourPoints,
  type ActionFidelite,
  type NiveauFidelite,
} from "@/lib/fidelite/constants";
import { sendNiveauEmail } from "@/lib/resend/send-niveau";
import { devError } from "@/lib/log";

// Actions qui ne peuvent être attribuées qu'une seule fois par utilisateur
const UNIQUE_ACTIONS: ActionFidelite[] = ["profil_complet", "parrainage"];

export type AddPointsResult = {
  pointsAdded: number;
  action: ActionFidelite;
  leveledUp: boolean;
  newNiveau: NiveauFidelite;
};

export async function addPointsFidelite(
  action: ActionFidelite,
  meta: Record<string, unknown> = {}
): Promise<AddPointsResult | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Vérifier si l'action unique a déjà été accordée
    if (UNIQUE_ACTIONS.includes(action)) {
      const { count } = await supabase
        .from("points_fidelite")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action", action);
      if ((count ?? 0) > 0) return null;
    }

    // Lire le niveau avant l'ajout
    const { data: profileBefore } = await supabase
      .from("profiles")
      .select("niveau, points_total, email, prenom")
      .eq("id", user.id)
      .maybeSingle();

    const niveauAvant = (profileBefore?.niveau ?? "apprenti") as NiveauFidelite;
    const points = ACTIONS_POINTS[action].points;

    // Insérer les points (le trigger met à jour profiles.points_total + niveau)
    const { error } = await supabase.from("points_fidelite").insert({
      user_id: user.id,
      action,
      points,
      meta,
    });

    if (error) {
      devError("addPointsFidelite: insert error", error);
      return null;
    }

    // Lire le nouveau niveau
    const { data: profileAfter } = await supabase
      .from("profiles")
      .select("niveau, points_total")
      .eq("id", user.id)
      .maybeSingle();

    const niveauApres = (profileAfter?.niveau ?? "apprenti") as NiveauFidelite;
    const leveledUp =
      NIVEAUX_ORDER.indexOf(niveauApres) > NIVEAUX_ORDER.indexOf(niveauAvant);

    if (leveledUp && profileBefore?.email) {
      // Email de félicitations
      await sendNiveauEmail({
        email: profileBefore.email,
        prenom: profileBefore.prenom ?? "Artisan",
        niveau: niveauApres,
      }).catch((e) => devError("sendNiveauEmail error", e));

      // Crédit Stripe si applicable
      const creditCents = STRIPE_CREDITS[niveauApres];
      if (creditCents) {
        await applyStripeCredit(user.id, niveauApres, creditCents).catch((e) =>
          devError("stripeCredit error", e)
        );
      }

      // Enregistrer la récompense obtenue dans profiles.recompenses
      const { data: profileRecomp } = await supabase
        .from("profiles")
        .select("recompenses")
        .eq("id", user.id)
        .maybeSingle();
      const currentRecomp = Array.isArray(profileRecomp?.recompenses)
        ? profileRecomp.recompenses
        : [];
      await supabase
        .from("profiles")
        .update({
          recompenses: [
            ...currentRecomp,
            { niveau: niveauApres, obtenu_le: new Date().toISOString() },
          ],
        })
        .eq("id", user.id);
    }

    return { pointsAdded: points, action, leveledUp, newNiveau: niveauApres };
  } catch (e) {
    devError("addPointsFidelite error", e);
    return null;
  }
}

async function applyStripeCredit(
  userId: string,
  niveau: NiveauFidelite,
  amountCents: number
) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return;

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.stripe_customer_id) return;

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey, { apiVersion: "2026-05-27.dahlia" });

  await stripe.customers.createBalanceTransaction(profile.stripe_customer_id, {
    amount: -amountCents,
    currency: "eur",
    description: `Récompense fidélité Estime — niveau ${NIVEAUX_FIDELITE[niveau].label}`,
  });
}

// Mise à jour du streak de connexion quotidienne
export async function updateStreak(): Promise<{
  streakJours: number;
  bonusPoints: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { streakJours: 0, bonusPoints: false };

    const { data: profile } = await supabase
      .from("profiles")
      .select("derniere_connexion, streak_jours")
      .eq("id", user.id)
      .maybeSingle();

    const today = new Date().toISOString().slice(0, 10);
    const lastConn = profile?.derniere_connexion ?? null;

    if (lastConn === today) {
      return { streakJours: profile?.streak_jours ?? 1, bonusPoints: false };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const currentStreak = lastConn === yesterday ? (profile?.streak_jours ?? 0) + 1 : 1;

    await supabase
      .from("profiles")
      .update({ derniere_connexion: today, streak_jours: currentStreak })
      .eq("id", user.id);

    // Bonus streak à 7 jours
    let bonusPoints = false;
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      await supabase.from("points_fidelite").insert({
        user_id: user.id,
        action: "streak_7_jours",
        points: ACTIONS_POINTS.streak_7_jours.points,
        meta: { streak: currentStreak },
      });
      bonusPoints = true;
    }

    return { streakJours: currentStreak, bonusPoints };
  } catch (e) {
    devError("updateStreak error", e);
    return { streakJours: 0, bonusPoints: false };
  }
}

// Vérifie et accorde les points de profil complet
export async function checkAndAwardProfilComplet(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const [{ data: profile }, { data: chantierPhoto }] = await Promise.all([
      supabase.from("profiles")
        .select("metier, ville, lien_avis_google")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.from("chantiers")
        .select("id")
        .eq("user_id", user.id)
        .or("photo_avant_url.not.is.null,photo_apres_url.not.is.null")
        .limit(1),
    ]);

    const isComplete = Boolean(
      profile?.metier && profile?.ville && profile?.lien_avis_google && (chantierPhoto?.length ?? 0) > 0
    );

    if (!isComplete) return false;
    const result = await addPointsFidelite("profil_complet");
    return result !== null;
  } catch {
    return false;
  }
}
