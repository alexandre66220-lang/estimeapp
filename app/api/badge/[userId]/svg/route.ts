import { createPublicClient } from "@/lib/supabase/public";
import { NIVEAUX, niveauPourScore } from "@/lib/score/reputation";

export const runtime = "edge";

const WIDTH = 320;
const HEIGHT = 120;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBadgeSvg(params: {
  prenom: string | null;
  metier: string | null;
  score: number;
  niveauLabel: string;
}) {
  const nom = escapeXml(params.prenom?.trim() || "Artisan");
  const metier = escapeXml(params.metier?.trim() || "Artisan du bâtiment");
  const niveau = escapeXml(params.niveauLabel);
  const score = Math.max(0, Math.min(100, Math.round(params.score)));
  const barWidth = 220;
  const fillWidth = Math.round((score / 100) * barWidth);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" rx="14" fill="#2B2521" />
  <text x="20" y="28" font-family="Fraunces, Georgia, serif" font-size="17" font-weight="700" fill="#F8F5F2">Estime</text>
  <rect x="${WIDTH - 96}" y="14" width="84" height="20" rx="10" fill="#C75D3B" />
  <text x="${WIDTH - 54}" y="28" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="10" font-weight="600" fill="#F8F5F2" text-anchor="middle">${niveau}</text>
  <text x="20" y="52" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="13" font-weight="600" fill="#F8F5F2">${nom}</text>
  <text x="20" y="68" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="11" fill="#F8F5F2" opacity="0.6">${metier}</text>
  <text x="20" y="94" font-family="Fraunces, Georgia, serif" font-size="22" font-weight="700" fill="#F8F5F2">${score}<tspan font-size="12" fill="#F8F5F2" opacity="0.5">/100</tspan></text>
  <rect x="20" y="104" width="${barWidth}" height="6" rx="3" fill="#F8F5F2" opacity="0.12" />
  <rect x="20" y="104" width="${fillWidth}" height="6" rx="3" fill="#C75D3B" />
</svg>`;
}

function fallbackSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" rx="14" fill="#2B2521" />
  <text x="20" y="28" font-family="Fraunces, Georgia, serif" font-size="17" font-weight="700" fill="#F8F5F2">Estime</text>
  <text x="20" y="60" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#F8F5F2" opacity="0.6">Badge introuvable</text>
</svg>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("get_reputation_badge", {
    p_user_id: userId,
  });

  const headers = {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=300, s-maxage=300",
  };

  if (error || !data) {
    return new Response(fallbackSvg(), { status: 404, headers });
  }

  const badge = data as {
    prenom: string | null;
    metier: string | null;
    score: number;
  };
  const niveauLabel = NIVEAUX[niveauPourScore(badge.score)].label;

  const svg = buildBadgeSvg({
    prenom: badge.prenom,
    metier: badge.metier,
    score: badge.score,
    niveauLabel,
  });

  return new Response(svg, { headers });
}
