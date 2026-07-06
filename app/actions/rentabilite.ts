"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function saveRentabilite(
  chantierId: string,
  data: {
    montant: number | null;
    depenses: number | null;
    heures_passees: number | null;
    sous_traitance: number | null;
    frais_deplacement: number | null;
    autres_couts?: number | null;
    taux_horaire_objectif?: number | null;
  }
): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("chantiers")
    .update({
      montant: data.montant,
      depenses: data.depenses,
      heures_passees: data.heures_passees,
      sous_traitance: data.sous_traitance,
      frais_deplacement: data.frais_deplacement,
      ...(data.autres_couts !== undefined ? { autres_couts: data.autres_couts } : {}),
      ...(data.taux_horaire_objectif !== undefined ? { taux_horaire_objectif: data.taux_horaire_objectif } : {}),
    })
    .eq("id", chantierId)
    .eq("user_id", user.id);

  if (error) return { error: "Impossible d'enregistrer." };
  revalidatePath(`/espace/chantiers/${chantierId}`);
  revalidatePath("/espace/finances");
  return {};
}

export async function analyserRentabilite(
  stats: {
    margeMoyenne: number;
    caAnnee: number;
    totalFournitures: number;
    totalSousTraitance: number;
    totalDeplacements: number;
    totalAutres: number;
    nbChantiers: number;
    tauxHoraireMoyen: number | null;
  }
): Promise<{ analyse?: string; error?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: "Configuration manquante." };

  const totalCouts = stats.totalFournitures + stats.totalSousTraitance + stats.totalDeplacements + stats.totalAutres;

  const prompt = `Tu es un conseiller financier pour artisans du bâtiment. Voici les données de rentabilité de l'artisan pour l'année en cours :

- Chiffre d'affaires : ${stats.caAnnee.toLocaleString("fr-FR")} €
- Nombre de chantiers : ${stats.nbChantiers}
- Taux de marge moyen : ${stats.margeMoyenne.toFixed(1)} %
- Total coûts : ${totalCouts.toLocaleString("fr-FR")} €
  - Fournitures : ${stats.totalFournitures.toLocaleString("fr-FR")} € (${totalCouts > 0 ? Math.round((stats.totalFournitures / totalCouts) * 100) : 0}%)
  - Sous-traitance : ${stats.totalSousTraitance.toLocaleString("fr-FR")} € (${totalCouts > 0 ? Math.round((stats.totalSousTraitance / totalCouts) * 100) : 0}%)
  - Déplacements : ${stats.totalDeplacements.toLocaleString("fr-FR")} € (${totalCouts > 0 ? Math.round((stats.totalDeplacements / totalCouts) * 100) : 0}%)
  - Autres : ${stats.totalAutres.toLocaleString("fr-FR")} € (${totalCouts > 0 ? Math.round((stats.totalAutres / totalCouts) * 100) : 0}%)
${stats.tauxHoraireMoyen !== null ? `- Taux horaire moyen réel : ${stats.tauxHoraireMoyen.toFixed(0)} €/h` : ""}

Génère exactement 3 recommandations concrètes et personnalisées pour améliorer la rentabilité. Chaque recommandation doit :
- Être spécifique aux chiffres fournis (cite les montants ou pourcentages)
- Proposer une action concrète
- Être formulée en 1-2 phrases maximum

Réponds avec un tableau JSON : [{"titre": "...", "conseil": "..."}]`;

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return { error: "Réponse invalide." };

    return { analyse: text.text.trim() };
  } catch {
    return { error: "L'analyse a échoué. Réessayez." };
  }
}
