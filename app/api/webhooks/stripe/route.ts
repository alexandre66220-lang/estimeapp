import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { devLog, devError } from "@/lib/log";
import { sendStripeMatchFailureAlert } from "@/lib/resend/send-stripe-alert";
import { sendNewSubscriberAlert } from "@/lib/resend/send-new-subscriber-alert";
import { notifyError } from "@/lib/resend/notify-error";

// Reste en Node.js runtime (Serverless) : stripe.webhooks.constructEvent est
// synchrone et dépend du module crypto de Node, indisponible sur Edge.
export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const signature = request.headers.get("stripe-signature");

  devLog("[stripe-webhook] requête reçue, signature présente :", !!signature);

  if (!signature) {
    console.error("[stripe-webhook] en-tête stripe-signature manquant");
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error(
      "[stripe-webhook] vérification de signature échouée :",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  devLog("[stripe-webhook] événement reçu :", event.type, event.id);

  try {
    if (event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionActive(stripe, subscription, event);
      if (subscription.status === "active") {
        await notifyNewSubscriber(stripe, subscription);
      }
    } else if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      if (isActiveStatus(subscription.status)) {
        await handleSubscriptionActive(stripe, subscription, event);
      } else {
        await handleSubscriptionInactive(stripe, subscription, event);
      }
    } else if (event.type === "customer.subscription.deleted") {
      await handleSubscriptionInactive(stripe, event.data.object as Stripe.Subscription, event);
    }
  } catch (error) {
    console.error("[stripe-webhook] erreur inattendue lors du traitement :", error);
    return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function isActiveStatus(status: Stripe.Subscription.Status) {
  return status === "active" || status === "trialing";
}

function getCustomerId(subscription: Stripe.Subscription) {
  return typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
}

/**
 * Cherche le profil dans l'ordre de fiabilité décroissant :
 * 1. metadata.user_id de la subscription (= client_reference_id de la
 *    Checkout Session, propagé via subscription_data.metadata à la
 *    création), identifiant fiable, indépendant de l'email saisi sur
 *    Stripe.
 * 2. stripe_customer_id déjà enregistré (événements suivants pour ce
 *    client, une fois le matching initial fait).
 * 3. email, en dernier recours (anciens Payment Links sans metadata).
 * Dans tous les cas où un profil est trouvé via 1 ou 3, on (re)stocke
 * stripe_customer_id pour fiabiliser les événements suivants.
 */
async function findProfileId(
  stripe: Stripe,
  subscription: Stripe.Subscription
): Promise<{ profileId: string; supabase: ReturnType<typeof createAdminClient> } | null> {
  const supabase = createAdminClient();
  const customerId = getCustomerId(subscription);
  const userIdMetadata = subscription.metadata?.user_id || null;

  if (userIdMetadata) {
    const { data: byUserId } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userIdMetadata)
      .maybeSingle();

    if (byUserId) {
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", byUserId.id);
      return { profileId: byUserId.id, supabase };
    }
  }

  const { data: byCustomerId } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (byCustomerId) {
    return { profileId: byCustomerId.id, supabase };
  }

  const customer = await stripe.customers.retrieve(customerId);
  const customerEmail = !customer.deleted ? customer.email ?? null : null;

  if (!customerEmail) {
    console.error(
      "[stripe-webhook] customer sans email exploitable, impossible de matcher un profil :",
      customerId
    );
    return null;
  }

  const { data: byEmail } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", customerEmail)
    .maybeSingle();

  if (!byEmail) {
    console.error(
      "[stripe-webhook] aucun profil ne correspond au customer Stripe :",
      customerId,
      customerEmail
    );
    return null;
  }

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", byEmail.id);

  return { profileId: byEmail.id, supabase };
}

async function alertMatchFailure(stripe: Stripe, subscription: Stripe.Subscription, event: Stripe.Event) {
  const customerId = getCustomerId(subscription);
  let customerEmail: string | null = null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    customerEmail = !customer.deleted ? customer.email ?? null : null;
  } catch {
    // ignore, on alerte quand même avec ce qu'on a
  }

  try {
    await sendStripeMatchFailureAlert({
      eventType: event.type,
      eventId: event.id,
      customerId,
      customerEmail,
      userIdMetadata: subscription.metadata?.user_id || null,
    });
  } catch (alertError) {
    console.error("[stripe-webhook] échec de l'envoi de l'alerte de matching :", alertError);
  }
}

/**
 * Notifie spark@alcalspark.com quand un artisan souscrit un abonnement
 * payant actif (pas les essais gratuits). Ne doit jamais faire échouer le
 * webhook : toute erreur est journalisée via notifyError sans être relancée.
 */
async function notifyNewSubscriber(stripe: Stripe, subscription: Stripe.Subscription) {
  try {
    const match = await findProfileId(stripe, subscription);
    if (!match) return;

    const { data: profile } = await match.supabase
      .from("profiles")
      .select("prenom, nom, email, company_name")
      .eq("id", match.profileId)
      .maybeSingle();

    const nom =
      [profile?.prenom, profile?.nom].filter(Boolean).join(" ") ||
      profile?.company_name ||
      "Artisan inconnu";

    const customerId = getCustomerId(subscription);
    let customerEmail = profile?.email ?? null;
    if (!customerEmail) {
      const customer = await stripe.customers.retrieve(customerId);
      customerEmail = !customer.deleted ? customer.email ?? null : null;
    }

    const item = subscription.items.data[0];
    const price = item?.price;
    let plan = price?.nickname ?? null;
    if (!plan && price?.product) {
      const productId = typeof price.product === "string" ? price.product : price.product.id;
      const product = await stripe.products.retrieve(productId);
      plan = product.name;
    }

    const montant = price?.unit_amount != null
      ? `${(price.unit_amount / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${price.currency.toUpperCase()}/${price.recurring?.interval === "year" ? "an" : "mois"}`
      : "montant inconnu";

    await sendNewSubscriberAlert({
      nom,
      email: customerEmail ?? "email inconnu",
      dateInscription: new Date(subscription.created * 1000),
      plan: plan ?? "plan inconnu",
      montant,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await notifyError("webhook-stripe-nouvel-abonne", message, error instanceof Error ? error.stack : undefined);
  }
}

async function handleSubscriptionActive(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  event: Stripe.Event
) {
  const customerId = getCustomerId(subscription);
  const match = await findProfileId(stripe, subscription);
  if (!match) {
    await alertMatchFailure(stripe, subscription, event);
    return;
  }

  const { error } = await match.supabase
    .from("profiles")
    .update({
      is_subscribed: true,
      subscription_id: subscription.id,
      stripe_customer_id: customerId,
    })
    .eq("id", match.profileId);

  if (error) {
    console.error("[stripe-webhook] échec de la mise à jour Supabase (activation) :", error);
    return;
  }

  devLog("[stripe-webhook] profil activé :", match.profileId);
  revalidatePath("/espace", "layout");
}

async function handleSubscriptionInactive(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  event: Stripe.Event
) {
  const match = await findProfileId(stripe, subscription);
  if (!match) {
    await alertMatchFailure(stripe, subscription, event);
    return;
  }

  const { error } = await match.supabase
    .from("profiles")
    .update({ is_subscribed: false })
    .eq("id", match.profileId);

  if (error) {
    console.error("[stripe-webhook] échec de la mise à jour Supabase (désactivation) :", error);
    return;
  }

  devLog(
    "[stripe-webhook] profil désactivé (statut :",
    subscription.status,
    "):",
    match.profileId
  );
  revalidatePath("/espace", "layout");
}
