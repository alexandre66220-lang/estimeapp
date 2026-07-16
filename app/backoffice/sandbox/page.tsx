import { Header } from "@/components/backoffice/Header";
import { Card } from "@/components/backoffice/Card";
import { FeatureFlagsPanel } from "@/components/backoffice/FeatureFlagsPanel";
import { getCurrentUser } from "@/lib/supabase/server";
import { getFeatureFlags } from "@/lib/backoffice/feature-flags";
import { getRapportLogsRecents } from "@/lib/backoffice/rapport-logs";

export default async function SandboxPage() {
  const { supabase } = await getCurrentUser();

  const [flags, logs] = await Promise.all([getFeatureFlags(supabase), getRapportLogsRecents(20)]);

  return (
    <>
      <Header title="Sandbox" subtitle="Logs & feature flags" />

      <div className="p-4 sm:p-8 space-y-6 max-w-3xl">
        <Card title="Logs & erreurs">
          <div className="px-5 py-3 border-b border-[#232326]">
            <p className="text-xs text-[#55555A]">
              Estime n&apos;a pas d&apos;intégration Sentry ni de table de logs applicatifs généraliste
              aujourd&apos;hui. La seule source de logs déjà en place est l&apos;historique du job planifié
              &laquo;&nbsp;rapport mensuel&nbsp;&raquo;, affiché ci-dessous.
            </p>
          </div>
          {logs.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[#55555A]">Aucun log pour l&apos;instant.</p>
          ) : (
            <ul className="divide-y divide-[#232326]">
              {logs.map((l) => (
                <li key={l.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-[#EDEDED]">
                      Rapport {l.mois} — {l.statut === "success" ? "OK" : "Échec"}
                    </p>
                    {l.erreur && <p className="text-xs text-[#F87171] truncate">{l.erreur}</p>}
                  </div>
                  <span className="text-xs text-[#55555A] shrink-0">
                    {new Date(l.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Feature flags">
          <FeatureFlagsPanel flags={flags} />
        </Card>
      </div>
    </>
  );
}
