import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { devError } from "@/lib/log";

// Runtime Node (par défaut) : le SDK Stripe utilisé ici n'a pas besoin
// d'Edge, et createClient()/cookies() ne sont pas garantis sur Edge.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    devError("STRIPE_PRICE_ID n'est pas configurée.");
    return NextResponse.json(
      { error: "Configuration de paiement indisponible. Réessayez plus tard." },
      { status: 500 }
    );
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // customer_email pré-rempli et non modifiable : élimine le risque
      // qu'un client saisisse un email différent de son compte Estime sur
      // la page Stripe, qui empêcherait le webhook de retrouver son profil.
      customer_email: user.email,
      client_reference_id: user.id,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { user_id: user.id },
      },
      success_url: "https://estime-app.com/espace/tableau-de-bord?payment=success",
      cancel_url: "https://estime-app.com/espace/abonnement",
    });

    if (!session.url) {
      throw new Error("Stripe n'a pas retourné d'URL de session.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    devError("Échec de la création de la Checkout Session Stripe", error);
    return NextResponse.json(
      { error: "Impossible de démarrer le paiement. Réessayez." },
      { status: 500 }
    );
  }
}
