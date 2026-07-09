import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Warning } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { ScannerMateriauModal } from "@/components/espace/ScannerMateriauModal";
import type { AnalyseMateriau, RisqueMateriau } from "@/lib/anthropic/analyze-materiau";

export const metadata: Metadata = { title: "Sécurité — Estime" };

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

export default async function SecuritePage() {
  const { supabase, user } = await getCurrentUser();

  const [{ data: scans }, { data: chantiersListe }] = await Promise.all([
    supabase
      .from("materiau_scans")
      .select("id, created_at, image_url, analyse_json, chantier_id, chantiers(titre)")
      .eq("artisan_id", user!.id)
      .eq("analyse_status", "success")
      .order("created_at", { ascending: false }),
    supabase
      .from("chantiers")
      .select("id, titre")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const scansAvecUrl = await Promise.all(
    (scans ?? []).map(async (scan) => {
      const { data: signed } = await supabase.storage
        .from("materiau-scans")
        .createSignedUrl(scan.image_url, 3600);
      return {
        id: scan.id,
        created_at: scan.created_at,
        analyse_json: scan.analyse_json as AnalyseMateriau,
        imageUrl: signed?.signedUrl ?? null,
        chantierTitre: (scan as any).chantiers?.titre ?? null,
      };
    })
  );

  const chantiersPourSelect = (chantiersListe ?? []).map((c: { id: string; titre: string | null }) => ({
    id: c.id,
    titre: c.titre ?? "Chantier sans titre",
  }));

  const nbCritiques = scansAvecUrl.filter((s) => niveauMax(s.analyse_json) === "critique").length;

  const scansAssocies = scansAvecUrl.filter((s) => s.chantierTitre);
  const scansNonAssocies = scansAvecUrl.filter((s) => !s.chantierTitre);

  function ScanRow({ scan }: { scan: (typeof scansAvecUrl)[number] }) {
    const niveau = niveauMax(scan.analyse_json);
    return (
      <Link
        href={`/espace/materiaux/${scan.id}`}
        className="flex items-center gap-4 px-5 py-4 hover:bg-dust/30 transition-colors"
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
          <div className="flex items-center gap-2 mt-0.5">
            {scan.chantierTitre && (
              <span className="text-xs text-dusk/40 truncate">{scan.chantierTitre}</span>
            )}
            {scan.chantierTitre && <span className="text-xs text-dusk/25">·</span>}
            <span className="text-xs text-dusk/40">
              {new Date(scan.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        {niveau && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${NIVEAU_BADGE[niveau]}`}>
            {niveau === "critique" && <Warning size={12} weight="fill" />}
            {NIVEAU_LABELS[niveau]}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-dusk">Sécurité</h1>
          <p className="text-dusk/50 text-sm mt-1">
            Tous les matériaux scannés sur vos chantiers.
          </p>
        </div>
        <ScannerMateriauModal chantiers={chantiersPourSelect} />
      </div>

      {nbCritiques > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 mb-6">
          <Warning size={20} weight="fill" className="text-red-600 shrink-0" />
          <p className="text-sm text-red-700">
            {nbCritiques} matériau{nbCritiques > 1 ? "x" : ""} avec un risque critique détecté.
          </p>
        </div>
      )}

      {scansAvecUrl.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dusk/8 py-20 px-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-ambre/10 rounded-full flex items-center justify-center mb-5">
            <ShieldCheck size={30} className="text-ambre" />
          </div>
          <h2 className="font-display text-xl font-bold text-dusk mb-2">Aucun matériau scanné</h2>
          <p className="text-dusk/50 text-sm max-w-[40ch]">
            Scannez un matériau sur un chantier pour détecter les risques et générer une fiche de sécurité.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {scansAssocies.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-dusk mb-3">Scans liés à un chantier</h2>
              <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/8">
                {scansAssocies.map((scan) => (
                  <ScanRow key={scan.id} scan={scan} />
                ))}
              </div>
            </section>
          )}

          {scansNonAssocies.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-dusk mb-3">Scans non associés</h2>
              <p className="text-dusk/45 text-xs mb-3">
                Ces matériaux ont été scannés sans être rattachés à un chantier.
              </p>
              <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/8">
                {scansNonAssocies.map((scan) => (
                  <ScanRow key={scan.id} scan={scan} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
