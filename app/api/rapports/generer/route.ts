import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRapportData } from "@/lib/supabase/rapports";
import { generateRapportContent } from "@/lib/anthropic/generate-rapport";
import { RapportMensuelPDF } from "@/components/pdf/RapportMensuelPDF";
import { getCurrentUser } from "@/lib/supabase/server";
import { devError } from "@/lib/log";

const RAPPORT_SECRET = process.env.RAPPORT_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId: bodyUserId, secret, targetDate: targetDateStr } = body as {
      userId?: string;
      secret?: string;
      targetDate?: string;
    };

    let userId: string;
    const admin = createAdminClient();

    // Auth : either internal secret (scheduled function) or logged-in user
    if (secret && RAPPORT_SECRET && secret === RAPPORT_SECRET && bodyUserId) {
      userId = bodyUserId;
    } else {
      const { user } = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }
      userId = user.id;
    }

    const targetDate = targetDateStr ? new Date(targetDateStr) : undefined;
    const data = await getRapportData(admin as any, userId, targetDate);
    if (!data) {
      return NextResponse.json({ error: "Données introuvables" }, { status: 404 });
    }

    // Generate AI content
    const ai = await generateRapportContent({
      prenom: data.artisan.prenom,
      moisLabel: data.moisLabel,
      ...data.stats,
    });

    // Render PDF to buffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfElement = createElement(RapportMensuelPDF as any, { data, ai });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(pdfElement as any);

    // Upload to Supabase Storage
    const fileName = `rapport-${data.moisKey}.pdf`;
    const storagePath = `${userId}/${fileName}`;

    const { error: uploadError } = await admin.storage
      .from("rapports")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      devError("rapport upload error", uploadError);
      return NextResponse.json({ error: "Erreur de stockage" }, { status: 500 });
    }

    // Get signed URL (valid 1 year)
    const { data: signedData } = await admin.storage
      .from("rapports")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    const pdfUrl = signedData?.signedUrl ?? null;

    // Log in rapport_logs
    await admin.from("rapport_logs").upsert(
      {
        user_id: userId,
        mois: data.moisKey,
        pdf_url: pdfUrl,
        statut: "success",
        erreur: null,
      },
      { onConflict: "user_id,mois" }
    );

    return NextResponse.json({
      success: true,
      pdfUrl,
      moisLabel: data.moisLabel,
      artisanEmail: data.artisan.email,
      artisanPrenom: data.artisan.prenom,
      stats: data.stats,
    });
  } catch (err) {
    devError("rapport generer error", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
