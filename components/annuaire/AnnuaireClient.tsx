"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MagnifyingGlass, Funnel, ArrowsDownUp } from "@phosphor-icons/react";
import { getMetiersSuggestions, getVillesSuggestions } from "@/app/actions/annuaire";

const METIERS = [
  "Peintre", "Plombier", "Électricien", "Maçon", "Carreleur",
  "Couvreur", "Menuisier", "Plaquiste", "Chauffagiste", "Autre",
];

const TRI_OPTIONS = [
  { value: "note", label: "Meilleure note" },
  { value: "anciennete", label: "Ancienneté Estime" },
];

function SuggestInput({
  value,
  onChange,
  placeholder,
  getSuggestions,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  getSuggestions: (q: string) => Promise<string[]>;
  icon: React.ReactNode;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (value.length < 2) { setSuggestions([]); return; }
    timer.current = setTimeout(async () => {
      const s = await getSuggestions(value);
      setSuggestions(s);
      setOpen(s.length > 0);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [value, getSuggestions]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative flex-1 min-w-0">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#2B3138]/35">
        {icon}
      </div>
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#2B3138]/12 bg-white text-sm text-[#2B3138] placeholder:text-[#2B3138]/35
          focus:outline-none focus:ring-2 focus:ring-[#C75D3B]/20 focus:border-[#C75D3B]/40 transition-all"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-[#2B3138]/10 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onChange(s); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-[#2B3138] hover:bg-[#F2EDE4] transition-colors"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AnnuaireSearchBar({ defaultMetier = "", defaultVille = "" }: { defaultMetier?: string; defaultVille?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [metier, setMetier] = useState(defaultMetier);
  const [ville, setVille] = useState(defaultVille);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (metier) params.set("metier", metier);
    if (ville) params.set("ville", ville);
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl mx-auto">
      <SuggestInput
        value={metier}
        onChange={setMetier}
        placeholder="Métier (peintre, plombier…)"
        getSuggestions={getMetiersSuggestions}
        icon={<MagnifyingGlass size={16} />}
      />
      <SuggestInput
        value={ville}
        onChange={setVille}
        placeholder="Ville"
        getSuggestions={getVillesSuggestions}
        icon={<MagnifyingGlass size={16} />}
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-3 rounded-xl bg-[#C75D3B] text-white text-sm font-semibold hover:bg-[#B8552E] transition-colors shrink-0 disabled:opacity-60"
      >
        {isPending ? "…" : "Rechercher"}
      </button>
    </form>
  );
}

export function AnnuaireFilters({
  defaultMetier = "",
  defaultVille = "",
  defaultDisponible = false,
  defaultTri = "note",
}: {
  defaultMetier?: string;
  defaultVille?: string;
  defaultDisponible?: boolean;
  defaultTri?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | boolean | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "" || value === false) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-[#2B3138]/50">
        <Funnel size={13} />
        Filtres
      </div>

      {/* Métier select */}
      <select
        defaultValue={defaultMetier}
        onChange={(e) => updateParam("metier", e.target.value)}
        className="text-sm border border-[#2B3138]/12 rounded-lg px-3 py-1.5 bg-white text-[#2B3138] focus:outline-none focus:ring-2 focus:ring-[#C75D3B]/20"
      >
        <option value="">Tous les métiers</option>
        {METIERS.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>

      {/* Disponible toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <div
          onClick={() => updateParam("dispo", defaultDisponible ? null : true)}
          className={`w-9 h-5 rounded-full transition-colors relative ${defaultDisponible ? "bg-[#22C55E]" : "bg-[#2B3138]/15"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${defaultDisponible ? "translate-x-4" : "translate-x-0.5"}`} />
        </div>
        <span className="text-sm text-[#2B3138]/70">Disponible</span>
      </label>

      {/* Tri */}
      <div className="flex items-center gap-1.5 ml-auto">
        <ArrowsDownUp size={13} className="text-[#2B3138]/40" />
        <select
          defaultValue={defaultTri}
          onChange={(e) => updateParam("tri", e.target.value)}
          className="text-sm border border-[#2B3138]/12 rounded-lg px-3 py-1.5 bg-white text-[#2B3138] focus:outline-none focus:ring-2 focus:ring-[#C75D3B]/20"
        >
          {TRI_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export function AnnuairePagination({ total, page, perPage }: { total: number; page: number; perPage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 rounded-lg border border-[#2B3138]/12 text-sm text-[#2B3138] disabled:opacity-30 hover:bg-[#F2EDE4] transition-colors"
      >
        ← Précédent
      </button>
      <span className="text-sm text-[#2B3138]/50 px-2">
        Page {page} / {totalPages}
      </span>
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 rounded-lg border border-[#2B3138]/12 text-sm text-[#2B3138] disabled:opacity-30 hover:bg-[#F2EDE4] transition-colors"
      >
        Suivant →
      </button>
    </div>
  );
}
