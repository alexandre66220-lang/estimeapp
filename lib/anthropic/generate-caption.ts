import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

type ImageInput = {
  url: string;
  label: "avant" | "après";
};

type SupportedMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function guessMediaType(contentType: string | null): SupportedMediaType {
  switch (contentType) {
    case "image/png":
      return "image/png";
    case "image/gif":
      return "image/gif";
    case "image/webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function fetchImageAsBase64(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Impossible de récupérer la photo (${response.status}).`);
  }
  const mediaType = guessMediaType(response.headers.get("content-type"));
  const data = arrayBufferToBase64(await response.arrayBuffer());
  return { mediaType, data };
}

const TON_INSTRUCTIONS: Record<string, string> = {
  professionnel: "Ton sobre et direct, orienté résultat, sans familiarité.",
  decontracte: "Ton chaleureux et convivial, comme si tu parlais à un voisin.",
  technique: "Ton précis qui emploie le vocabulaire métier approprié.",
  chaleureux: "Ton chaleureux et humain, mets en valeur la relation client et la fierté du travail bien fait.",
};

const LONGUEUR_INSTRUCTIONS: Record<string, { instruction: string; maxTokens: number }> = {
  court: { instruction: "Légende courte : 1 à 2 phrases maximum, environ 150 caractères.", maxTokens: 250 },
  moyen: { instruction: "Légende de longueur moyenne : 3 à 4 phrases, environ 300 caractères.", maxTokens: 400 },
  long: { instruction: "Légende détaillée : 5 à 7 phrases, environ 600 caractères.", maxTokens: 700 },
};

export type GeneratedCaption = {
  legende: string;
  hashtags: string[];
};

type CaptionParams = {
  titre: string;
  images: ImageInput[];
  prenom?: string | null;
  nom?: string | null;
  metier?: string | null;
  ville?: string | null;
  tonPost?: string | null;
  longueurPost?: string | null;
  hashtagsFavoris?: string[] | null;
};

function buildPrompt(params: CaptionParams): string {
  const nomComplet = [params.prenom, params.nom].filter(Boolean).join(" ");
  const tonInstruction = params.tonPost ? TON_INSTRUCTIONS[params.tonPost] : undefined;
  const longueurConfig = params.longueurPost
    ? LONGUEUR_INSTRUCTIONS[params.longueurPost]
    : LONGUEUR_INSTRUCTIONS.moyen;
  const favoris = (params.hashtagsFavoris ?? []).filter(Boolean);

  return `Tu es le community manager ${
    nomComplet ? `de ${nomComplet}, ` : "d'"
  }un artisan du bâtiment${
    params.metier ? ` (${params.metier})` : ""
  }${
    params.ville ? `, basé à ${params.ville}` : ""
  }. Chantier : "${params.titre}".

Regarde la ou les photos (avant/après travaux) et rédige une légende Instagram en français à partir de ce qu'elles montrent.

Légende :
- À la première personne, sans emphase ni superlatifs.${tonInstruction ? `\n- ${tonInstruction}` : ""}
- ${longueurConfig.instruction}
- Décris concrètement la transformation visible.
- Pas de tiret cadratin ni d'emoji. Pas de hashtag dans la légende.

Hashtags (séparés de la légende) :
- 3 hashtags liés aux travaux visibles.
- 3 liés au métier${params.metier ? ` (${params.metier})` : ""}.
- 2 liés à la ville${params.ville ? ` (${params.ville})` : ""}.
- 2 de portée nationale (#artisan #travauxmaison).
- 10 maximum, en minuscules, sans espace ni accent.${
    favoris.length > 0
      ? `\n- Inclus en priorité : ${favoris.join(", ")}.`
      : ""
  }

Réponds UNIQUEMENT avec un JSON valide :
{"legende": "...", "hashtags": ["#tag1", "#tag2", ...]}`;
}

async function buildImageBlocks(images: ImageInput[]) {
  return Promise.all(
    images.map(async ({ url, label }) => {
      const { mediaType, data } = await fetchImageAsBase64(url);
      return [
        { type: "text" as const, text: `Photo "${label}" :` },
        {
          type: "image" as const,
          source: { type: "base64" as const, media_type: mediaType, data },
        },
      ];
    })
  );
}

export function parseGeneratedCaption(raw: string): GeneratedCaption {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("La réponse de l'IA n'est pas au format attendu.");
  }

  const parsed = JSON.parse(jsonMatch[0]) as { legende?: unknown; hashtags?: unknown };

  const legende = typeof parsed.legende === "string" ? parsed.legende.trim() : "";
  const hashtags = Array.isArray(parsed.hashtags)
    ? parsed.hashtags
        .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
        .map((tag) => (tag.trim().startsWith("#") ? tag.trim() : `#${tag.trim()}`))
        .slice(0, 10)
    : [];

  if (!legende) {
    throw new Error("La réponse de l'IA ne contient pas de légende.");
  }

  return { legende, hashtags };
}

/** Streams raw text chunks from Anthropic. Caller accumulates and parses when done. */
export async function* streamInstagramCaptionText(params: CaptionParams): AsyncGenerator<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY n'est pas configurée.");

  const anthropic = new Anthropic({ apiKey });
  const longueurConfig = params.longueurPost
    ? LONGUEUR_INSTRUCTIONS[params.longueurPost]
    : LONGUEUR_INSTRUCTIONS.moyen;

  const imageBlocksNested = await buildImageBlocks(params.images);

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: longueurConfig.maxTokens,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: buildPrompt(params) },
          ...imageBlocksNested.flat(),
        ],
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

/** Non-streaming version kept for backward compat / other callers. */
export async function generateInstagramCaption(params: CaptionParams): Promise<GeneratedCaption> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY n'est pas configurée.");

  const anthropic = new Anthropic({ apiKey });
  const longueurConfig = params.longueurPost
    ? LONGUEUR_INSTRUCTIONS[params.longueurPost]
    : LONGUEUR_INSTRUCTIONS.moyen;

  const imageBlocksNested = await buildImageBlocks(params.images);

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: longueurConfig.maxTokens,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: buildPrompt(params) },
          ...imageBlocksNested.flat(),
        ],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("La réponse de l'IA ne contient pas de texte.");
  }

  return parseGeneratedCaption(textBlock.text.trim());
}
