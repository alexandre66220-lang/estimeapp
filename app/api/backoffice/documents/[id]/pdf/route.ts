import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { ADMIN_USER_ID } from "@/lib/backoffice/auth";
import { getDocument } from "@/lib/backoffice/documents";
import { DocumentPDF } from "@/components/pdf/DocumentPDF";

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

  const document = await getDocument(supabase, id);
  if (!document) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  const pdfElement = createElement(DocumentPDF, { titre: document.titre, contenu: document.contenu });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(pdfElement as any);

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${document.titre.replace(/[^a-z0-9]/gi, "-")}.pdf"`,
    },
  });
}
