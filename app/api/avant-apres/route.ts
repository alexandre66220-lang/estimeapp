import { type NextRequest, NextResponse } from "next/server";
import sharp, { type OverlayOptions } from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Node.js runtime obligatoire : Sharp utilise des bindings natifs
// incompatibles avec le runtime Edge.
export const runtime = "nodejs";

const OUTPUT_SIZE = 1080;
const TIMEOUT_MS = 10_000;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Téléchargement échoué (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

function makeLabelSvg(text: string, align: "left" | "right"): Buffer {
  const W = 130;
  const H = 38;
  const tx = align === "left" ? 10 : W - 10;
  const anchor = align === "left" ? "start" : "end";
  return Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect fill="rgba(0,0,0,0.55)" rx="5" x="0" y="0" width="${W}" height="${H}"/>` +
      `<text fill="white" font-size="17" font-weight="bold" ` +
      `font-family="Arial,Helvetica,sans-serif" ` +
      `x="${tx}" y="26" text-anchor="${anchor}">${text}</text>` +
      `</svg>`
  );
}

function makeNameSvg(name: string): Buffer {
  const safeText = name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const W = 320;
  const H = 38;
  return Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect fill="rgba(0,0,0,0.55)" rx="5" x="0" y="0" width="${W}" height="${H}"/>` +
      `<text fill="white" font-size="15" font-weight="bold" ` +
      `font-family="Arial,Helvetica,sans-serif" ` +
      `x="${W - 12}" y="26" text-anchor="end">${safeText}</text>` +
      `</svg>`
  );
}

// ── Image composite ───────────────────────────────────────────────────────────

async function buildComposite({
  avantUrl,
  apresUrl,
  logoPath,
  fallbackName,
  admin,
}: {
  avantUrl: string | null;
  apresUrl: string | null;
  logoPath: string | null;
  fallbackName: string | null;
  admin: ReturnType<typeof createAdminClient>;
}): Promise<Buffer> {
  const S = OUTPUT_SIZE;
  const hasBoth = Boolean(avantUrl && apresUrl);
  const overlays: OverlayOptions[] = [];

  const base = sharp({
    create: { width: S, height: S, channels: 3, background: { r: 0, g: 0, b: 0 } },
  });

  if (hasBoth) {
    const half = Math.floor(S / 2);

    const [avBuf, apBuf] = await Promise.all([
      downloadBuffer(avantUrl!).then((b) =>
        sharp(b).resize(half, S, { fit: "cover", position: "centre" }).toBuffer()
      ),
      downloadBuffer(apresUrl!).then((b) =>
        sharp(b).resize(half, S, { fit: "cover", position: "centre" }).toBuffer()
      ),
    ]);

    overlays.push({ input: avBuf, top: 0, left: 0 });
    overlays.push({ input: apBuf, top: 0, left: half });

    // Séparateur vertical blanc 2 px
    const sep = await sharp({
      create: { width: 2, height: S, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 255 } },
    })
      .png()
      .toBuffer();
    overlays.push({ input: sep, top: 0, left: half - 1 });

    overlays.push({ input: makeLabelSvg("AVANT", "left"), top: 18, left: 18 });
    overlays.push({ input: makeLabelSvg("APRÈS", "right"), top: 18, left: half + 18 });
  } else {
    const url = (avantUrl ?? apresUrl)!;
    const label = avantUrl ? "AVANT" : "APRÈS";
    const photoBuf = await downloadBuffer(url).then((b) =>
      sharp(b).resize(S, S, { fit: "cover", position: "centre" }).toBuffer()
    );
    overlays.push({ input: photoBuf, top: 0, left: 0 });
    overlays.push({ input: makeLabelSvg(label, "left"), top: 18, left: 18 });
  }

  // Logo ou texte artisan en bas à droite
  if (logoPath) {
    const { data: logoBlob, error: logoErr } = await admin.storage
      .from("chantiers")
      .download(logoPath);
    if (!logoErr && logoBlob) {
      const logoBuf = Buffer.from(await logoBlob.arrayBuffer());
      const resized = await sharp(logoBuf)
        .resize(150, 80, { fit: "inside", withoutEnlargement: true })
        .ensureAlpha()
        .toBuffer();
      const meta = await sharp(resized).metadata();
      const lw = meta.width ?? 150;
      const lh = meta.height ?? 80;
      overlays.push({
        input: resized,
        top: S - lh - 20,
        left: S - lw - 20,
      });
    }
  } else if (fallbackName) {
    const nameSvg = makeNameSvg(fallbackName);
    overlays.push({ input: nameSvg, top: S - 58, left: S - 340 });
  }

  return base.composite(overlays).jpeg({ quality: 90 }).toBuffer();
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
  try {
    const body = await request.json();
    chantierId = body.chantierId as string;
    if (!chantierId) throw new Error();
  } catch {
    return NextResponse.json({ error: "chantierId manquant" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Récupérer le chantier (appartient bien à l'utilisateur)
  const { data: chantier } = await supabase
    .from("chantiers")
    .select("id, photo_avant_url, photo_apres_url")
    .eq("id", chantierId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!chantier) {
    return NextResponse.json({ error: "Chantier introuvable" }, { status: 404 });
  }
  if (!chantier.photo_avant_url && !chantier.photo_apres_url) {
    return NextResponse.json({ error: "Aucune photo disponible" }, { status: 400 });
  }

  // Récupérer le profil (logo + nom de fallback)
  const { data: profile } = await supabase
    .from("profiles")
    .select("logo_url, prenom, nom")
    .eq("id", user.id)
    .maybeSingle();

  // URLs signées temporaires pour télécharger les photos
  const sign = async (path: string | null) => {
    if (!path) return null;
    const { data } = await admin.storage.from("chantiers").createSignedUrl(path, 120);
    return data?.signedUrl ?? null;
  };

  const [avantUrl, apresUrl] = await Promise.all([
    sign(chantier.photo_avant_url),
    sign(chantier.photo_apres_url),
  ]);

  const fallbackName =
    [profile?.prenom, profile?.nom].filter(Boolean).join(" ") ||
    (user.user_metadata?.company_name as string | undefined) ||
    null;

  try {
    const imageBuffer = await Promise.race([
      buildComposite({
        avantUrl,
        apresUrl,
        logoPath: profile?.logo_url ?? null,
        fallbackName,
        admin,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Délai de génération dépassé (10s)")), TIMEOUT_MS)
      ),
    ]);

    const outputPath = `avant-apres/${user.id}/${chantierId}.jpg`;

    await admin.storage.from("chantiers").upload(outputPath, imageBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

    // Stocker le chemin dans la table chantiers
    await admin
      .from("chantiers")
      .update({ avant_apres_url: outputPath })
      .eq("id", chantierId);

    const { data: signedResult } = await admin.storage
      .from("chantiers")
      .createSignedUrl(outputPath, 3600);

    return NextResponse.json({ url: signedResult?.signedUrl ?? null });
  } catch (err) {
    console.error("[avant-apres] erreur :", err);
    const msg = err instanceof Error ? err.message : "Erreur de génération";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
