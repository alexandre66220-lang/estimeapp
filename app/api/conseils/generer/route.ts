import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const STALE_DAYS = 7;

export type ConseilTag = "Technique" | "Marketing" | "Gestion" | "Réputation" | "Sécurité";

export type Conseil = {
  id: string;
  titre: string;
  resume: string;
  contenu: string;
  tag: ConseilTag;
  lecture_min: number;
};

export type ConseilsContenu = {
  vedette: Conseil;
  conseils: Conseil[];
  astuces: string[];
  metier: string;
  ville: string | null;
  generated_at: string;
};

function isStale(generatedAt: string): boolean {
  const age = Date.now() - new Date(generatedAt).getTime();
  return age > STALE_DAYS * 24 * 3600 * 1000;
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const admin = createAdminClient();

  // Lire profil
  const { data: profile } = await admin
    .from("profiles")
    .select("metier, ville")
    .eq("id", user.id)
    .maybeSingle();

  const metier = profile?.metier ?? "artisan du bâtiment";
  const ville = profile?.ville ?? null;

  // Vérifier cache
  const { data: cache } = await admin
    .from("conseils_cache")
    .select("contenu, generated_at, metier")
    .eq("user_id", user.id)
    .maybeSingle();

  if (cache && !isStale(cache.generated_at) && cache.metier === metier) {
    return NextResponse.json({ contenu: cache.contenu, fromCache: true });
  }

  // Générer avec Claude
  const client = new Anthropic();
  const villeStr = ville ? ` à ${ville}` : "";
  const prompt = `Tu es un expert du BTP français avec 20 ans d'expérience. Tu donnes des conseils pratiques, concrets et actionnables aux artisans pour améliorer leur technique, leur marketing et leur gestion.

Génère du contenu de conseil pour un(e) ${metier}${villeStr}.

Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans explications. Format exact :
{
  "vedette": {
    "id": "v1",
    "titre": "Titre accrocheur (max 60 chars)",
    "resume": "Résumé en 2 lignes max",
    "contenu": "Texte complet de 3 à 4 paragraphes avec des conseils concrets",
    "tag": "Technique|Marketing|Gestion|Réputation|Sécurité",
    "lecture_min": 3
  },
  "conseils": [
    {
      "id": "c1",
      "titre": "Titre (max 60 chars)",
      "resume": "Résumé 2 lignes",
      "contenu": "Texte complet 2 à 3 paragraphes",
      "tag": "Technique|Marketing|Gestion|Réputation|Sécurité",
      "lecture_min": 2
    }
  ],
  "astuces": [
    "Astuce courte 1 spécifique au métier",
    "Astuce courte 2",
    "Astuce courte 3",
    "Astuce courte 4",
    "Astuce courte 5"
  ]
}

Génère exactement 6 conseils dans le tableau "conseils". Varie les tags entre Technique, Marketing, Gestion, Réputation et Sécurité. Les astuces doivent être très spécifiques au métier ${metier}.`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = msg.content.find((b) => b.type === "text")?.text ?? "{}";

  let contenuParse: Omit<ConseilsContenu, "metier" | "ville" | "generated_at">;
  try {
    contenuParse = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: "Erreur de génération." }, { status: 500 });
  }

  const contenu: ConseilsContenu = {
    ...contenuParse,
    metier,
    ville,
    generated_at: new Date().toISOString(),
  };

  // Upsert cache
  await admin.from("conseils_cache").upsert(
    { user_id: user.id, metier, contenu, generated_at: contenu.generated_at },
    { onConflict: "user_id" }
  );

  return NextResponse.json({ contenu, fromCache: false });
}
