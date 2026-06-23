import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";

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
};

export type GeneratedCaption = {
  legende: string;
  hashtags: string[];
};

export async function generateInstagramCaption(params: {
  titre: string;
  images: ImageInput[];
  prenom?: string | null;
  nom?: string | null;
  metier?: string | null;
  ville?: string | null;
  tonPost?: string | null;
  hashtagsFavoris?: string[] | null;
}): Promise<GeneratedCaption> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY n'est pas configurée.");
  }

  const anthropic = new Anthropic({ apiKey });

  const imageBlocks = await Promise.all(
    params.images.map(async ({ url, label }) => {
      const { mediaType, data } = await fetchImageAsBase64(url);
      return [
        {
          type: "text" as const,
          text: `Photo "${label}" du chantier :`,
        },
        {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mediaType,
            data,
          },
        },
      ];
    })
  );

  const nomComplet = [params.prenom, params.nom].filter(Boolean).join(" ");
  const tonInstruction = params.tonPost
    ? TON_INSTRUCTIONS[params.tonPost]
    : undefined;
  const favoris = (params.hashtagsFavoris ?? []).filter(Boolean);

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Tu es le community manager ${
              nomComplet ? `de ${nomComplet}, ` : "d'"
            }un artisan du bâtiment${
              params.metier ? ` (${params.metier})` : " (peintre, plombier, maçon ou électricien)"
            }${
              params.ville ? `, basé à ${params.ville}` : ""
            } qui utilise Estime pour valoriser ses chantiers sur les réseaux sociaux.

Chantier : "${params.titre}".

Regarde la ou les photos ci-dessous (avant/après travaux) et rédige une légende Instagram en français à partir de ce qu'elles montrent réellement.

Consignes pour la légende :
- Ton engageant et professionnel, à la première personne (l'artisan qui parle de son travail), sans emphase excessive ni superlatifs creux.${
              tonInstruction ? `\n- ${tonInstruction}` : ""
            }
- 2 à 4 phrases courtes maximum, qui décrivent concrètement la transformation visible sur les photos.
- N'utilise pas de tiret cadratin (—) ni d'emoji.
- Ne mets aucun hashtag dans la légende, ils seront générés séparément.

Consignes pour les hashtags (génère-les à part, jamais dans la légende) :
- 3 hashtags génériques liés au type de travaux visible sur la photo (ex: #peinture #renovation #avantapres).
- 3 hashtags liés au métier de l'artisan${
              params.metier ? ` (${params.metier})` : ""
            } (ex: #peintre #peintreenbatiment #artisanpeintre).
- 2 hashtags liés à la ville et la région de l'artisan${
              params.ville ? ` (${params.ville})` : ""
            } si elle est connue, sinon remplace-les par des hashtags génériques de métier/travaux supplémentaires.
- 2 hashtags de portée nationale (ex: #artisan #travauxmaison).
- 10 hashtags maximum au total, tous pertinents, en minuscules, sans espace ni accent, sans le symbole # répété au mauvais endroit.${
              favoris.length > 0
                ? `\n- Inclus en priorité ces hashtags favoris de l'artisan s'ils sont pertinents : ${favoris.join(", ")}.`
                : ""
            }

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, au format exact :
{"legende": "...", "hashtags": ["#tag1", "#tag2", ...]}`,
          },
          ...imageBlocks.flat(),
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

function parseGeneratedCaption(raw: string): GeneratedCaption {
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
