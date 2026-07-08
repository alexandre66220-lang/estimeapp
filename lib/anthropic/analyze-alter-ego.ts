import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

const client = new Anthropic();

export type AlterEgoPattern = {
  type_pattern: string;
  description: string;
  frequence: number;
  score_confiance: number;
};

const SYSTEM_PROMPT_PATTERNS =
  "Tu es un analyste comportemental. Analyse les décisions financières et commentaires de cet artisan et identifie ses patterns de comportement récurrents, ses biais décisionnels, ses points de vulnérabilité (accepter des chantiers en surcharge, sous-facturer sous pression, ignorer les mauvais payeurs). Retourne uniquement un JSON avec un tableau de patterns : {type_pattern, description, frequence, score_confiance}. Sois factuel, pas moralisateur.";

export async function analyserPatternsComportementaux(donnees: {
  chantiers: Array<{
    titre: string;
    montant: number | null;
    statut: string | null;
    created_at: string;
    heures_passees: number | null;
    depenses: number | null;
  }>;
  impayes: Array<{ montant: number; joursRetard: number }>;
  notes: string[];
}): Promise<{ patterns?: AlterEgoPattern[]; portrait?: string; error?: string }> {
  const prompt = `Voici les 12 derniers mois de données de cet artisan.

Chantiers (${donnees.chantiers.length}) :
${donnees.chantiers
    .slice(0, 80)
    .map(
      (c) =>
        `- ${c.titre} | montant: ${c.montant ?? "non renseigné"}€ | statut: ${c.statut} | heures: ${c.heures_passees ?? "?"} | dépenses: ${c.depenses ?? "?"}€ | date: ${c.created_at.slice(0, 10)}`
    )
    .join("\n")}

Impayés récurrents (${donnees.impayes.length}) :
${donnees.impayes.map((i) => `- ${i.montant}€, ${i.joursRetard} jours de retard`).join("\n")}

Notes internes libres (commentaires de l'artisan sur ses chantiers) :
${donnees.notes.slice(0, 100).join("\n---\n")}

Retourne uniquement un JSON de la forme : {"patterns": [{"type_pattern": "...", "description": "...", "frequence": 0, "score_confiance": 0}], "portrait": "Un paragraphe de synthèse en langage humain, à la deuxième personne, sans jargon, qui décrit le profil comportemental complet de cet artisan."}`;

  try {
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 2000,
        system: SYSTEM_PROMPT_PATTERNS,
        messages: [{ role: "user", content: prompt }],
      },
      { timeout: 45000 }
    );

    const block = response.content[0];
    const text = block.type === "text" ? block.text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { error: "Réponse IA malformée." };

    const json = JSON.parse(match[0]);
    const patterns: AlterEgoPattern[] = Array.isArray(json.patterns)
      ? json.patterns.map((p: any) => ({
          type_pattern: String(p?.type_pattern ?? "Pattern non nommé"),
          description: String(p?.description ?? ""),
          frequence: Number(p?.frequence) || 1,
          score_confiance: Math.max(0, Math.min(100, Number(p?.score_confiance) || 50)),
        }))
      : [];

    return { patterns, portrait: json.portrait ? String(json.portrait) : undefined };
  } catch (err) {
    if (err instanceof SyntaxError) return { error: "Réponse IA invalide (JSON illisible)." };
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("timeout")) return { error: "L'analyse a expiré." };
    return { error: "Erreur lors de l'analyse comportementale." };
  }
}

export type CollisionResult = {
  collision: boolean;
  description: string | null;
};

const SYSTEM_PROMPT_COLLISION =
  "Tu compares une décision de chantier en cours avec les patterns comportementaux passés d'un artisan. Retourne uniquement un JSON : {collision: boolean, description: string ou null}. collision est true seulement si la décision en cours ressemble clairement à un pattern problématique connu. Sois factuel et concis (1 à 2 phrases dans description), pas moralisateur.";

export async function detecterCollisionPattern(
  nouveauChantier: {
    montant: number | null;
    delaiJours: number | null;
    chargeActuelle: number;
  },
  patterns: AlterEgoPattern[]
): Promise<{ data?: CollisionResult; error?: string }> {
  if (patterns.length === 0) return { data: { collision: false, description: null } };

  const prompt = `Nouveau chantier envisagé :
- Montant : ${nouveauChantier.montant ?? "non renseigné"}€
- Délai : ${nouveauChantier.delaiJours ?? "non renseigné"} jours
- Charge actuelle de l'artisan : ${nouveauChantier.chargeActuelle} chantiers en cours

Patterns comportementaux connus de cet artisan (les 5 plus fréquents) :
${patterns
    .slice(0, 5)
    .map((p) => `- ${p.type_pattern} (fréquence ${p.frequence}, confiance ${p.score_confiance}%) : ${p.description}`)
    .join("\n")}

Cette décision en cours risque-t-elle de reproduire un de ces patterns ? Retourne uniquement le JSON demandé.`;

  try {
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT_COLLISION,
        messages: [{ role: "user", content: prompt }],
      },
      { timeout: 15000 }
    );

    const block = response.content[0];
    const text = block.type === "text" ? block.text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { error: "Réponse IA malformée." };

    const json = JSON.parse(match[0]);
    return {
      data: {
        collision: Boolean(json.collision),
        description: json.description ? String(json.description) : null,
      },
    };
  } catch (err) {
    if (err instanceof SyntaxError) return { error: "Réponse IA invalide." };
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("timeout")) return { error: "Vérification expirée." };
    return { error: "Erreur lors de la vérification." };
  }
}
