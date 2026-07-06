"use client";

import { useState, useEffect, useTransition } from "react";
import { Clock, Lightbulb, X } from "@phosphor-icons/react";
import type { Conseil, ConseilTag, ConseilsContenu } from "@/app/api/conseils/generer/route";
import { addPointsFidelite } from "@/app/actions/fidelite";

const TAG_COLORS: Record<ConseilTag, string> = {
  Technique: "bg-blue-50 text-blue-700 border-blue-100",
  Marketing: "bg-purple-50 text-purple-700 border-purple-100",
  Gestion: "bg-amber-50 text-amber-700 border-amber-100",
  Réputation: "bg-green-50 text-green-700 border-green-100",
  Sécurité: "bg-red-50 text-red-700 border-red-100",
};

const ALL_TAGS: ConseilTag[] = ["Technique", "Marketing", "Gestion", "Réputation", "Sécurité"];
const POINTS_KEY = "conseils_points_today";

function tagBadge(tag: ConseilTag) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${TAG_COLORS[tag] ?? "bg-dust text-dusk border-dusk/10"}`}>
      {tag}
    </span>
  );
}

function ConseilModal({ conseil, onClose }: { conseil: Conseil; onClose: () => void }) {
  useEffect(() => {
    // Award read points (max 10/day)
    const today = new Date().toISOString().slice(0, 10);
    const stored = JSON.parse(localStorage.getItem(POINTS_KEY) ?? "{}");
    const todayPoints = stored[today] ?? 0;
    if (todayPoints < 10) {
      addPointsFidelite("chantier_cree").catch(() => {});
      stored[today] = todayPoints + 2;
      localStorage.setItem(POINTS_KEY, JSON.stringify(stored));
    }

    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 pt-5 pb-3 border-b border-dusk/6">
          <div className="flex items-center gap-2">
            {tagBadge(conseil.tag)}
            <span className="text-xs text-dusk/40 flex items-center gap-1">
              <Clock size={10} /> {conseil.lecture_min} min
            </span>
          </div>
          <button type="button" onClick={onClose} className="text-dusk/30 hover:text-dusk/60 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">
          <h2 className="font-display text-xl font-bold text-dusk mb-4">{conseil.titre}</h2>
          <div className="text-dusk/70 text-sm leading-relaxed space-y-3 whitespace-pre-wrap">
            {conseil.contenu}
          </div>
        </div>
      </div>
    </div>
  );
}

function VedetteCard({ conseil, onClick }: { conseil: Conseil; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-dusk rounded-2xl p-6 lg:p-8 hover:bg-dusk/90 transition-colors group"
    >
      <div className="flex items-center gap-2 mb-3">
        {tagBadge(conseil.tag)}
        <span className="text-xs text-white/40 flex items-center gap-1">
          <Clock size={10} /> {conseil.lecture_min} min de lecture
        </span>
      </div>
      <h2 className="font-display text-xl lg:text-2xl font-bold text-white mb-3 leading-tight">
        {conseil.titre}
      </h2>
      <p className="text-white/60 text-sm leading-relaxed mb-4">{conseil.resume}</p>
      <span className="text-[#C75D3B] text-sm font-semibold group-hover:underline">
        Lire le conseil →
      </span>
    </button>
  );
}

function ConseilCard({ conseil, onClick }: { conseil: Conseil; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-dusk/8 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
    >
      <div className="flex items-center gap-2 mb-3">
        {tagBadge(conseil.tag)}
        <span className="text-xs text-dusk/40 flex items-center gap-1 ml-auto">
          <Clock size={10} /> {conseil.lecture_min} min
        </span>
      </div>
      <h3 className="font-semibold text-dusk text-sm mb-2 leading-snug group-hover:text-[#C75D3B] transition-colors">
        {conseil.titre}
      </h3>
      <p className="text-dusk/55 text-xs leading-relaxed flex-1">{conseil.resume}</p>
      <span className="text-[#C75D3B] text-xs font-medium mt-3 group-hover:underline">Lire →</span>
    </button>
  );
}

export function ConseilsView({ initialContenu, metier, ville }: {
  initialContenu: ConseilsContenu | null;
  metier: string | null;
  ville: string | null;
}) {
  const [contenu, setContenu] = useState<ConseilsContenu | null>(initialContenu);
  const [loading, setLoading] = useState(!initialContenu);
  const [hasError, setHasError] = useState(false);
  const [activeTag, setActiveTag] = useState<ConseilTag | "Tous">("Tous");
  const [openConseil, setOpenConseil] = useState<Conseil | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!initialContenu || isStale(initialContenu.generated_at)) {
      generate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isStale(ts: string) {
    return Date.now() - new Date(ts).getTime() > 7 * 24 * 3600 * 1000;
  }

  async function generate() {
    setLoading(true);
    setHasError(false);
    try {
      const res = await fetch("/api/conseils/generer", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.contenu) {
          setContenu(json.contenu);
        } else {
          setHasError(true);
        }
      } else {
        setHasError(true);
      }
    } catch {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }

  const filteredConseils = contenu?.conseils.filter(
    (c) => activeTag === "Tous" || c.tag === activeTag
  ) ?? [];

  if (loading && !contenu) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-dusk/50 text-sm mb-2">
          <svg className="animate-spin w-4 h-4 text-[#C75D3B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Génération de vos conseils personnalisés…
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-48 bg-dusk/8 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-36 bg-white rounded-2xl border border-dusk/8" />)}
          </div>
        </div>
      </div>
    );
  }

  if (hasError && !contenu) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-dusk/50 text-sm mb-4">Impossible de charger les conseils. Réessayez.</p>
        <button
          onClick={generate}
          className="px-5 py-2.5 rounded-full bg-[#C75D3B] text-white text-sm font-semibold hover:bg-[#B8552E] transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!contenu) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">✨</p>
        <p className="text-dusk/50 text-sm">Aucun conseil disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <>
      {/* Conseil vedette */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display text-lg font-bold text-dusk">Conseil de la semaine</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#C75D3B]/10 text-[#C75D3B] font-medium border border-[#C75D3B]/15">
            Mis à jour cette semaine
          </span>
        </div>
        <VedetteCard conseil={contenu.vedette} onClick={() => setOpenConseil(contenu.vedette)} />
      </section>

      {/* Filtres tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(["Tous", ...ALL_TAGS] as const).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeTag === tag
                ? "bg-dusk text-white border-transparent"
                : "bg-white text-dusk/60 border-dusk/12 hover:border-dusk/25"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grille conseils */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConseils.map((c) => (
            <ConseilCard key={c.id} conseil={c} onClick={() => setOpenConseil(c)} />
          ))}
          {filteredConseils.length === 0 && (
            <div className="col-span-full text-center py-10 text-dusk/40 text-sm">
              Aucun conseil pour ce filtre.
            </div>
          )}
        </div>
      </section>

      {/* Astuces rapides */}
      {contenu.astuces.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-dusk mb-4 flex items-center gap-2">
            <Lightbulb size={20} weight="fill" className="text-[#C75D3B]" aria-hidden="true" />
            Astuces rapides
          </h2>
          <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/6">
            {contenu.astuces.map((astuce, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <span className="text-[#C75D3B] font-bold text-sm shrink-0">{i + 1}.</span>
                <p className="text-sm text-dusk/75">{astuce}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {openConseil && (
        <ConseilModal conseil={openConseil} onClose={() => setOpenConseil(null)} />
      )}
    </>
  );
}
