import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";

export async function GET() {
  const { supabase, user } = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1).toISOString();

  const { data: chantiers } = await supabase
    .from("chantiers")
    .select("id, titre, montant, statut, created_at, client_id, clients(prenom, nom)")
    .eq("user_id", user.id)
    .not("montant", "is", null)
    .gte("created_at", startOfYear)
    .order("created_at", { ascending: false });

  const rows: string[][] = [
    ["Date", "Chantier", "Client", "Montant (€)", "Statut"],
    ...(chantiers ?? []).map((c: any) => [
      new Date(c.created_at).toLocaleDateString("fr-FR"),
      c.titre ?? "",
      c.clients ? `${c.clients.prenom} ${c.clients.nom}` : "",
      (c.montant ?? 0).toString(),
      c.statut ?? "",
    ]),
  ];

  const csv = rows
    .map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="estime-finances-${year}.csv"`,
    },
  });
}
