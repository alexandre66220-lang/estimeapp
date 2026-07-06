import { createClient } from "@/lib/supabase/server";
import { streamInstagramCaptionText, parseGeneratedCaption } from "@/lib/anthropic/generate-caption";
import { getSignedChantierPhotoUrl } from "@/lib/supabase/storage";
import { devError } from "@/lib/log";

export const runtime = "edge";

export async function POST(request: Request) {
  let chantierId: string | undefined;
  let tonPost: string | undefined;
  let longueurPost: string | undefined;
  try {
    const body = await request.json();
    chantierId = body.chantierId;
    tonPost = body.tonPost;
    longueurPost = body.longueurPost;
  } catch {
    return new Response(JSON.stringify({ error: "Requête invalide." }), { status: 400 });
  }

  if (!chantierId) {
    return new Response(JSON.stringify({ error: "L'identifiant du chantier est manquant." }), { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Non authentifié." }), { status: 401 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: generationsLastHour } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneHourAgo);

  if ((generationsLastHour ?? 0) >= 10) {
    return new Response(
      JSON.stringify({ error: "Vous avez atteint la limite de 10 générations par heure. Réessayez plus tard." }),
      { status: 429 }
    );
  }

  const [{ data: chantier, error: chantierError }, { data: profile }] = await Promise.all([
    supabase
      .from("chantiers")
      .select("id, titre, photo_avant_url, photo_apres_url, user_id")
      .eq("id", chantierId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("prenom, nom, metier, ville, ton_post, hashtags_favoris")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (chantierError || !chantier) {
    return new Response(JSON.stringify({ error: "Chantier introuvable." }), { status: 404 });
  }

  const [signedAvantUrl, signedApresUrl] = await Promise.all([
    getSignedChantierPhotoUrl(supabase, chantier.photo_avant_url),
    getSignedChantierPhotoUrl(supabase, chantier.photo_apres_url),
  ]);

  const images = [
    signedAvantUrl ? { url: signedAvantUrl, label: "avant" as const } : null,
    signedApresUrl ? { url: signedApresUrl, label: "après" as const } : null,
  ].filter((img): img is { url: string; label: "avant" | "après" } => img !== null);

  if (images.length === 0) {
    return new Response(JSON.stringify({ error: "Aucune photo n'est associée à ce chantier." }), { status: 400 });
  }

  const captionParams = {
    titre: chantier.titre,
    images,
    prenom: profile?.prenom,
    nom: profile?.nom,
    metier: profile?.metier,
    ville: profile?.ville,
    tonPost: tonPost ?? profile?.ton_post,
    longueurPost: longueurPost,
    hashtagsFavoris: profile?.hashtags_favoris,
  };

  const favoris = (profile?.hashtags_favoris ?? []).filter(
    (tag: string) => typeof tag === "string" && tag.trim().length > 0
  );
  const imageUrl = signedApresUrl ?? signedAvantUrl;
  const userId = user.id;
  const chantierId_ = chantier.id;

  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        function send(event: string, data: unknown) {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        }

        try {
          let fullText = "";

          for await (const chunk of streamInstagramCaptionText(captionParams)) {
            fullText += chunk;
            send("chunk", { text: chunk });
          }

          const generated = parseGeneratedCaption(fullText);
          const hashtags = Array.from(new Set([...favoris, ...generated.hashtags]));

          const { data: post, error: insertError } = await supabase
            .from("posts")
            .insert({
              chantier_id: chantierId_,
              user_id: userId,
              contenu: generated.legende,
              hashtags,
              image_url: imageUrl,
              plateforme: "instagram",
            })
            .select("id, contenu, hashtags, image_url, plateforme, created_at")
            .single();

          if (insertError || !post) {
            devError("generate-post: échec de l'enregistrement du post", insertError);
            send("error", { message: "Le post a été généré mais n'a pas pu être enregistré." });
            return;
          }

          send("complete", { post });
        } catch (error) {
          devError("generate-post: erreur streaming", error);
          send("error", { message: "La génération du post a échoué. Réessayez dans quelques instants." });
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    }
  );
}
