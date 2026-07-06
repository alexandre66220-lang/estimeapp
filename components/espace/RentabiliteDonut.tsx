"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#C75D3B", "#D4956B", "#8B6F5E", "#B5A99A"];

type DonutData = { name: string; value: number };

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; percent: number }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-dusk/8 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-dusk">{item.name}</p>
      <p className="text-dusk/60">{item.value.toLocaleString("fr-FR")} € · {(item.percent * 100).toFixed(0)}%</p>
    </div>
  );
}

export function RentabiliteDonut({ data }: { data: DonutData[] }) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={filtered}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {filtered.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="text-xs text-dusk/70">{value}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
