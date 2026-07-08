import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DAILY_LIMIT = 5;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const prompt: string | undefined = body?.prompt;
  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
    return NextResponse.json({ error: "Prompt invalide." }, { status: 400 });
  }

  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateToken) {
    return NextResponse.json(
      { error: "Service de génération d'image non configuré." },
      { status: 500 }
    );
  }

  // Vérifier et incrémenter le compteur journalier
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

  // Construire le prompt final
  const finalPrompt = `${prompt.trim()}, style photographique professionnel, qualité commerciale, lumière naturelle, net et propre, haute résolution`;

  // Appeler Replicate — flux-schnell (timeout 20s pour Prefer: wait)
  const predictionRes = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
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
    signal: AbortSignal.timeout(20_000),
  });

  if (!predictionRes.ok) {
    const errText = await predictionRes.text().catch(() => "");
    console.error("[generer-image] Replicate error:", predictionRes.status, errText);
    return NextResponse.json(
      { error: "La génération d'image a échoué. Réessayez." },
      { status: 500 }
    );
  }

  const prediction = await predictionRes.json();

  // Polling si pas encore terminé (Prefer: wait peut timeout)
  let imageUrl: string | null = null;
  if (prediction.status === "succeeded" && Array.isArray(prediction.output)) {
    imageUrl = prediction.output[0] ?? null;
  } else if (prediction.status !== "failed" && prediction.id) {
    // Polling jusqu'à 8s (4 × 2s) — fallback si Prefer: wait a expiré
    console.log("[generer-image] Polling prediction", prediction.id, "status:", prediction.status);
    for (let i = 0; i < 4; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Bearer ${replicateToken}` },
      });
      if (!pollRes.ok) {
        console.error("[generer-image] Poll request failed:", pollRes.status);
        break;
      }
      const poll = await pollRes.json();
      console.log("[generer-image] Poll", i + 1, "status:", poll.status);
      if (poll.status === "succeeded" && Array.isArray(poll.output)) {
        imageUrl = poll.output[0] ?? null;
        break;
      }
      if (poll.status === "failed") {
        console.error("[generer-image] Prediction failed:", poll.error);
        break;
      }
    }
  }

  if (!imageUrl) {
    return NextResponse.json(
      { error: "La génération d'image a échoué ou a expiré. Réessayez." },
      { status: 500 }
    );
  }

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
