"use client";

import { useRouter, usePathname } from "next/navigation";
import type { ConseilMetier } from "@/lib/sanity/queries";

type MetierOption = { value: ConseilMetier | "general"; label: string };

export function ConseilsMetierFilter({
  metiers,
  active,
}: {
  metiers: MetierOption[];
  active: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function select(value: string) {
    const params = new URLSearchParams();
    if (value !== "general") params.set("metier", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-none">
      {metiers.map((m) => (
        <button
          key={m.value}
          onClick={() => select(m.value)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === m.value
              ? "bg-braise text-white"
              : "bg-white border border-dusk/10 text-dusk/60 hover:border-dusk/25 hover:text-dusk"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
