import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

  let prompt: string, metier: string, ville: string, ton: string, longueur: string;
  try {
    ({ prompt, metier, ville, ton = "professionnel", longueur = "moyen" } = await request.json());
  } catch {
    return Response.json({ error: "Requête invalide" }, { status: 400 });
  }

  if (!prompt) return Response.json({ error: "Prompt manquant" }, { status: 400 });

  const longueurMap: Record<string, string> = {
    court: "environ 150 caractères",
    moyen: "environ 300 caractères",
    long: "environ 600 caractères",
  };

  const tonMap: Record<string, string> = {
    professionnel: "professionnel et sérieux",
    decontracte: "décontracté et sympa",
    technique: "technique et expert",
    chaleureux: "chaleureux et proche",
  };

  const systemPrompt = `Tu es un expert en communication pour artisans du bâtiment. Tu rédiges des posts Instagram engageants, locaux et professionnels.`;

  const userPrompt = `Génère un post Instagram professionnel pour un artisan ${metier || "du bâtiment"}${ville ? ` basé à ${ville}` : ""}.
L'image montre : ${prompt}.
Ton du post : ${tonMap[ton] ?? ton}.
Longueur : ${longueurMap[longueur] ?? "environ 300 caractères"}.
Inclus 5 hashtags locaux et professionnels pertinents.

Réponds UNIQUEMENT avec un JSON valide dans ce format exact :
{"texte": "Le texte du post", "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]}`;

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format invalide");
    const parsed = JSON.parse(jsonMatch[0]) as { texte: string; hashtags: string[] };

    return Response.json({ texte: parsed.texte, hashtags: parsed.hashtags ?? [] });
  } catch {
    return Response.json({ error: "La génération du texte a échoué. Réessayez." }, { status: 500 });
  }
}
