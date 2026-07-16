import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { ADMIN_USER_ID } from "@/lib/backoffice/auth";
import { getDevis } from "@/lib/backoffice/devis";
import { getClient } from "@/lib/backoffice/clients";
import { DevisPDF } from "@/components/pdf/DevisPDF";

// Route handler : le layout /backoffice ne protège que le rendu des pages,
// pas les Route Handlers co-localisés. Vérification admin explicite ici.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user } = await getCurrentUser();

  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  }

  const devis = await getDevis(supabase, id);
  if (!devis) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  const client = await getClient(supabase, devis.client_id);

  const pdfElement = createElement(DevisPDF, {
    devis,
    client: client
      ? { nom: client.nom, entreprise: client.entreprise, email: client.email }
      : { nom: devis.client_nom, entreprise: null, email: null },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(pdfElement as any);

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${devis.numero}.pdf"`,
    },
  });
}
