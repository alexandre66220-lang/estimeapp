import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { FicheMateriauPDF } from "@/components/pdf/FicheMateriauPDF";
import { devError } from "@/lib/log";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, user } = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { data: scan } = await supabase
      .from("materiau_scans")
      .select("id, analyse_json, created_at, chantier_id, chantiers(titre)")
      .eq("id", id)
      .eq("artisan_id", user.id)
      .maybeSingle();

    if (!scan) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    const dateHoraire = new Date(scan.created_at).toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const chantierTitre = (scan as any).chantiers?.titre ?? null;

    const pdfElement = createElement(FicheMateriauPDF as any, {
      analyse: scan.analyse_json,
      dateHoraire,
      chantierTitre,
    });
    const pdfBuffer = await renderToBuffer(pdfElement as any);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="fiche-materiau-${id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    devError("fiche materiau pdf error", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
