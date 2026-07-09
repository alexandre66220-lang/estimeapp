/**
 * Netlify Background Function — analyse matériau via Anthropic Vision
 * Invoquée par app/actions/materiau.ts (demarrerScanMateriau) juste après la
 * création de la ligne materiau_scans (analyse_status = "pending").
 *
 * Contrairement aux fonctions synchrones (limitées à ~26s sur Netlify), une
 * Background Function n'a pas de contrainte de timeout et peut tourner
 * jusqu'à 15 minutes sur un plan Pro. C'est ce qui corrige les timeouts
 * intermittents du scanner matériau causés par la latence d'Anthropic Vision.
 *
 * Variables d'environnement requises :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   ANTHROPIC_API_KEY
 *   RESEND_API_KEY (alerte en cas d'échec)
 *
 * IMPORTANT : toute nouvelle Scheduled Function doit utiliser le wrapper
 * withErrorNotification de ./_utils/notify-error.ts. Cette Background
 * Function n'est pas une Scheduled Function (pas de config.schedule) mais
 * journalise ses erreurs avec le même utilitaire notifyFunctionError.
 */
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM_PROMPT_MATERIAU,
  parseAnalyseMateriau,
} from "../../lib/anthropic/analyze-materiau";
import { notifyFunctionError } from "./_utils/notify-error";

type Payload = {
  scanId: string;
  imageBase64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
};

export default async (req: Request) => {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(supabaseUrl, supabaseKey);

  let scanId: string | null = null;

  try {
    const body = (await req.json()) as Payload;
    scanId = body.scanId;
    const { imageBase64, mediaType } = body;

    if (!scanId || !imageBase64) {
      throw new Error("Payload invalide : scanId ou imageBase64 manquant.");
    }

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1400,
      system: SYSTEM_PROMPT_MATERIAU,
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
    });

    const block = response.content[0];
    const text = block.type === "text" ? block.text : "";
    const analyse = parseAnalyseMateriau(text);

    await admin
      .from("materiau_scans")
      .update({ analyse_status: "success", analyse_json: analyse })
      .eq("id", scanId);

    console.log(`[analyze-material-background] Analyse réussie pour le scan ${scanId}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;

    console.error(`[analyze-material-background] Échec pour le scan ${scanId ?? "inconnu"}:`, message);

    if (scanId) {
      await admin
        .from("materiau_scans")
        .update({ analyse_status: "error" })
        .eq("id", scanId);
    }

    await notifyFunctionError("analyze-material-background", message, stack);
  }

  return new Response(null, { status: 200 });
};
