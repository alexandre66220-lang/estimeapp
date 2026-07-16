"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { PeriodeCle } from "@/lib/backoffice/periode";

const OPTIONS: { value: PeriodeCle; label: string }[] = [
  { value: "mois", label: "Mois en cours" },
  { value: "mois_precedent", label: "Mois précédent" },
  { value: "annee", label: "Année en cours" },
  { value: "custom", label: "Personnalisé" },
];

export function PeriodeSelector({ periodeActuelle }: { periodeActuelle: PeriodeCle }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setPeriode(value: string, debut?: string, fin?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periode", value);
    if (debut) params.set("debut", debut);
    if (fin) params.set("fin", fin);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1 bg-[#18181B] border border-[#232326] rounded-md p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setPeriode(o.value)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors duration-150 ${
              periodeActuelle === o.value
                ? "bg-[#4ADE80]/10 text-[#4ADE80]"
                : "text-[#8B8B8D] hover:text-[#EDEDED]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {periodeActuelle === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            defaultValue={searchParams.get("debut") ?? ""}
            onChange={(e) => setPeriode("custom", e.target.value, searchParams.get("fin") ?? e.target.value)}
            className="bg-[#0C0C0D] border border-[#232326] rounded-md px-2 py-1 text-xs text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
          />
          <span className="text-xs text-[#55555A]">→</span>
          <input
            type="date"
            defaultValue={searchParams.get("fin") ?? ""}
            onChange={(e) => setPeriode("custom", searchParams.get("debut") ?? e.target.value, e.target.value)}
            className="bg-[#0C0C0D] border border-[#232326] rounded-md px-2 py-1 text-xs text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
          />
        </div>
      )}
    </div>
  );
}
