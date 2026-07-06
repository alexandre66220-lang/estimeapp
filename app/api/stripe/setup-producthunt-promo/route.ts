import { NextResponse } from "next/server";
import Stripe from "stripe";

// Route one-shot pour créer le coupon + code promo Product Hunt.
// Protégée par RAPPORT_SECRET_KEY (déjà dans les env vars Netlify).
// À appeler une seule fois : GET /api/stripe/setup-producthunt-promo?secret=<RAPPORT_SECRET_KEY>

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!secret || secret !== process.env.RAPPORT_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    // 1. Créer le coupon
    const coupon = await stripe.coupons.create({
      name: "Product Hunt Launch",
      percent_off: 100,
      duration: "once",
      max_redemptions: 500,
    });

    console.log("[ProductHunt] Coupon créé :", coupon.id);

    // Expiration = maintenant + 30 jours
    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    // 2. Créer le code promo
    const promoCode = await stripe.promotionCodes.create({
      promotion: { type: "coupon", coupon: coupon.id },
      code: "PRODUCTHUNT",
      max_redemptions: 500,
      expires_at: expiresAt,
      restrictions: {
        first_time_transaction: true,
      },
    });

    console.log("[ProductHunt] Code promo créé :", promoCode.id, "| Code :", promoCode.code);

    return NextResponse.json({
      success: true,
      coupon_id: coupon.id,
      promo_code_id: promoCode.id,
      promo_code: promoCode.code,
      expires_at: new Date(expiresAt * 1000).toISOString(),
      message: "Coupon et code promo créés avec succès. Cette route peut maintenant être supprimée.",
    });
  } catch (error) {
    const err = error as Stripe.errors.StripeError;
    console.error("[ProductHunt] Erreur Stripe :", err.message);
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: 500 }
    );
  }
}
