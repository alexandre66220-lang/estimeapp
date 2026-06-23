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

export async function generateInstagramCaption(params: {
  titre: string;
  images: ImageInput[];
  prenom?: string | null;
  nom?: string | null;
  metier?: string | null;
  tonPost?: string | null;
}) {
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

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 600,
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
            } qui utilise Estime pour valoriser ses chantiers sur les réseaux sociaux.

Chantier : "${params.titre}".

Regarde la ou les photos ci-dessous (avant/après travaux) et rédige une légende Instagram en français à partir de ce qu'elles montrent réellement.

Consignes :
- Ton engageant et professionnel, à la première personne (l'artisan qui parle de son travail), sans emphase excessive ni superlatifs creux.${
              tonInstruction ? `\n- ${tonInstruction}` : ""
            }
- 2 à 4 phrases courtes maximum, qui décrivent concrètement la transformation visible sur les photos.
- Termine par une ligne de 5 à 8 hashtags pertinents (métier, type de travaux, région si déductible, "avantapres", "renovation", etc.), sans inventer de localisation si elle n'est pas visible.
- N'utilise pas de tiret cadratin (—) ni d'emoji.
- Réponds uniquement avec le texte de la légende prête à publier, sans aucune autre phrase d'introduction.`,
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

  return textBlock.text.trim();
}
