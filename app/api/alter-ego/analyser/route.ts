import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { recalculerAlterEgo } from "@/lib/supabase/alter-ego";
import { devError } from "@/lib/log";

const RAPPORT_SECRET = process.env.RAPPORT_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId: bodyUserId, secret } = body as { userId?: string; secret?: string };

    let userId: string;
    const admin = createAdminClient();

    if (secret && RAPPORT_SECRET && secret === RAPPORT_SECRET && bodyUserId) {
      userId = bodyUserId;
    } else {
      const { user } = await getCurrentUser();
      if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      userId = user.id;
    }

    const result = await recalculerAlterEgo(admin as any, userId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({ success: true, nbPatterns: result.nbPatterns });
  } catch (err) {
    devError("alter-ego analyser error", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
