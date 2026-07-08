import { type NextRequest, NextResponse } from "next/server";
import sharp, { type OverlayOptions } from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const W = 1080;
const H = 1920;
const TIMEOUT_MS = 10_000;
const TERRACOTTA = { r: 199, g: 93, b: 59 }; // #C75D3B

// ── Helpers ──────────────────────────────────────────────────────────────────

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Téléchargement échoué (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Dégradé sombre sur 40% bas → lisibilité du texte.
 * Sharp ne gère pas les gradients natifs : on passe par un SVG RGBA.
 */
function makeGradientSvg(): Buffer {
  const gradH = Math.round(H * 0.45);
  const gradY = H - gradH;
  return Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">` +
      `<defs>` +
      `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0%" stop-color="black" stop-opacity="0"/>` +
      `<stop offset="100%" stop-color="black" stop-opacity="0.82"/>` +
      `</linearGradient>` +
      `</defs>` +
      `<rect x="0" y="${gradY}" width="${W}" height="${gradH}" fill="url(#g)"/>` +
      `</svg>`
  );
}

/**
 * Fond semi-transparent derrière le logo en haut à gauche.
 */
function makeLogoBgSvg(w: number, h: number): Buffer {
  return Buffer.from(
    `<svg width="${w + 24}" height="${h + 24}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect rx="16" fill="rgba(0,0,0,0.45)" width="${w + 24}" height="${h + 24}"/>` +
      `</svg>`
  );
}

/**
 * Cercle terracotta avec initiales (fallback si pas de logo).
 */
function makeInitialesSvg(initiales: string): Buffer {
  const size = 120;
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
      `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#C75D3B"/>` +
      `<text fill="white" font-size="44" font-weight="bold" font-family="Arial,Helvetica,sans-serif" ` +
      `x="${size / 2}" y="${size / 2 + 16}" text-anchor="middle">${escapeXml(initiales)}</text>` +
      `</svg>`
  );
}

/**
 * Bloc texte métier + ville centré en bas.
 */
function makeTextBlockSvg(metier: string, ville: string): Buffer {
  const blockW = W - 80;
  const blockH = 200;
  const metierFontSize = metier.length > 20 ? 52 : 62;
  const villeFontSize = 38;
  return Buffer.from(
    `<svg width="${blockW}" height="${blockH}" xmlns="http://www.w3.org/2000/svg">` +
      `<text fill="white" font-size="${metierFontSize}" font-weight="bold" ` +
      `font-family="Arial,Helvetica,sans-serif" ` +
      `x="${blockW / 2}" y="70" text-anchor="middle">${escapeXml(metier)}</text>` +
      (ville
        ? `<text fill="rgba(255,255,255,0.75)" font-size="${villeFontSize}" ` +
          `font-family="Arial,Helvetica,sans-serif" ` +
          `x="${blockW / 2}" y="130" text-anchor="middle">${escapeXml(ville)}</text>`
        : "") +
      `</svg>`
  );
}

/**
 * CTA terracotta "Demandez votre devis".
 */
function makeCtaSvg(): Buffer {
  const ctaW = 600;
  const ctaH = 90;
  return Buffer.from(
    `<svg width="${ctaW}" height="${ctaH}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect rx="45" fill="#C75D3B" width="${ctaW}" height="${ctaH}"/>` +
      `<text fill="white" font-size="36" font-weight="bold" ` +
      `font-family="Arial,Helvetica,sans-serif" ` +
      `x="${ctaW / 2}" y="60" text-anchor="middle">Demandez votre devis</text>` +
      `</svg>`
  );
}

// ── Composite ─────────────────────────────────────────────────────────────────

async function buildStory({
  photoUrl,
  logoPath,
  metier,
  ville,
  fallbackInitiales,
  admin,
}: {
  photoUrl: string;
  logoPath: string | null;
  metier: string | null;
  ville: string | null;
  fallbackInitiales: string;
  admin: ReturnType<typeof createAdminClient>;
}): Promise<Buffer> {
  const overlays: OverlayOptions[] = [];

  // 1. Photo de fond — cover 9:16
  const photoBuf = await downloadBuffer(photoUrl);
  const base = await sharp(photoBuf)
    .resize(W, H, { fit: "cover", position: "centre" })
    .toBuffer();

  // 2. Dégradé bas
  overlays.push({
    input: makeGradientSvg(),
    top: 0,
    left: 0,
  });

  // 3. Logo (ou initiales) en haut à gauche
  const LOGO_MAX = 120;
  const LOGO_MARGIN = 40;

  if (logoPath) {
    const { data: logoBlob, error: logoErr } = await admin.storage
      .from("chantiers")
      .download(logoPath);

    if (!logoErr && logoBlob) {
      try {
        const logoBuf = Buffer.from(await logoBlob.arrayBuffer());
        const resized = await sharp(logoBuf)
          .resize(LOGO_MAX, LOGO_MAX, { fit: "inside", withoutEnlargement: true })
          .ensureAlpha()
          .toBuffer();
        const meta = await sharp(resized).metadata();
        const lw = meta.width ?? LOGO_MAX;
        const lh = meta.height ?? LOGO_MAX;

        overlays.push({
          input: makeLogoBgSvg(lw, lh),
          top: LOGO_MARGIN - 12,
          left: LOGO_MARGIN - 12,
        });
        overlays.push({
          input: resized,
          top: LOGO_MARGIN,
          left: LOGO_MARGIN,
        });
      } catch (logoSharpErr) {
        console.error("[story] Logo processing failed, falling back to initials:", logoSharpErr);
        overlays.push({
          input: makeInitialesSvg(fallbackInitiales),
          top: LOGO_MARGIN,
          left: LOGO_MARGIN,
        });
      }
    } else {
      overlays.push({
        input: makeInitialesSvg(fallbackInitiales),
        top: LOGO_MARGIN,
        left: LOGO_MARGIN,
      });
    }
  } else {
    overlays.push({
      input: makeInitialesSvg(fallbackInitiales),
      top: LOGO_MARGIN,
      left: LOGO_MARGIN,
    });
  }

  // 4. Bloc texte métier + ville (centré, 240 px au-dessus du CTA)
  const textBlockW = W - 80;
  const textBlockH = 200;
  const textBlockTop = H - 380;

  if (metier) {
    const textSvg = makeTextBlockSvg(metier, ville ?? "");
    overlays.push({
      input: textSvg,
      top: textBlockTop,
      left: 40,
    });
  }

  // 5. CTA
  const ctaW = 600;
  const ctaH = 90;
  overlays.push({
    input: makeCtaSvg(),
    top: H - 120,
    left: Math.round((W - ctaW) / 2),
  });

  // Supprimer les variables non utilisées pour éviter les warnings
  void textBlockW;
  void textBlockH;

  return sharp(base)
    .composite(overlays)
    .jpeg({ quality: 90 })
    .toBuffer();
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let chantierId: string;
  let photoChoice: "avant" | "apres";

  try {
    const body = await request.json();
    chantierId = body.chantierId as string;
    photoChoice = body.photoChoice === "avant" ? "avant" : "apres";
    if (!chantierId) throw new Error();
  } catch {
    return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Chantier + profil en parallèle
  const [{ data: chantier }, { data: profile }] = await Promise.all([
    supabase
      .from("chantiers")
      .select("id, photo_avant_url, photo_apres_url")
      .eq("id", chantierId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("logo_url, prenom, nom, metier, ville")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (!chantier) {
    return NextResponse.json({ error: "Chantier introuvable." }, { status: 404 });
  }

  // Choisir la photo selon le choix de l'artisan
  const photoPath =
    photoChoice === "avant"
      ? chantier.photo_avant_url
      : (chantier.photo_apres_url ?? chantier.photo_avant_url);

  if (!photoPath) {
    return NextResponse.json({ error: "Aucune photo disponible." }, { status: 400 });
  }

  // URL signée courte (120 s pour le téléchargement interne)
  const { data: signedData } = await admin.storage
    .from("chantiers")
    .createSignedUrl(photoPath, 120);

  if (!signedData?.signedUrl) {
    return NextResponse.json({ error: "Impossible d'accéder à la photo." }, { status: 500 });
  }

  const initiales = [profile?.prenom, profile?.nom]
    .filter(Boolean)
    .map((s) => s![0].toUpperCase())
    .join("") || "??";

  try {
    const imageBuffer = await Promise.race([
      buildStory({
        photoUrl: signedData.signedUrl,
        logoPath: profile?.logo_url ?? null,
        metier: profile?.metier ?? null,
        ville: profile?.ville ?? null,
        fallbackInitiales: initiales,
        admin,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Délai dépassé (10 s)")), TIMEOUT_MS)
      ),
    ]);

    const outputPath = `stories/${user.id}/${chantierId}.jpg`;

    await admin.storage.from("chantiers").upload(outputPath, imageBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

    const { data: result } = await admin.storage
      .from("chantiers")
      .createSignedUrl(outputPath, 3600);

    return NextResponse.json({ url: result?.signedUrl ?? null });
  } catch (err) {
    console.error("[story]", err);
    const msg = err instanceof Error ? err.message : "Erreur de génération.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
