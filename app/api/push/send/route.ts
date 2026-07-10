import webpush from "web-push";

export const runtime = "nodejs";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_EMAIL = process.env.VAPID_EMAIL ?? "contact@estime.app";
const PUSH_SECRET = process.env.RAPPORT_SECRET_KEY;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE);
}

// Route appelée uniquement par la Scheduled Function planning-notifications
// (serveur à serveur, aucune session utilisateur disponible dans ce contexte).
// Protégée par un secret partagé pour empêcher un tiers d'utiliser ce
// endpoint comme relais pour envoyer des notifications push arbitraires
// via l'identité VAPID d'Estime.
export async function POST(request: Request) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return Response.json({ error: "VAPID keys not configured" }, { status: 503 });
  }

  let body: { secret?: string; subscription: webpush.PushSubscription; title: string; body: string; url?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!PUSH_SECRET || body.secret !== PUSH_SECRET) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    await webpush.sendNotification(
      body.subscription,
      JSON.stringify({ title: body.title, body: body.body, url: body.url })
    );
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Push failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
