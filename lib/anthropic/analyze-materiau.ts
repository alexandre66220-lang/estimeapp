import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";

const client = new Anthropic();

export type RisqueMateriau = {
  substance: string;
  niveau_risque: "faible" | "modere" | "eleve" | "critique";
  description: string;
};

export type AnalyseMateriau = {
  nom_materiau: string;
  date_pose_probable: string | null;
  composition_estimee: string | null;
  risques: RisqueMateriau[];
  technique_depose_recommandee: string | null;
  equipements_protection: string[];
  action_immediate_requise: boolean;
  message_urgence: string | null;
};

const SYSTEM_PROMPT = `Tu es un expert en matériaux du bâtiment et en sécurité des chantiers BTP. Analyse cette photo et identifie le matériau visible. Retourne uniquement un JSON avec : {nom_materiau, date_pose_probable, composition_estimee, risques (tableau : {substance, niveau_risque: faible/modere/eleve/critique, description}), technique_depose_recommandee, equipements_protection (tableau de strings), action_immediate_requise (boolean), message_urgence (string ou null)}. Si le matériau n'est pas identifiable, indique-le clairement dans nom_materiau. Réponds uniquement en JSON valide, sans markdown.`;

function normaliserNiveau(niveau: unknown): RisqueMateriau["niveau_risque"] {
  const n = String(niveau ?? "").toLowerCase();
  if (n.includes("critique")) return "critique";
  if (n.includes("elev") || n.includes("élev")) return "eleve";
  if (n.includes("mode")) return "modere";
  return "faible";
}

export async function analyserMateriau(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<{ data?: AnalyseMateriau; error?: string }> {
  try {
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: imageBase64 },
              },
              {
                type: "text",
                text: "Analyse ce matériau et retourne le JSON demandé.",
              },
            ],
          },
        ],
      },
      { timeout: 30000 }
    );

    const block = response.content[0];
    const text = block.type === "text" ? block.text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { error: "Réponse IA malformée." };

    const json = JSON.parse(match[0]);

    const risques: RisqueMateriau[] = Array.isArray(json.risques)
      ? json.risques.map((r: any) => ({
          substance: String(r?.substance ?? "Inconnue"),
          niveau_risque: normaliserNiveau(r?.niveau_risque),
          description: String(r?.description ?? ""),
        }))
      : [];

    const analyse: AnalyseMateriau = {
      nom_materiau: String(json.nom_materiau ?? "Matériau non identifié"),
      date_pose_probable: json.date_pose_probable ? String(json.date_pose_probable) : null,
      composition_estimee: json.composition_estimee ? String(json.composition_estimee) : null,
      risques,
      technique_depose_recommandee: json.technique_depose_recommandee
        ? String(json.technique_depose_recommandee)
        : null,
      equipements_protection: Array.isArray(json.equipements_protection)
        ? json.equipements_protection.map(String)
        : [],
      action_immediate_requise: Boolean(json.action_immediate_requise),
      message_urgence: json.message_urgence ? String(json.message_urgence) : null,
    };

    return { data: analyse };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return { error: "Réponse IA invalide (JSON illisible)." };
    }
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("timeout")) {
      return { error: "L'analyse a expiré. Réessayez avec une photo plus nette." };
    }
    return { error: "Erreur lors de l'analyse du matériau." };
  }
}
