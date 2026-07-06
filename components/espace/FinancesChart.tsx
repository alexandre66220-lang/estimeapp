"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import type { MonthlyData } from "@/lib/supabase/finances";

function fmt(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k€`;
  return `${v}€`;
}

export function FinancesChart({
  data,
  currentMonth,
}: {
  data: MonthlyData[];
  currentMonth: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tickFormatter={fmt}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={42}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)", radius: 6 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as MonthlyData;
            return (
              <div className="bg-white border border-dusk/10 rounded-xl px-4 py-3 shadow-xl text-sm">
                <p className="font-semibold text-dusk mb-1">{label}</p>
                <p className="text-braise font-bold text-base">
                  {d.ca.toLocaleString("fr-FR")} €
                </p>
                <p className="text-dusk/50 text-xs mt-0.5">
                  {d.count} chantier{d.count > 1 ? "s" : ""}
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="ca" radius={[5, 5, 0, 0]} maxBarSize={40}>
          {data.map((entry) => (
            <Cell
              key={entry.month}
              fill={entry.month === currentMonth ? "#C75D3B" : "#e5e7eb"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
