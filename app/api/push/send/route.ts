import webpush from "web-push";

export const runtime = "nodejs";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_EMAIL = process.env.VAPID_EMAIL ?? "contact@estime.app";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function POST(request: Request) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return Response.json({ error: "VAPID keys not configured" }, { status: 503 });
  }

  let body: { subscription: webpush.PushSubscription; title: string; body: string; url?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
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
