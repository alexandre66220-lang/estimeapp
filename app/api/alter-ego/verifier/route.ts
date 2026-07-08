import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { detecterCollisionPattern } from "@/lib/anthropic/analyze-alter-ego";
import { devError } from "@/lib/log";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const montant = typeof body?.montant === "number" ? body.montant : null;
    const delaiJours = typeof body?.delaiJours === "number" ? body.delaiJours : null;

    const { data: patterns } = await supabase
      .from("alter_ego_insights")
      .select("type_pattern, description, frequence, score_confiance")
      .eq("artisan_id", user.id)
      .order("frequence", { ascending: false })
      .limit(5);

    if (!patterns || patterns.length === 0) {
      return NextResponse.json({ collision: false, description: null });
    }

    const { count: chargeActuelle } = await supabase
      .from("chantiers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("statut", "en_cours");

    const { data: collision, error } = await detecterCollisionPattern(
      { montant, delaiJours, chargeActuelle: chargeActuelle ?? 0 },
      patterns
    );

    if (error) {
      return NextResponse.json({ collision: false, description: null, warning: error });
    }

    return NextResponse.json(collision);
  } catch (err) {
    devError("alter-ego verifier error", err);
    return NextResponse.json({ collision: false, description: null });
  }
}
