import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("materiau_scans")
    .select("analyse_status, analyse_json")
    .eq("id", id)
    .eq("artisan_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Scan introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    analyse_status: data.analyse_status,
    analyse_json: data.analyse_json,
  });
}
