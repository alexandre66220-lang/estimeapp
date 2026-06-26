import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Reste en Node.js runtime (Serverless) : stripe.webhooks.constructEvent est
// synchrone et dépend du module crypto de Node, indisponible sur Edge.
// LOGS TEMPORAIRES — à retirer une fois le webhook de prod validé.
export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const signature = request.headers.get("stripe-signature");

  console.log("[stripe-webhook] requête reçue, signature présente :", !!signature);

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

  console.log("[stripe-webhook] événement reçu :", event.type, event.id);

  try {
    if (event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const customer = await stripe.customers.retrieve(customerId);
      console.log(
        "[stripe-webhook] customer.subscription.created — customerId:",
        customerId,
        "email:",
        !customer.deleted ? customer.email : "(customer supprimé)"
      );

      if (!customer.deleted && customer.email) {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from("profiles")
          .update({
            is_subscribed: true,
            subscription_id: subscription.id,
          })
          .ilike("email", customer.email)
          .select("id");

        if (error) {
          console.error("[stripe-webhook] échec de la mise à jour Supabase :", error);
        } else {
          console.log(
            "[stripe-webhook] profils mis à jour :",
            data?.length ?? 0,
            data?.map((p) => p.id)
          );
          if (!data || data.length === 0) {
            console.error(
              "[stripe-webhook] aucun profil ne correspond à l'email du customer Stripe :",
              customer.email
            );
          } else {
            revalidatePath("/espace", "layout");
            console.log("[stripe-webhook] cache /espace invalidé après mise à jour de l'abonnement");
          }
        }
      } else {
        console.error(
          "[stripe-webhook] customer sans email exploitable, impossible de matcher un profil"
        );
      }
    }
  } catch (error) {
    console.error("[stripe-webhook] erreur inattendue lors du traitement :", error);
    return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
