import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { NIVEAUX, niveauPourScore } from "@/lib/score/reputation";

export const runtime = "edge";

type BadgeRow = {
  prenom: string | null;
  nom: string | null;
  metier: string | null;
  score: number;
  totalChantiers: number;
  totalAvis: number;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("get_reputation_badge", {
    p_user_id: userId,
  });

  if (error || !data) {
    return NextResponse.json({ error: "Artisan introuvable." }, { status: 404 });
  }

  const badge = data as BadgeRow;
  const niveau = niveauPourScore(badge.score);

  return NextResponse.json({
    prenom: badge.prenom,
    nom: badge.nom,
    metier: badge.metier,
    score: badge.score,
    niveau,
    niveauLabel: NIVEAUX[niveau].label,
    totalChantiers: badge.totalChantiers,
    totalAvis: badge.totalAvis,
  });
}
