import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInstagramCaption } from "@/lib/anthropic/generate-caption";

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
      .select("prenom, nom, metier, ton_post")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (chantierError || !chantier) {
    return NextResponse.json({ error: "Chantier introuvable." }, { status: 404 });
  }

  const images = [
    chantier.photo_avant_url
      ? { url: chantier.photo_avant_url as string, label: "avant" as const }
      : null,
    chantier.photo_apres_url
      ? { url: chantier.photo_apres_url as string, label: "après" as const }
      : null,
  ].filter((image): image is { url: string; label: "avant" | "après" } => image !== null);

  if (images.length === 0) {
    return NextResponse.json(
      { error: "Aucune photo n'est associée à ce chantier." },
      { status: 400 }
    );
  }

  let contenu: string;
  try {
    contenu = await generateInstagramCaption({
      titre: chantier.titre,
      images,
      prenom: profile?.prenom,
      nom: profile?.nom,
      metier: profile?.metier,
      tonPost: profile?.ton_post,
    });
  } catch (error) {
    console.error("generate-post: échec de l'appel à Claude", error);
    return NextResponse.json(
      { error: "La génération du post a échoué. Réessayez dans quelques instants." },
      { status: 502 }
    );
  }

  const imageUrl = chantier.photo_apres_url ?? chantier.photo_avant_url;

  const { data: post, error: insertError } = await supabase
    .from("posts")
    .insert({
      chantier_id: chantier.id,
      user_id: user.id,
      contenu,
      image_url: imageUrl,
      plateforme: "instagram",
    })
    .select("id, contenu, image_url, plateforme, created_at")
    .single();

  if (insertError || !post) {
    console.error("generate-post: échec de l'enregistrement du post", insertError);
    return NextResponse.json(
      { error: "Le post a été généré mais n'a pas pu être enregistré." },
      { status: 500 }
    );
  }

  return NextResponse.json({ post });
}
