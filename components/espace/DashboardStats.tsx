import type { DashboardStats } from "@/lib/supabase/dashboard-stats";

const STAT_CARDS: {
  key: keyof DashboardStats;
  emoji: string;
  label: string;
}[] = [
  { key: "totalChantiers", emoji: "🏗️", label: "Chantiers total" },
  { key: "totalPosts", emoji: "📸", label: "Posts générés" },
  { key: "totalEmails", emoji: "📧", label: "Emails envoyés" },
  { key: "chantiersCeMois", emoji: "📅", label: "Chantiers ce mois" },
  { key: "noteMoyenne", emoji: "⭐", label: "Note moyenne" },
  { key: "tauxConversion", emoji: "📈", label: "Taux de conversion" },
];

export function DashboardStatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
      {STAT_CARDS.map(({ key, emoji, label }) => (
        <div
          key={key}
          className="bg-white rounded-2xl border border-dusk/8 p-5 lg:p-6"
        >
          <span className="text-2xl" aria-hidden="true">
            {emoji}
          </span>
          <p className="font-display text-3xl font-bold text-dusk leading-none mt-3">
            {key === "noteMoyenne"
              ? stats.noteMoyenne !== null
                ? stats.noteMoyenne.toFixed(1)
                : "—"
              : key === "tauxConversion"
                ? stats.tauxConversion !== null
                  ? `${stats.tauxConversion}%`
                  : "—"
                : stats[key]}
          </p>
          <p className="text-dusk/45 text-xs mt-1.5">{label}</p>
        </div>
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-dusk/8 p-5 lg:p-6"
        >
          <div className="w-8 h-8 bg-dust rounded-lg mb-3" />
          <div className="h-8 w-12 bg-dust rounded mb-2" />
          <div className="h-3 w-20 bg-dust rounded" />
        </div>
      ))}
    </div>
  );
}
