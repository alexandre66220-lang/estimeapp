import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { ADMIN_USER_ID } from "@/lib/backoffice/auth";
import { getFacture } from "@/lib/backoffice/factures";
import { getClient } from "@/lib/backoffice/clients";
import { FacturePDF } from "@/components/pdf/FacturePDF";

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

  const facture = await getFacture(supabase, id);
  if (!facture) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const client = await getClient(supabase, facture.client_id);

  const pdfElement = createElement(FacturePDF, {
    facture,
    client: client
      ? { nom: client.nom, entreprise: client.entreprise, email: client.email }
      : { nom: facture.client_nom, entreprise: null, email: null },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(pdfElement as any);

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${facture.numero}.pdf"`,
    },
  });
}
