import "server-only";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Lecture seule des données Estime pour le backoffice personnel.
 * AUCUNE fonction de ce fichier ne doit jamais écrire dans une table
 * Estime ou modifier un objet Stripe : uniquement .select() côté
 * Supabase et des appels *.list()/*.retrieve() en lecture côté Stripe.
 */

export async function getMRREstime(): Promise<number> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let mrrCentimes = 0;
  for await (const subscription of stripe.subscriptions.list({ status: "active", limit: 100 })) {
    for (const item of subscription.items.data) {
      const price = item.price;
      if (!price.unit_amount || !price.recurring) continue;
      const montantMensuel =
        price.recurring.interval === "year"
          ? price.unit_amount / 12
          : price.recurring.interval === "week"
            ? price.unit_amount * 4.33
            : price.unit_amount;
      mrrCentimes += montantMensuel * (item.quantity ?? 1);
    }
  }

  return mrrCentimes / 100;
}

export async function getChurnEstimeDuMois(): Promise<number> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const now = new Date();
  const debutMois = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) / 1000);

  let count = 0;
  for await (const event of stripe.events.list({
    type: "customer.subscription.deleted",
    created: { gte: debutMois },
    limit: 100,
  })) {
    count++;
  }

  return count;
}

export type NouvelAbonneEstime = {
  id: string;
  nom: string;
  metier: string | null;
  ville: string | null;
  created_at: string;
};

export async function getNouveauxAbonnesEstime(limite = 8): Promise<NouvelAbonneEstime[]> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("profiles")
    .select("id, prenom, nom, company_name, metier, ville, created_at")
    .eq("is_subscribed", true)
    .order("created_at", { ascending: false })
    .limit(limite);

  return (data ?? []).map((p) => ({
    id: p.id,
    nom: [p.prenom, p.nom].filter(Boolean).join(" ") || p.company_name || "Artisan",
    metier: p.metier,
    ville: p.ville,
    created_at: p.created_at,
  }));
}
