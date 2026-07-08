import Link from "next/link";
import { Warning } from "@phosphor-icons/react/dist/ssr";
import { ScannerMateriauModal } from "./ScannerMateriauModal";
import type { AnalyseMateriau, RisqueMateriau } from "@/lib/anthropic/analyze-materiau";

const NIVEAU_BADGE: Record<RisqueMateriau["niveau_risque"], string> = {
  faible: "bg-green-50 text-green-700",
  modere: "bg-orange-50 text-orange-600",
  eleve: "bg-red-50 text-red-600",
  critique: "bg-red-100 text-red-700",
};

const NIVEAU_LABELS: Record<RisqueMateriau["niveau_risque"], string> = {
  faible: "Faible",
  modere: "Modéré",
  eleve: "Élevé",
  critique: "Critique",
};

const NIVEAU_ORDRE: Record<RisqueMateriau["niveau_risque"], number> = {
  faible: 0,
  modere: 1,
  eleve: 2,
  critique: 3,
};

function niveauMax(analyse: AnalyseMateriau): RisqueMateriau["niveau_risque"] | null {
  if (!analyse.risques || analyse.risques.length === 0) return null;
  return analyse.risques.reduce<RisqueMateriau["niveau_risque"]>((max, r) => {
    return NIVEAU_ORDRE[r.niveau_risque] > NIVEAU_ORDRE[max] ? r.niveau_risque : max;
  }, "faible");
}

export type MateriauScanRow = {
  id: string;
  created_at: string;
  analyse_json: AnalyseMateriau;
  imageUrl: string | null;
};

export function JournalMateriauxChantier({
  chantierId,
  scans,
}: {
  chantierId: string;
  scans: MateriauScanRow[];
}) {
  return (
    <section className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h2 className="font-display text-lg font-bold text-dusk mb-1">Journal des matériaux</h2>
          <p className="text-dusk/45 text-xs">Scans horodatés associés à ce chantier</p>
        </div>
        <ScannerMateriauModal chantierId={chantierId} />
      </div>

      {scans.length === 0 ? (
        <p className="text-dusk/40 text-sm">Aucun matériau scanné pour ce chantier.</p>
      ) : (
        <div className="divide-y divide-dusk/8">
          {scans.map((scan) => {
            const niveau = niveauMax(scan.analyse_json);
            return (
              <Link
                key={scan.id}
                href={`/espace/materiaux/${scan.id}`}
                className="flex items-center gap-4 py-3.5 hover:bg-dust/30 transition-colors -mx-2 px-2 rounded-lg"
              >
                {scan.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={scan.imageUrl}
                    alt={scan.analyse_json.nom_materiau}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-dusk/10"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-dust shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dusk truncate">{scan.analyse_json.nom_materiau}</p>
                  <p className="text-xs text-dusk/40 mt-0.5">
                    {new Date(scan.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {niveau && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${NIVEAU_BADGE[niveau]}`}>
                    {niveau === "critique" && <Warning size={12} weight="fill" />}
                    {NIVEAU_LABELS[niveau]}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
