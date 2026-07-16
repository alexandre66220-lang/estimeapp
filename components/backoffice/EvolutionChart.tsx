"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

function fmt(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k€`;
  return `${v}€`;
}

function moisLabel(iso: string) {
  const [y, m] = iso.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("fr-FR", { month: "short" });
}

export function EvolutionChart({
  data,
  series,
}: {
  data: Record<string, number | string>[];
  series: { key: string; label: string; color: string }[];
}) {
  const formatted = data.map((d) => ({ ...d, label: moisLabel(String(d.mois)) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={formatted} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#55555A" }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={fmt}
          tick={{ fontSize: 10, fill: "#55555A" }}
          axisLine={false}
          tickLine={false}
          width={42}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{ background: "#18181B", border: "1px solid #232326", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#EDEDED" }}
          formatter={(value) => `${Number(value).toLocaleString("fr-FR")} €`}
        />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#8B8B8D" }} />}
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[5, 5, 0, 0]} maxBarSize={32} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
