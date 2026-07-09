import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DAILY_LIMIT = 5;

export async function POST(request: Request) {
  console.log("[generer-image] START, REPLICATE_API_TOKEN défini:", !!process.env.REPLICATE_API_TOKEN);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body: { prompt?: unknown } | null = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (prompt.length < 5) {
    return NextResponse.json({ error: "Prompt invalide." }, { status: 400 });
  }

  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateToken) {
    console.error("[generer-image] REPLICATE_API_TOKEN manquant");
    return NextResponse.json(
      { error: "Service de génération d'image non configuré." },
      { status: 503 }
    );
  }

  // Vérifier le quota journalier
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage, error: usageError } = await supabase
    .from("usage_ia")
    .select("id, images_generees")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  if (usageError) {
    console.error("[generer-image] usage_ia query error:", usageError.message, usageError.code);
    return NextResponse.json({ error: "Erreur de quota." }, { status: 500 });
  }

  const currentCount = usage?.images_generees ?? 0;
  if (currentCount >= DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: `Limite journalière atteinte (${DAILY_LIMIT} images/jour). Revenez demain.`,
        quota_exceeded: true,
      },
      { status: 429 }
    );
  }

  const finalPrompt = `${prompt}, style photographique professionnel, qualité commerciale, lumière naturelle, net et propre, haute résolution`;
  console.log("[generer-image] Appel Replicate, prompt:", finalPrompt.slice(0, 80));

  // Appel Replicate avec Prefer: wait (réponse synchrone si prête dans le délai)
  let predictionRes: Response;
  try {
    predictionRes = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${replicateToken}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            prompt: finalPrompt,
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "jpg",
            output_quality: 90,
          },
        }),
        signal: AbortSignal.timeout(22_000),
      }
    );
  } catch (fetchErr) {
    const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
    console.error("[generer-image] Fetch Replicate échoué:", msg);
    return NextResponse.json(
      { error: "Impossible de joindre le service de génération d'image. Réessayez." },
      { status: 502 }
    );
  }

  if (!predictionRes.ok) {
    const errText = await predictionRes.text().catch(() => "");
    console.error("[generer-image] Replicate HTTP error:", predictionRes.status, errText);
    return NextResponse.json(
      { error: `Erreur Replicate (${predictionRes.status}). Réessayez.` },
      { status: 500 }
    );
  }

  let prediction: { status: string; output?: unknown; id?: string; error?: string };
  try {
    prediction = await predictionRes.json();
  } catch {
    console.error("[generer-image] Réponse Replicate non-JSON");
    return NextResponse.json({ error: "Réponse invalide du service. Réessayez." }, { status: 500 });
  }

  console.log("[generer-image] Réponse Replicate, status:", prediction.status, "id:", prediction.id);

  let imageUrl: string | null = null;

  if (prediction.status === "succeeded" && Array.isArray(prediction.output)) {
    imageUrl = (prediction.output[0] as string) ?? null;
  } else if (prediction.status === "failed") {
    console.error("[generer-image] Replicate prediction failed:", prediction.error);
  } else if (prediction.id) {
    // Prefer: wait a expiré côté Replicate (polling court : 3 × 3s = 9s max)
    console.log("[generer-image] Polling prediction", prediction.id);
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const pollRes = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: { Authorization: `Bearer ${replicateToken}` },
            signal: AbortSignal.timeout(5_000),
          }
        );
        if (!pollRes.ok) {
          console.error("[generer-image] Poll HTTP error:", pollRes.status);
          break;
        }
        const poll = await pollRes.json() as { status: string; output?: unknown; error?: string };
        console.log("[generer-image] Poll", i + 1, "status:", poll.status);
        if (poll.status === "succeeded" && Array.isArray(poll.output)) {
          imageUrl = (poll.output[0] as string) ?? null;
          break;
        }
        if (poll.status === "failed") {
          console.error("[generer-image] Poll failed:", poll.error);
          break;
        }
      } catch (pollErr) {
        console.error("[generer-image] Poll fetch error:", pollErr instanceof Error ? pollErr.message : pollErr);
        break;
      }
    }
  }

  if (!imageUrl) {
    console.error("[generer-image] Aucune URL d'image obtenue, status final:", prediction.status);
    return NextResponse.json(
      { error: "La génération d'image a échoué ou a expiré. Réessayez." },
      { status: 500 }
    );
  }

  console.log("[generer-image] Image générée:", imageUrl.slice(0, 60));

  // Incrémenter le compteur
  if (usage) {
    await supabase
      .from("usage_ia")
      .update({ images_generees: currentCount + 1 })
      .eq("id", usage.id);
  } else {
    await supabase
      .from("usage_ia")
      .insert({ user_id: user.id, date: today, images_generees: 1 });
  }

  return NextResponse.json({ url: imageUrl, remaining: DAILY_LIMIT - currentCount - 1 });
}
