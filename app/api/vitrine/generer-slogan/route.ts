import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let metier = "artisan";
  let ville = "";
  try {
    const body = await request.json();
    metier = (typeof body.metier === "string" ? body.metier : "artisan").slice(0, 50);
    ville = (typeof body.ville === "string" ? body.ville : "").slice(0, 50);
  } catch {
    // defaults ok
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Service non configuré" }, { status: 503 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Génère exactement 3 slogans percutants pour un(e) ${metier}${ville ? ` à ${ville}` : ""}.
Chaque slogan doit :
- Faire moins de 80 caractères
- Être accrocheur, mémorable et professionnel
- Être en français
- Mettre en valeur le savoir-faire artisanal

Réponds UNIQUEMENT avec du JSON valide, sans texte avant ni après :
{"slogans": ["slogan1", "slogan2", "slogan3"]}`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[generer-slogan] Réponse non-JSON:", text.slice(0, 100));
      return NextResponse.json({ error: "Réponse invalide" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as { slogans?: string[] };
    const slogans = (parsed.slogans ?? []).slice(0, 3).map((s: string) => s.slice(0, 80));

    return NextResponse.json({ slogans });
  } catch (e) {
    console.error("[generer-slogan]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Erreur de génération" }, { status: 500 });
  }
}
