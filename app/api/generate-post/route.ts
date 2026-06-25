import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInstagramCaption } from "@/lib/anthropic/generate-caption";
import { getSignedChantierPhotoUrl } from "@/lib/supabase/storage";
import { devError } from "@/lib/log";

export const runtime = "edge";

export async function POST(request: Request) {
  let chantierId: string | undefined;
  try {
    const body = await request.json();
    chantierId = body.chantierId;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (!chantierId) {
    return NextResponse.json(
      { error: "L'identifiant du chantier est manquant." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: generationsLastHour } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneHourAgo);

  if ((generationsLastHour ?? 0) >= 10) {
    return NextResponse.json(
      {
        error:
          "Vous avez atteint la limite de 10 générations par heure. Réessayez plus tard.",
      },
      { status: 429 }
    );
  }

  const [
    { data: chantier, error: chantierError },
    { data: profile },
  ] = await Promise.all([
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
    return NextResponse.json({ error: "Chantier introuvable." }, { status: 404 });
  }

  const [signedAvantUrl, signedApresUrl] = await Promise.all([
    getSignedChantierPhotoUrl(supabase, chantier.photo_avant_url),
    getSignedChantierPhotoUrl(supabase, chantier.photo_apres_url),
  ]);

  const images = [
    signedAvantUrl ? { url: signedAvantUrl, label: "avant" as const } : null,
    signedApresUrl ? { url: signedApresUrl, label: "après" as const } : null,
  ].filter((image): image is { url: string; label: "avant" | "après" } => image !== null);

  if (images.length === 0) {
    return NextResponse.json(
      { error: "Aucune photo n'est associée à ce chantier." },
      { status: 400 }
    );
  }

  let generated: { legende: string; hashtags: string[] };
  try {
    generated = await generateInstagramCaption({
      titre: chantier.titre,
      images,
      prenom: profile?.prenom,
      nom: profile?.nom,
      metier: profile?.metier,
      ville: profile?.ville,
      tonPost: profile?.ton_post,
      hashtagsFavoris: profile?.hashtags_favoris,
    });
  } catch (error) {
    devError("generate-post: échec de l'appel à Claude", error);
    return NextResponse.json(
      { error: "La génération du post a échoué. Réessayez dans quelques instants." },
      { status: 502 }
    );
  }

  const favoris = (profile?.hashtags_favoris ?? []).filter(
    (tag: string) => typeof tag === "string" && tag.trim().length > 0
  );
  const hashtags = Array.from(new Set([...favoris, ...generated.hashtags]));

  const imageUrl = signedApresUrl ?? signedAvantUrl;

  const { data: post, error: insertError } = await supabase
    .from("posts")
    .insert({
      chantier_id: chantier.id,
      user_id: user.id,
      contenu: generated.legende,
      hashtags,
      image_url: imageUrl,
      plateforme: "instagram",
    })
    .select("id, contenu, hashtags, image_url, plateforme, created_at")
    .single();

  if (insertError || !post) {
    devError("generate-post: échec de l'enregistrement du post", insertError);
    return NextResponse.json(
      { error: "Le post a été généré mais n'a pas pu être enregistré." },
      { status: 500 }
    );
  }

  return NextResponse.json({ post });
}
