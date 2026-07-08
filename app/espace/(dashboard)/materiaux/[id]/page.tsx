import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { MateriauScanResult } from "@/components/espace/MateriauScanResult";
import type { AnalyseMateriau } from "@/lib/anthropic/analyze-materiau";

export const metadata: Metadata = { title: "Fiche matériau — Estime" };

export default async function FicheMateriauPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await getCurrentUser();

  const { data: scan } = await supabase
    .from("materiau_scans")
    .select("id, analyse_json, created_at, image_url, chantier_id, chantiers(id, titre)")
    .eq("id", id)
    .eq("artisan_id", user!.id)
    .maybeSingle();

  if (!scan) notFound();

  const { data: signed } = await supabase.storage
    .from("materiau-scans")
    .createSignedUrl(scan.image_url, 3600);

  const analyse = scan.analyse_json as AnalyseMateriau;
  const chantier = (scan as any).chantiers as { id: string; titre: string } | null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16">
      <Link
        href={chantier ? `/espace/chantiers/${chantier.id}` : "/espace/securite"}
        className="inline-flex items-center gap-2 text-dusk/50 hover:text-dusk text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        {chantier ? `Retour au chantier ${chantier.titre}` : "Retour à la sécurité"}
      </Link>

      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-dusk">Fiche de sécurité matériau</h1>
          <p className="text-dusk/45 text-sm mt-1">
            Scanné le{" "}
            {new Date(scan.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <a
          href={`/api/materiaux/${scan.id}/pdf`}
          download
          className="inline-flex items-center gap-2 text-dusk font-medium text-sm px-5 py-2.5 rounded-full border border-dusk/20 hover:bg-dusk/5 transition-colors"
        >
          <DownloadSimple size={16} weight="bold" />
          Export PDF
        </a>
      </div>

      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
        <MateriauScanResult analyse={analyse} imagePreview={signed?.signedUrl ?? null} />
      </div>
    </div>
  );
}
