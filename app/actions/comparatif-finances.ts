"use server";

import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { devError } from "@/lib/log";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export type PeriodStats = {
  ca: number;
  chantiers: number;
  moyenne: number;
  depenses: number;
  marge: number;
};

export async function getPeriodStats(
  dateDebut: string,
  dateFin: string
): Promise<{ data?: PeriodStats; error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const { data, error } = await supabase
    .from("chantiers")
    .select("montant, depenses, sous_traitance, frais_deplacement")
    .eq("user_id", user.id)
    .gte("created_at", dateDebut)
    .lte("created_at", dateFin);

  if (error) return { error: "Impossible de charger les données." };

  const rows = data ?? [];
  const ca = rows.reduce((s, r) => s + (r.montant ?? 0), 0);
  const depenses = rows.reduce(
    (s, r) => s + (r.depenses ?? 0) + (r.sous_traitance ?? 0) + (r.frais_deplacement ?? 0),
    0
  );

  return {
    data: {
      ca,
      chantiers: rows.length,
      moyenne: rows.length > 0 ? ca / rows.length : 0,
      depenses,
      marge: ca - depenses,
    },
  };
}

export async function genererAnalyseComparatif(
  periodeA: { label: string; stats: PeriodStats },
  periodeB: { label: string; stats: PeriodStats }
): Promise<{ analyse?: string; error?: string }> {
  const { user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const varCA = periodeA.stats.ca > 0
    ? Math.round(((periodeB.stats.ca - periodeA.stats.ca) / periodeA.stats.ca) * 100)
    : null;

  const prompt = [
    `Tu analyses les données financières d'un artisan. Écris un court résumé (3 phrases maximum, ton professionnel et encourageant) qui compare les deux périodes.`,
    `Période A (${periodeA.label}) : CA ${periodeA.stats.ca.toFixed(0)}€, ${periodeA.stats.chantiers} chantiers, marge ${periodeA.stats.marge.toFixed(0)}€`,
    `Période B (${periodeB.label}) : CA ${periodeB.stats.ca.toFixed(0)}€, ${periodeB.stats.chantiers} chantiers, marge ${periodeB.stats.marge.toFixed(0)}€`,
    varCA !== null ? `Évolution CA : ${varCA > 0 ? "+" : ""}${varCA}%` : "",
    `Mentionne les points clés et donne un conseil actionnable court.`,
  ].filter(Boolean).join("\n");

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content.find((b) => b.type === "text")?.text?.trim() ?? "";
    return { analyse: text };
  } catch (e) {
    devError("genererAnalyseComparatif", e);
    return { error: "Analyse indisponible." };
  }
}
