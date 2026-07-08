"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

interface FaqItem {
  question: string;
  reponse: string;
}

export function FaqAccordion({
  items,
  couleur,
}: {
  items: FaqItem[];
  couleur: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#2B2521]/6 overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            aria-expanded={open === i}
          >
            <span className="text-sm font-semibold text-[#2B2521]">{item.question}</span>
            <CaretDown
              size={16}
              className="shrink-0 text-[#2B2521]/40 transition-transform duration-300"
              style={{
                transform: open === i ? "rotate(-180deg)" : "rotate(0deg)",
                color: open === i ? couleur : undefined,
              }}
            />
          </button>
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: open === i ? "600px" : "0px" }}
          >
            <p className="px-5 pb-4 text-sm text-[#2B2521]/65 leading-relaxed">
              {item.reponse}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
