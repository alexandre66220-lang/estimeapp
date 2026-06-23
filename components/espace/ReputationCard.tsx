import Link from "next/link";
import { TrendUp } from "@phosphor-icons/react/dist/ssr";
import { NIVEAUX, type ReputationScore } from "@/lib/score/reputation";

export function ReputationCard({ score }: { score: ReputationScore }) {
  const niveau = NIVEAUX[score.niveau];

  return (
    <Link
      href="/espace/score"
      className="block bg-dusk rounded-2xl p-6 lg:p-7 mb-10 hover:bg-dusk/90 transition-colors duration-200"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-dust/60">
          <TrendUp size={16} weight="bold" aria-hidden="true" />
          <span className="text-sm font-semibold">Score de réputation</span>
        </div>
        <span className="text-xs font-semibold text-dust bg-braise px-3 py-1 rounded-full">
          {niveau.label}
        </span>
      </div>

      <p className="font-display text-4xl font-bold text-dust leading-none mb-4">
        {score.total}
        <span className="text-dust/40 text-xl font-normal">/100</span>
      </p>

      <div className="h-2.5 rounded-full bg-dust/10 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-braise transition-all duration-300"
          style={{ width: `${score.total}%` }}
        />
      </div>

      <p className="text-dust/55 text-sm leading-relaxed">{niveau.message}</p>
    </Link>
  );
}
