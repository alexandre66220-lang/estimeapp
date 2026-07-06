"use client";

import type { RangLocal } from "@/lib/score/rang-local";

const SCOPE_LABEL: Record<string, string> = {
  local: "dans votre ville",
  national: "au niveau national",
  pioneer: "pionnier",
};

function getBadge(percentile: number, scope: string) {
  if (scope === "pioneer") {
    return { label: "Pionnier", bg: "bg-ambre/15", text: "text-ambre", emoji: "🌱" };
  }
  if (percentile >= 80) {
    return { label: "Top 20 %", bg: "bg-yellow-50", text: "text-yellow-700", emoji: "🥇" };
  }
  if (percentile >= 50) {
    return { label: "Top 50 %", bg: "bg-gray-100", text: "text-gray-600", emoji: "🥈" };
  }
  return { label: "En progression", bg: "bg-orange-50", text: "text-orange-700", emoji: "🥉" };
}

export function RangLocalCard({ rang }: { rang: RangLocal }) {
  const badge = getBadge(rang.percentile, rang.scope);

  if (rang.scope === "pioneer") {
    return (
      <div className="bg-white rounded-2xl border border-dusk/8 p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🌱</span>
          <div>
            <p className="font-display text-base font-bold text-dusk">Score comparatif</p>
            <p className="text-xs text-dusk/45">Vous êtes parmi les premiers dans votre domaine !</p>
          </div>
        </div>
        <p className="text-sm text-dusk/60">
          Pas encore assez d&apos;artisans comparables. Votre rang apparaîtra dès que d&apos;autres artisans rejoignent Estime.
        </p>
      </div>
    );
  }

  const barWidth = Math.max(4, Math.min(100, rang.percentile));

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-5 lg:p-6">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <p className="text-xs text-dusk/45 mb-0.5">Score comparatif</p>
          <p className="font-display text-2xl font-bold text-dusk">
            #{rang.rang}
            <span className="text-sm font-normal text-dusk/45 ml-1">/ {rang.nb_total}</span>
          </p>
          <p className="text-xs text-dusk/50 mt-0.5">{SCOPE_LABEL[rang.scope]}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
          {badge.emoji} {badge.label}
        </span>
      </div>

      <div className="w-full bg-dusk/8 rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full bg-braise transition-all duration-500"
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-dusk/40">
        <span>Mieux que {Math.round(rang.percentile)} % des artisans</span>
        <span>Moy. {Math.round(rang.score_moyen)} pts</span>
      </div>
    </div>
  );
}
