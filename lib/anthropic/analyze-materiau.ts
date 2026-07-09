import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { notifyError } from "@/lib/resend/notify-error";

const MODEL = "claude-sonnet-4-6";
const TIMEOUT_MS = 60000;
const MAX_TENTATIVES = 2;
const DELAI_ENTRE_TENTATIVES_MS = 3000;

const MESSAGE_ECHEC_UTILISATEUR =
  "L'analyse n'a pas pu aboutir. Essaie avec une photo plus nette et bien éclairée, prise à 30-50 cm du matériau.";

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
  niveau_certitude: number;
  materiau_alternatif: string | null;
  risques: RisqueMateriau[];
  technique_depose_recommandee: string | null;
  equipements_protection: string[];
  action_immediate_requise: boolean;
  message_urgence: string | null;
  conseils_pro: string | null;
};

const SYSTEM_PROMPT = `Tu es un expert en matériaux du bâtiment avec 30 ans d'expérience en BTP français. Tu identifies les matériaux de construction, revêtements, isolants, enduits, peintures, canalisations et structures à partir de photos de chantier.

Analyse cette photo avec précision. Prends en compte la texture, la couleur, le grain, les reflets, l'état de dégradation visible et le contexte environnant pour affiner ton identification. Si plusieurs matériaux sont visibles, identifie le matériau principal au premier plan.

Pour les matériaux anciens (pose probable avant 1997), sois particulièrement vigilant sur les risques amiante. Pour les peintures anciennes (pose probable avant 1949), signale le risque plomb.

Retourne uniquement un JSON valide sans aucun texte autour, avec exactement cette structure :
{
  nom_materiau: string (nom précis, ex: plaque de plâtre BA13, carrelage grès cérame, enduit monocouche hydraulique),
  date_pose_probable: string (ex: années 70-80, post 2000, indéterminé),
  composition_estimee: string (description courte de la composition),
  niveau_certitude: number (0 à 100, ta confiance dans l'identification),
  materiau_alternatif: string ou null (si tu hésites entre deux matériaux, indique le second ici),
  risques: array de {substance: string, niveau_risque: faible ou modéré ou élevé ou critique, description: string},
  technique_depose_recommandee: string,
  equipements_protection: array de strings,
  action_immediate_requise: boolean,
  message_urgence: string ou null,
  conseils_pro: string (conseil pratique court de professionnel BTP pour travailler avec ce matériau)
}`;

function normaliserNiveau(niveau: unknown): RisqueMateriau["niveau_risque"] {
  const n = String(niveau ?? "").toLowerCase();
  if (n.includes("critique")) return "critique";
  if (n.includes("elev") || n.includes("élev")) return "eleve";
  if (n.includes("mode")) return "modere";
  return "faible";
}

function normaliserCertitude(valeur: unknown): number {
  const n = Number(valeur);
  if (Number.isNaN(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function parseAnalyse(text: string): AnalyseMateriau {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new SyntaxError("Aucun JSON trouvé dans la réponse.");

  const json = JSON.parse(match[0]);

  if (!json || typeof json.nom_materiau !== "string") {
    throw new SyntaxError("JSON incomplet : nom_materiau manquant.");
  }

  const risques: RisqueMateriau[] = Array.isArray(json.risques)
    ? json.risques.map((r: any) => ({
        substance: String(r?.substance ?? "Inconnue"),
        niveau_risque: normaliserNiveau(r?.niveau_risque),
        description: String(r?.description ?? ""),
      }))
    : [];

  return {
    nom_materiau: String(json.nom_materiau ?? "Matériau non identifié"),
    date_pose_probable: json.date_pose_probable ? String(json.date_pose_probable) : null,
    composition_estimee: json.composition_estimee ? String(json.composition_estimee) : null,
    niveau_certitude: normaliserCertitude(json.niveau_certitude),
    materiau_alternatif: json.materiau_alternatif ? String(json.materiau_alternatif) : null,
    risques,
    technique_depose_recommandee: json.technique_depose_recommandee
      ? String(json.technique_depose_recommandee)
      : null,
    equipements_protection: Array.isArray(json.equipements_protection)
      ? json.equipements_protection.map(String)
      : [],
    action_immediate_requise: Boolean(json.action_immediate_requise),
    message_urgence: json.message_urgence ? String(json.message_urgence) : null,
    conseils_pro: json.conseils_pro ? String(json.conseils_pro) : null,
  };
}

function attendre(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyserMateriau(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<{ data?: AnalyseMateriau; error?: string }> {
  let derniereErreur: unknown = null;

  for (let tentative = 1; tentative <= MAX_TENTATIVES; tentative++) {
    try {
      const response = await client.messages.create(
        {
          model: MODEL,
          max_tokens: 1400,
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
        { timeout: TIMEOUT_MS }
      );

      const block = response.content[0];
      const text = block.type === "text" ? block.text : "";
      const analyse = parseAnalyse(text);

      return { data: analyse };
    } catch (err) {
      derniereErreur = err;

      if (tentative < MAX_TENTATIVES) {
        await attendre(DELAI_ENTRE_TENTATIVES_MS);
        continue;
      }
    }
  }

  const message = derniereErreur instanceof Error ? derniereErreur.message : String(derniereErreur);
  const stack = derniereErreur instanceof Error ? derniereErreur.stack : undefined;

  await notifyError("scanner-materiau", message, stack);

  return { error: MESSAGE_ECHEC_UTILISATEUR };
}
