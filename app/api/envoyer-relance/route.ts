import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendRelanceAvis } from "@/lib/resend/send-relance";

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
      .select("id, titre, client_email, client_nom")
      .eq("id", chantierId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("lien_avis_google, company_name, prenom, metier, template_email")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (chantierError || !chantier) {
    return NextResponse.json({ error: "Chantier introuvable." }, { status: 404 });
  }

  if (!chantier.client_email) {
    return NextResponse.json(
      { error: "Renseignez l'email du client avant d'envoyer une relance." },
      { status: 400 }
    );
  }

  if (!profile?.lien_avis_google) {
    return NextResponse.json(
      {
        error:
          "Renseignez votre lien vers votre fiche Google dans les paramètres avant d'envoyer une relance.",
      },
      { status: 400 }
    );
  }

  try {
    await sendRelanceAvis({
      clientEmail: chantier.client_email,
      clientNom: chantier.client_nom,
      chantierTitre: chantier.titre,
      companyName: profile.company_name,
      lienAvisGoogle: profile.lien_avis_google,
      prenomArtisan: profile.prenom,
      metier: profile.metier,
      templateEmail: profile.template_email,
    });
  } catch (error) {
    console.error("envoyer-relance: échec de l'envoi", error);
    await supabase.from("relances").insert({
      chantier_id: chantier.id,
      user_id: user.id,
      type: "avis",
      statut: "echec",
    });
    return NextResponse.json(
      { error: "L'envoi de l'email a échoué. Réessayez dans quelques instants." },
      { status: 502 }
    );
  }

  const { data: relance, error: insertError } = await supabase
    .from("relances")
    .insert({
      chantier_id: chantier.id,
      user_id: user.id,
      type: "avis",
      statut: "envoyee",
      envoyee_at: new Date().toISOString(),
    })
    .select("id, type, statut, envoyee_at, created_at")
    .single();

  if (insertError || !relance) {
    console.error("envoyer-relance: échec de l'enregistrement", insertError);
    return NextResponse.json(
      { error: "L'email a été envoyé mais l'historique n'a pas pu être enregistré." },
      { status: 500 }
    );
  }

  return NextResponse.json({ relance });
}
