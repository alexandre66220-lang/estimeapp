import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { ADMIN_USER_ID } from "@/lib/backoffice/auth";
import { getFacturesParPeriode } from "@/lib/backoffice/finances";
import { factureStatutLabel, type FactureStatut } from "@/lib/backoffice/facture-statut";
import { resolvePeriode, type PeriodeCle } from "@/lib/backoffice/periode";

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

// Route handler : le layout /backoffice ne protège que le rendu des pages,
// pas les Route Handlers co-localisés. Vérification admin explicite ici.
export async function GET(request: Request) {
  const { supabase, user } = await getCurrentUser();

  if (!user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const { debut, fin } = resolvePeriode(
    (searchParams.get("periode") as PeriodeCle) ?? undefined,
    searchParams.get("debut") ?? undefined,
    searchParams.get("fin") ?? undefined
  );
  const statut = (searchParams.get("statut") as FactureStatut | null) ?? undefined;

  const factures = await getFacturesParPeriode(supabase, { debut, fin, statut });

  const header = ["Numéro", "Client", "Total HT", "Total TTC", "Statut", "Date émission", "Date paiement"];
  const lines = [header.join(",")];

  for (const f of factures) {
    lines.push(
      [
        csvEscape(f.numero),
        csvEscape(f.client_nom),
        f.total_ht.toFixed(2),
        f.total_ttc.toFixed(2),
        csvEscape(factureStatutLabel(f.statut)),
        f.date_emission,
        f.date_paiement ?? "",
      ].join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="factures-${debut}-${fin}.csv"`,
    },
  });
}
