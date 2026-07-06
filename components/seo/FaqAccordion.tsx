"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/seo/faq";

export function FaqAccordion({
  items,
  title = "Questions fréquentes",
}: {
  items: FaqItem[];
  title?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mt-12">
      <h2
        className="font-landing-display text-2xl font-semibold mb-6"
        style={{ color: "#2B2521" }}
      >
        {title}
      </h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid #E8E2DC", background: "#ffffff" }}
          >
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
              aria-expanded={open === i}
            >
              <span className="font-medium text-sm leading-snug" style={{ color: "#2B2521" }}>
                {item.q}
              </span>
              <span
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-200"
                style={{
                  background: open === i ? "#C75D3B" : "#F0ECE8",
                  color: open === i ? "#ffffff" : "#2B2521",
                  transform: open === i ? "rotate(45deg)" : "none",
                }}
                aria-hidden="true"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            {open === i && (
              <div
                className="px-5 pb-4 text-sm leading-relaxed"
                style={{ color: "#5C5248", borderTop: "1px solid #F0ECE8" }}
              >
                <p className="pt-3">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Variante dark pour la landing page (fond charcoal)
export function FaqAccordionDark({ items, title = "Questions fréquentes" }: { items: FaqItem[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section>
      <h2 className="font-landing-display text-2xl lg:text-3xl font-semibold text-dust text-center mb-8">
        {title}
      </h2>
      <div className="space-y-2 max-w-2xl mx-auto">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(248,245,242,0.1)", background: "rgba(248,245,242,0.05)" }}
          >
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open === i}
            >
              <span className="font-medium text-sm leading-snug" style={{ color: "#F8F5F2" }}>
                {item.q}
              </span>
              <span
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-200"
                style={{
                  background: open === i ? "#C75D3B" : "rgba(248,245,242,0.1)",
                  color: "#ffffff",
                  transform: open === i ? "rotate(45deg)" : "none",
                }}
                aria-hidden="true"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: "rgba(248,245,242,0.6)", borderTop: "1px solid rgba(248,245,242,0.08)" }}>
                <p className="pt-3">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
