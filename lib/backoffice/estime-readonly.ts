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

export async function getTousLesAbonnesEstime(): Promise<NouvelAbonneEstime[]> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("profiles")
    .select("id, prenom, nom, company_name, metier, ville, created_at")
    .eq("is_subscribed", true)
    .order("created_at", { ascending: false });

  return (data ?? []).map((p) => ({
    id: p.id,
    nom: [p.prenom, p.nom].filter(Boolean).join(" ") || p.company_name || "Artisan",
    metier: p.metier,
    ville: p.ville,
    created_at: p.created_at,
  }));
}

export async function getRepartitionMetierVille(): Promise<{
  parMetier: { cle: string; nb: number }[];
  parVille: { cle: string; nb: number }[];
}> {
  const admin = createAdminClient();

  const { data } = await admin.from("profiles").select("metier, ville").eq("is_subscribed", true);

  const metiers = new Map<string, number>();
  const villes = new Map<string, number>();

  for (const p of data ?? []) {
    const m = p.metier || "Non renseigné";
    const v = p.ville || "Non renseignée";
    metiers.set(m, (metiers.get(m) ?? 0) + 1);
    villes.set(v, (villes.get(v) ?? 0) + 1);
  }

  const toSorted = (map: Map<string, number>) =>
    Array.from(map.entries())
      .map(([cle, nb]) => ({ cle, nb }))
      .sort((a, b) => b.nb - a.nb);

  return { parMetier: toSorted(metiers), parVille: toSorted(villes) };
}

export type ChurnEvent = {
  id: string;
  date: string;
  clientEmail: string | null;
  raison: string | null;
};

export async function getChurnDetail(limite = 30): Promise<ChurnEvent[]> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const events: ChurnEvent[] = [];
  for await (const event of stripe.events.list({
    type: "customer.subscription.deleted",
    limit: limite,
  })) {
    const subscription = event.data.object as Stripe.Subscription;
    let clientEmail: string | null = null;
    if (typeof subscription.customer === "string") {
      const customer = await stripe.customers.retrieve(subscription.customer);
      if (!customer.deleted) clientEmail = customer.email;
    }

    events.push({
      id: event.id,
      date: new Date(event.created * 1000).toISOString(),
      clientEmail,
      raison: subscription.cancellation_details?.reason ?? null,
    });

    if (events.length >= limite) break;
  }

  return events;
}

export async function getCaEstimeParPeriode({
  debut,
  fin,
}: {
  debut: string;
  fin: string;
}): Promise<number> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const gte = Math.floor(new Date(debut).getTime() / 1000);
  const lt = Math.floor(new Date(fin).getTime() / 1000);

  let total = 0;
  for await (const invoice of stripe.invoices.list({
    status: "paid",
    created: { gte, lt },
    limit: 100,
  })) {
    total += invoice.amount_paid / 100;
  }

  return total;
}

export async function getMRREvolution(mois = 6): Promise<{ mois: string; montant: number }[]> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const now = new Date();
  const debut = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (mois - 1), 1));

  const buckets = new Map<string, number>();
  for (let i = 0; i < mois; i++) {
    const d = new Date(Date.UTC(debut.getUTCFullYear(), debut.getUTCMonth() + i, 1));
    buckets.set(d.toISOString().slice(0, 7), 0);
  }

  for await (const invoice of stripe.invoices.list({
    status: "paid",
    created: { gte: Math.floor(debut.getTime() / 1000) },
    limit: 100,
  })) {
    if (!invoice.status_transitions.paid_at) continue;
    const key = new Date(invoice.status_transitions.paid_at * 1000).toISOString().slice(0, 7);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + invoice.amount_paid / 100);
    }
  }

  return Array.from(buckets.entries()).map(([mois, montant]) => ({ mois, montant }));
}
