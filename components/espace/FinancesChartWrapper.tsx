"use client";

import type React from "react";
import dynamic from "next/dynamic";
import type { MonthlyData } from "@/lib/supabase/finances";

const FinancesChart = dynamic<React.ComponentProps<typeof import("./FinancesChart").FinancesChart>>(
  () => import("./FinancesChart").then((m) => m.FinancesChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[220px] bg-dust rounded-xl animate-pulse" />
    ),
  }
);

export function FinancesChartWrapper({
  data,
  currentMonth,
}: {
  data: MonthlyData[];
  currentMonth: string;
}) {
  return <FinancesChart data={data} currentMonth={currentMonth} />;
}
