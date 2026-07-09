import type { Metadata } from "next";
import Link from "next/link";
import {
  FilePdf,
  Download,
  ArrowClockwise,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { getRapportLogs } from "@/lib/supabase/rapports";
import { GenererRapportButton } from "@/components/espace/GenererRapportButton";

export const metadata: Metadata = { title: "Mes rapports, Estime" };

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function moisLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  if (!year || !month) return key;
  return `${MOIS_FR[month - 1]} ${year}`;
}

function canGenerate() {
  return new Date().getDate() >= 25;
}

export default async function RapportsPage() {
  const { supabase, user } = await getCurrentUser();
  const logs = await getRapportLogs(supabase, user!.id);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-dusk">Mes rapports</h1>
          <p className="text-dusk/50 text-sm mt-1">
            Bilans mensuels envoyés automatiquement le 1er de chaque mois.
          </p>
        </div>
        {canGenerate() && (
          <GenererRapportButton currentMonthKey={currentMonthKey} />
        )}
      </div>

      {!canGenerate() && (
        <div className="flex items-start gap-3 bg-ambre/10 rounded-xl px-4 py-3 mb-6 text-sm text-braise">
          <WarningCircle size={18} className="shrink-0 mt-0.5" />
          <p>
            La génération manuelle est disponible à partir du 25 du mois,
            lorsque les données sont suffisamment complètes.
          </p>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dusk/8 py-20 px-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-ambre/10 rounded-full flex items-center justify-center mb-5">
            <FilePdf size={26} className="text-ambre" />
          </div>
          <h2 className="font-display text-xl font-bold text-dusk mb-2">
            Aucun rapport pour l&apos;instant
          </h2>
          <p className="text-dusk/50 text-sm max-w-[40ch]">
            Votre premier rapport mensuel sera généré et envoyé automatiquement
            le 1er du mois prochain.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/8">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    log.statut === "success"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  <FilePdf size={18} weight="bold" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-dusk text-sm capitalize">
                    {moisLabel(log.mois)}
                  </p>
                  <p className="text-dusk/40 text-xs mt-0.5">
                    {log.email_envoye ? "Email envoyé" : "Généré manuellement"} ·{" "}
                    {new Date(log.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {log.statut === "error" && (
                  <span className="text-xs text-red-500 font-medium">Erreur</span>
                )}
                {log.pdf_url && log.statut === "success" && (
                  <a
                    href={log.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-dusk/60 hover:text-dusk px-3 py-1.5 rounded-full border border-dusk/15 hover:bg-dusk/5 transition-colors duration-200"
                  >
                    <Download size={14} weight="bold" />
                    Télécharger
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-dusk/35 text-center mt-8">
        Les rapports sont générés et envoyés automatiquement le 1er de chaque mois à 8h00
        pour tous les artisans abonnés.
      </p>
    </div>
  );
}
