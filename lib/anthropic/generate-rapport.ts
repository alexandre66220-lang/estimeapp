import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

const client = new Anthropic();

export type RapportAIContent = {
  message: string;
  recommandations: string[];
};

export async function generateRapportContent(stats: {
  prenom: string;
  moisLabel: string;
  chantiers: number;
  posts: number;
  emails: number;
  avis: number;
  score: number;
  scoreEvolutionPct: number | null;
}): Promise<RapportAIContent> {
  const evolution =
    stats.scoreEvolutionPct !== null
      ? stats.scoreEvolutionPct >= 0
        ? `en hausse de ${stats.scoreEvolutionPct}%`
        : `en baisse de ${Math.abs(stats.scoreEvolutionPct)}%`
      : "stable";

  const prompt = `Tu es l'assistant d'Estime, une app pour les artisans du bâtiment.

Génère un message personnalisé et 3 recommandations pour le rapport mensuel de ${stats.prenom}.

Données du mois de ${stats.moisLabel} :
- Chantiers réalisés : ${stats.chantiers}
- Posts Instagram générés : ${stats.posts}
- Emails de demande d'avis envoyés : ${stats.emails}
- Avis reçus : ${stats.avis}
- Score de réputation : ${stats.score}/100 (${evolution} vs mois précédent)

Réponds UNIQUEMENT avec un JSON valide, sans markdown, ce format exact :
{
  "message": "Message personnalisé de 2-3 phrases, encourageant et professionnel, qui commente les performances du mois.",
  "recommandations": [
    "Recommandation 1 courte et actionnable (max 15 mots)",
    "Recommandation 2 courte et actionnable (max 15 mots)",
    "Recommandation 3 courte et actionnable (max 15 mots)"
  ]
}

Si les stats sont bonnes (score > 70, avis > 0) : message de félicitations.
Si les stats sont moyennes : message motivant.
Si peu d'activité (chantiers = 0, posts = 0) : message encourageant à reprendre l'activité.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const json = JSON.parse(text.trim());

    return {
      message: json.message ?? "Merci pour votre activité ce mois-ci.",
      recommandations: Array.isArray(json.recommandations)
        ? json.recommandations.slice(0, 3)
        : ["Ajoutez un nouveau chantier", "Envoyez des demandes d'avis", "Publiez sur Instagram"],
    };
  } catch {
    return {
      message: `Bonjour ${stats.prenom}, voici votre bilan du mois de ${stats.moisLabel}. Continuez à développer votre activité avec Estime !`,
      recommandations: [
        "Photographiez votre prochain chantier avant/après",
        "Envoyez des demandes d'avis à vos clients récents",
        "Publiez régulièrement sur Instagram pour votre visibilité",
      ],
    };
  }
}
