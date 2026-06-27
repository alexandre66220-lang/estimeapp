import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { devLog, devError } from "@/lib/log";

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
      await handleSubscriptionActive(stripe, event.data.object as Stripe.Subscription);
    } else if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      if (isActiveStatus(subscription.status)) {
        await handleSubscriptionActive(stripe, subscription);
      } else {
        await handleSubscriptionInactive(stripe, subscription);
      }
    } else if (event.type === "customer.subscription.deleted") {
      await handleSubscriptionInactive(stripe, event.data.object as Stripe.Subscription);
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
 * Cherche le profil par stripe_customer_id en priorité ; si absent (premier
 * événement reçu pour ce client), retombe sur l'email et enregistre le
 * stripe_customer_id pour fiabiliser les événements suivants.
 */
async function findProfileId(
  stripe: Stripe,
  customerId: string
): Promise<{ profileId: string; supabase: ReturnType<typeof createAdminClient> } | null> {
  const supabase = createAdminClient();

  const { data: byCustomerId } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (byCustomerId) {
    return { profileId: byCustomerId.id, supabase };
  }

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted || !customer.email) {
    console.error(
      "[stripe-webhook] customer sans email exploitable, impossible de matcher un profil :",
      customerId
    );
    return null;
  }

  const { data: byEmail } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", customer.email)
    .maybeSingle();

  if (!byEmail) {
    console.error(
      "[stripe-webhook] aucun profil ne correspond au customer Stripe :",
      customerId,
      customer.email
    );
    return null;
  }

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", byEmail.id);

  return { profileId: byEmail.id, supabase };
}

async function handleSubscriptionActive(stripe: Stripe, subscription: Stripe.Subscription) {
  const customerId = getCustomerId(subscription);
  const match = await findProfileId(stripe, customerId);
  if (!match) return;

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

async function handleSubscriptionInactive(stripe: Stripe, subscription: Stripe.Subscription) {
  const customerId = getCustomerId(subscription);
  const match = await findProfileId(stripe, customerId);
  if (!match) return;

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
