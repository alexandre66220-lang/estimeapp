import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendContactVitrine } from "@/lib/resend/send-contact-vitrine";

export const runtime = "nodejs";

// Limite simple : 5 messages par adresse IP par heure (en mémoire, suffit pour prod légère)
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de messages envoyés. Réessayez dans une heure." },
      { status: 429 }
    );
  }

  let body: {
    slug: string;
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    message: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { slug, prenom, nom, email, telephone = "", message } = body;

  if (!slug || !prenom || !nom || !email || !message) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  if (message.length > 2000) {
    return NextResponse.json({ error: "Message trop long (max 2000 caractères)." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("email, prenom, nom, company_name")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile?.email) {
    return NextResponse.json({ error: "Artisan introuvable." }, { status: 404 });
  }

  const artisanNom =
    [profile.prenom, profile.nom].filter(Boolean).join(" ") ||
    profile.company_name ||
    "l'artisan";

  try {
    await sendContactVitrine({
      artisanEmail: profile.email,
      artisanNom,
      prenom,
      nom,
      email,
      telephone,
      message,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact-vitrine]", err);
    return NextResponse.json(
      { error: "Erreur d'envoi. Réessayez." },
      { status: 500 }
    );
  }
}
