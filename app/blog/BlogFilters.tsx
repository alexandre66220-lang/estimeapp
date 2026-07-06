"use client";

import { useState } from "react";
import Link from "next/link";
import type { ArticleConseil } from "@/lib/sanity/queries";

const METIERS = [
  { value: "general", label: "Tous" },
  { value: "peintre", label: "Peintre" },
  { value: "plombier", label: "Plombier" },
  { value: "electricien", label: "Électricien" },
  { value: "macon", label: "Maçon" },
  { value: "carreleur", label: "Carreleur" },
  { value: "couvreur", label: "Couvreur" },
  { value: "menuisier", label: "Menuisier" },
  { value: "general_only", label: "Général" },
] as const;

// Badge colors per category — solid hex to bypass dark-mode CSS overrides
const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Technique:  { bg: "#2D6A8F", text: "#ffffff" },
  Marketing:  { bg: "#2D7A4F", text: "#ffffff" },
  Gestion:    { bg: "#6B4F9E", text: "#ffffff" },
  Réputation: { bg: "#C75D3B", text: "#ffffff" },
  Sécurité:   { bg: "#B03A2E", text: "#ffffff" },
};

export function BlogFilters({ articles }: { articles: ArticleConseil[] }) {
  const [active, setActive] = useState("general");

  const filtered =
    active === "general"
      ? articles
      : articles.filter(
          (a) => a.metier.includes(active as never) || a.metier.includes("general" as never)
        );

  return (
    <div>
      {/* Pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        {METIERS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setActive(m.value)}
            style={
              active === m.value
                ? { background: "#C75D3B", color: "#ffffff", borderColor: "#C75D3B" }
                : { background: "#ffffff", color: "#2B2521", borderColor: "#E8E2DC" }
            }
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 hover:border-[#C75D3B]"
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p style={{ color: "#8A7E76" }} className="text-center py-16 text-sm">
          Aucun article pour ce métier pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article }: { article: ArticleConseil }) {
  const slug = article.slug.current;
  const badge = BADGE_COLORS[article.categorie];
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ background: "#ffffff", border: "1px solid #E8E2DC" }}
    >
      <div className="p-5 flex flex-col flex-1">
        {/* Badge + durée */}
        <div className="flex items-center justify-between mb-3">
          {badge ? (
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: badge.bg, color: badge.text }}
            >
              {article.categorie}
            </span>
          ) : (
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: "#E8E2DC", color: "#2B2521" }}
            >
              {article.categorie}
            </span>
          )}
          <span className="text-xs" style={{ color: "#8A7E76" }}>
            {article.temps_lecture} min
          </span>
        </div>

        {/* Titre */}
        <h3
          className="font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#C75D3B] transition-colors"
          style={{ color: "#2B2521" }}
        >
          {article.titre}
        </h3>

        {/* Résumé */}
        {article.resume && (
          <p className="text-xs leading-relaxed line-clamp-3 flex-1" style={{ color: "#5C5248" }}>
            {article.resume}
          </p>
        )}

        {/* Date + lien */}
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #F0ECE8" }}>
          {date && (
            <span className="text-xs" style={{ color: "#8A7E76" }}>
              {date}
            </span>
          )}
          <span
            className="text-xs font-semibold ml-auto"
            style={{ color: "#C75D3B" }}
          >
            Lire →
          </span>
        </div>
      </div>
    </Link>
  );
}
