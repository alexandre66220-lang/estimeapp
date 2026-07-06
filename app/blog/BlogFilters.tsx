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

export function BlogFilters({
  articles,
  tagColors,
}: {
  articles: ArticleConseil[];
  tagColors: Record<string, string>;
}) {
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
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              active === m.value
                ? "bg-[#2B2521] text-[#F8F5F2]"
                : "bg-[#2B2521]/8 text-[#2B2521]/65 hover:bg-[#2B2521]/15"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-[#2B2521]/40 text-center py-16">
          Aucun article pour ce métier pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article) => (
            <ArticleCard key={article._id} article={article} tagColors={tagColors} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({
  article,
  tagColors,
}: {
  article: ArticleConseil;
  tagColors: Record<string, string>;
}) {
  const slug = article.slug.current;
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
      className="group block bg-white border border-[#2B2521]/8 rounded-2xl p-5 hover:shadow-md hover:border-[#2B2521]/15 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            tagColors[article.categorie] ?? "bg-[#2B2521]/8 text-[#2B2521]"
          }`}
        >
          {article.categorie}
        </span>
        <span className="text-xs text-[#2B2521]/35">{article.temps_lecture} min</span>
      </div>
      <h3 className="font-semibold text-[#2B2521] text-sm leading-snug mb-2 group-hover:text-[#C75D3B] transition-colors line-clamp-2">
        {article.titre}
      </h3>
      {article.resume && (
        <p className="text-[#2B2521]/50 text-xs leading-relaxed line-clamp-3">{article.resume}</p>
      )}
      {date && <p className="text-[#2B2521]/30 text-xs mt-3">{date}</p>}
    </Link>
  );
}
