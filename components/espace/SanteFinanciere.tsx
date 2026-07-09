import { TrendUp, TrendDown, Warning } from "@phosphor-icons/react/dist/ssr";

interface Props {
  tauxRecouvrement: number | null; // %
  delaiMoyenPaiement: number | null; // jours
  nbFacturesEnRetard: number;
  montantTotalEnRetard: number;
}

function getColor(taux: number) {
  if (taux >= 90) return { label: "Excellente santé financière", color: "text-green-700", bg: "bg-green-50", border: "border-green-100" };
  if (taux >= 70) return { label: "Quelques impayés à surveiller", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100" };
  return { label: "Situation préoccupante, relancez vos clients", color: "text-red-700", bg: "bg-red-50", border: "border-red-100" };
}

export function SanteFinanciere({
  tauxRecouvrement,
  delaiMoyenPaiement,
  nbFacturesEnRetard,
  montantTotalEnRetard,
}: Props) {
  const taux = tauxRecouvrement ?? 0;
  const { label, color, bg, border } = getColor(taux);
  const hasData = tauxRecouvrement !== null;

  return (
    <div className={`rounded-2xl border p-5 lg:p-6 ${hasData ? `${bg} ${border}` : "bg-white border-dusk/8"}`}>
      <div className="flex items-center gap-2 mb-4">
        {hasData && taux >= 90 ? (
          <TrendUp size={20} className="text-green-600" weight="bold" />
        ) : hasData && taux >= 70 ? (
          <Warning size={20} className="text-orange-600" weight="bold" />
        ) : (
          <TrendDown size={20} className={hasData ? "text-red-600" : "text-dusk/40"} weight="bold" />
        )}
        <h2 className="font-display text-lg font-bold text-dusk">Santé financière</h2>
      </div>

      {!hasData ? (
        <p className="text-sm text-dusk/50">
          Initialisez le suivi des paiements sur vos chantiers pour voir votre taux de recouvrement.
        </p>
      ) : (
        <>
          {/* Taux */}
          <div className="mb-4">
            <div className="flex items-end gap-2 mb-1">
              <span className={`font-display text-4xl font-bold ${color}`}>{Math.round(taux)}%</span>
              <span className="text-xs text-dusk/50 mb-1.5">taux de recouvrement</span>
            </div>
            <div className="w-full bg-white/60 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${
                  taux >= 90 ? "bg-green-500" : taux >= 70 ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(taux, 100)}%` }}
              />
            </div>
            <p className={`text-xs font-medium mt-2 ${color}`}>{label}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-xs text-dusk/50 mb-0.5">Délai moyen paiement</p>
              <p className="text-lg font-bold text-dusk">
                {delaiMoyenPaiement !== null ? `${Math.round(delaiMoyenPaiement)} j` : "-"}
              </p>
            </div>
            <div className={`rounded-xl p-3 ${nbFacturesEnRetard > 0 ? "bg-red-100" : "bg-white/70"}`}>
              <p className="text-xs text-dusk/50 mb-0.5">Factures en retard</p>
              <p className={`text-lg font-bold ${nbFacturesEnRetard > 0 ? "text-red-700" : "text-dusk"}`}>
                {nbFacturesEnRetard}
              </p>
            </div>
            {montantTotalEnRetard > 0 && (
              <div className="col-span-2 bg-red-100 rounded-xl p-3">
                <p className="text-xs text-red-600 mb-0.5">Montant total en retard</p>
                <p className="text-lg font-bold text-red-700">
                  {montantTotalEnRetard.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
