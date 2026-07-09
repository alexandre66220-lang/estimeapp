"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Camera,
  Trash,
  FloppyDisk,
  Sparkle,
  Copy,
  Check,
  InstagramLogo,
  FacebookLogo,
  TiktokLogo,
  ShieldCheck,
  Link as LinkIcon,
  Globe,
} from "@phosphor-icons/react";
import { t, type Lang } from "@/lib/i18n/dict";
import {
  deletePhotoProfil,
  savePresentation,
  genererPresentation,
  saveCertifications,
  saveExperienceStatut,
  saveReseaux,
  saveSiret,
  checkSlugDisponible,
  saveSlugPersonnalise,
  saveTheme,
  saveLangue,
} from "@/app/actions/profil-enrichi";
import { ThemeToggle } from "@/components/espace/ThemeToggle";
import { DynamicManifest } from "@/components/DynamicManifest";

const VALID_THEMES = ["#C75D3B", "#385144", "#2D4A6B", "#7B2D3E", "#C8922A", "#3D3D3D"] as const;
const VALID_CERTIFS = [
  "RGE", "Qualibat", "Qualipac", "Qualibois",
  "Handibat", "Label RAGE", "Assurance décennale", "Auto-entrepreneur certifié",
];
const STATUTS = [
  { value: "disponible", emoji: "🟢" },
  { value: "en_chantier", emoji: "🟠" },
  { value: "complet", emoji: "🔴" },
] as const;

export type ProfilEnrichiData = {
  photo_profil: string | null;
  photoUrl: string | null;
  presentation: string | null;
  certifications: string[];
  annees_experience: number | null;
  statut_disponibilite: string;
  statut_jusqu_au: string | null;
  liens_sociaux: { instagram?: string; facebook?: string; tiktok?: string };
  numero_siret: string | null;
  slug: string | null;
  slug_personnalise: string | null;
  theme_couleur: string;
  langue_interface: string;
  theme_mode: string;
  metier: string | null;
  ville: string | null;
  prenom: string | null;
  nom: string | null;
};

type SaveState = "idle" | "saving" | "saved" | "error";

function useSave() {
  const [state, setState] = useState<SaveState>("idle");
  const save = useCallback(async (fn: () => Promise<{ error?: string }>) => {
    setState("saving");
    const res = await fn();
    if (res.error) { setState("error"); setTimeout(() => setState("idle"), 3000); }
    else { setState("saved"); setTimeout(() => setState("idle"), 2000); }
  }, []);
  return { state, save };
}

function SaveBtn({ state, lang }: { state: SaveState; lang: Lang }) {
  return (
    <button
      type="submit"
      disabled={state === "saving"}
      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all
        bg-[var(--color-accent,#C75D3B)] text-white hover:opacity-90 disabled:opacity-50"
    >
      {state === "saving" && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {state === "saved" && <Check size={14} weight="bold" />}
      {state === "saving" ? t(lang, "saving") : state === "saved" ? t(lang, "saved") : t(lang, "save")}
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 max-w-2xl">
      <h2 className="font-display text-lg font-bold text-dusk mb-5">{title}</h2>
      {children}
    </div>
  );
}

// ── Photo ─────────────────────────────────────────────────────────────────────

function PhotoSection({ data, lang }: { data: ProfilEnrichiData; lang: Lang }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(data.photoUrl);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = [data.prenom?.[0], data.nom?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/profil/photo", { method: "POST", body: fd });
    if (res.ok) {
      const preview = URL.createObjectURL(file);
      setPhotoUrl(preview);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete() {
    setDeleting(true);
    await deletePhotoProfil();
    setPhotoUrl(null);
    setDeleting(false);
  }

  return (
    <SectionCard title={t(lang, "photo")}>
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative w-24 h-24 rounded-full overflow-hidden bg-dust border-2 border-dusk/10 hover:border-[var(--color-accent,#C75D3B)] transition-colors shrink-0 group"
          aria-label={t(lang, "photo")}
        >
          {photoUrl ? (
            <Image src={photoUrl} alt="Photo de profil" fill className="object-cover" unoptimized />
          ) : (
            <span className="text-2xl font-bold text-dusk/40">{initials}</span>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={20} className="text-white" />
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-dusk/50 mb-3">{t(lang, "photoHint")}</p>
          {photoUrl && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              <Trash size={14} />
              {t(lang, "photoDelete")}
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </SectionCard>
  );
}

// ── Présentation ──────────────────────────────────────────────────────────────

function PresentationSection({ data, lang }: { data: ProfilEnrichiData; lang: Lang }) {
  const [text, setText] = useState(data.presentation ?? "");
  const [generating, setGenerating] = useState(false);
  const { state, save } = useSave();

  async function handleGenerate() {
    setGenerating(true);
    const res = await genererPresentation({
      metier: data.metier,
      ville: data.ville,
      anneeDebut: data.annees_experience,
    });
    if (res.presentation) setText(res.presentation);
    setGenerating(false);
  }

  return (
    <SectionCard title={t(lang, "presentation")}>
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          placeholder={t(lang, "presentationPlaceholder")}
          rows={4}
          className="w-full rounded-xl border border-dusk/15 bg-dust/40 px-4 py-3 text-sm text-dusk placeholder:text-dusk/35
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C75D3B)]/25 resize-none"
        />
        <span className="absolute bottom-2.5 right-3 text-xs text-dusk/35">{text.length}/500</span>
      </div>
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent,#C75D3B)] hover:opacity-80 disabled:opacity-50"
        >
          {generating
            ? <><span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />{t(lang, "presentationGenerating")}</>
            : <><Sparkle size={15} weight="fill" />{t(lang, "presentationGenerate")}</>
          }
        </button>
        <form action={() => save(() => savePresentation(text))} className="ml-auto">
          <SaveBtn state={state} lang={lang} />
        </form>
      </div>
    </SectionCard>
  );
}

// ── Certifications ────────────────────────────────────────────────────────────

function CertificationsSection({ data, lang }: { data: ProfilEnrichiData; lang: Lang }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(data.certifications));
  const [custom, setCustom] = useState("");
  const { state, save } = useSave();

  function toggle(c: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }

  function addCustom() {
    const v = custom.trim();
    if (!v || v.length > 100) return;
    setSelected((prev) => new Set([...prev, v]));
    setCustom("");
  }

  const allCerts = [...selected].filter((c) => !VALID_CERTIFS.includes(c));

  return (
    <SectionCard title={t(lang, "certifications")}>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {VALID_CERTIFS.map((c) => (
          <label key={c} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.has(c)}
              onChange={() => toggle(c)}
              className="rounded accent-[var(--color-accent,#C75D3B)]"
            />
            <span className="text-sm text-dusk">{c}</span>
          </label>
        ))}
      </div>
      {allCerts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {allCerts.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-dust text-xs text-dusk">
              {c}
              <button type="button" onClick={() => toggle(c)} className="ml-1 hover:text-red-500">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={t(lang, "certCustom")}
          maxLength={100}
          className="flex-1 rounded-xl border border-dusk/15 bg-dust/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C75D3B)]/25"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-4 py-2 rounded-xl bg-dust text-sm font-medium text-dusk hover:bg-dusk/10"
        >
          {t(lang, "certAdd")}
        </button>
      </div>
      <form action={() => save(() => saveCertifications([...selected]))}>
        <SaveBtn state={state} lang={lang} />
      </form>
    </SectionCard>
  );
}

// ── Expérience & Statut ───────────────────────────────────────────────────────

function ExperienceStatutSection({ data, lang }: { data: ProfilEnrichiData; lang: Lang }) {
  const currentYear = new Date().getFullYear();
  const [anneeDebut, setAnneeDebut] = useState<number | null>(data.annees_experience);
  const [statut, setStatut] = useState(data.statut_disponibilite || "disponible");
  const [jusquAu, setJusquAu] = useState(data.statut_jusqu_au ?? "");
  const { state, save } = useSave();

  const years = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i);
  const exp = anneeDebut ? currentYear - anneeDebut : null;

  return (
    <SectionCard title={`${t(lang, "experience")} · ${t(lang, "statut")}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-1.5">{t(lang, "experience")}</label>
          <div className="flex items-center gap-3">
            <select
              value={anneeDebut ?? ""}
              onChange={(e) => setAnneeDebut(e.target.value ? Number(e.target.value) : null)}
              className="rounded-xl border border-dusk/15 bg-dust/40 px-3 py-2.5 text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C75D3B)]/25"
            >
              <option value="">-</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            {exp !== null && (
              <span className="text-sm text-dusk/50">
                {exp} an{exp > 1 ? "s" : ""} · {t(lang, "experienceHint")}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-dusk/60 mb-2">{t(lang, "statut")}</label>
          <div className="flex flex-wrap gap-2">
            {STATUTS.map(({ value, emoji }) => {
              const label = value === "disponible" ? t(lang, "statutDisponible")
                : value === "en_chantier" ? t(lang, "statutEnChantier")
                : t(lang, "statutComplet");
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatut(value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    statut === value
                      ? "bg-[var(--color-accent,#C75D3B)] text-white border-transparent"
                      : "bg-dust text-dusk border-dusk/10 hover:border-dusk/20"
                  }`}
                >
                  {emoji} {label}
                </button>
              );
            })}
          </div>
          {statut !== "disponible" && (
            <div className="mt-3">
              <label className="block text-xs text-dusk/50 mb-1">{t(lang, "statutJusquau")}</label>
              <input
                type="date"
                value={jusquAu}
                onChange={(e) => setJusquAu(e.target.value)}
                className="rounded-xl border border-dusk/15 bg-dust/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C75D3B)]/25"
              />
            </div>
          )}
        </div>
      </div>
      <form action={() => save(() => saveExperienceStatut({ anneeDebut, statut, jusqu_au: jusquAu || null }))}>
        <SaveBtn state={state} lang={lang} />
      </form>
    </SectionCard>
  );
}

// ── Réseaux sociaux ───────────────────────────────────────────────────────────

function ReseauxSection({ data, lang }: { data: ProfilEnrichiData; lang: Lang }) {
  const [instagram, setInstagram] = useState(data.liens_sociaux?.instagram ?? "");
  const [facebook, setFacebook] = useState(data.liens_sociaux?.facebook ?? "");
  const [tiktok, setTiktok] = useState(data.liens_sociaux?.tiktok ?? "");
  const { state, save } = useSave();

  const fields = [
    { key: "instagram" as const, label: "Instagram", value: instagram, set: setInstagram, Icon: InstagramLogo },
    { key: "facebook" as const, label: "Facebook", value: facebook, set: setFacebook, Icon: FacebookLogo },
    { key: "tiktok" as const, label: "TikTok", value: tiktok, set: setTiktok, Icon: TiktokLogo },
  ];

  return (
    <SectionCard title={t(lang, "reseaux")}>
      <div className="space-y-3">
        {fields.map(({ label, value, set, Icon }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon size={18} className="text-dusk/40 shrink-0" />
            <input
              type="url"
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={`https://...`}
              className="flex-1 rounded-xl border border-dusk/15 bg-dust/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C75D3B)]/25"
            />
          </div>
        ))}
      </div>
      <form action={() => save(() => saveReseaux({ instagram, facebook, tiktok }))}>
        <SaveBtn state={state} lang={lang} />
      </form>
    </SectionCard>
  );
}

// ── SIRET ─────────────────────────────────────────────────────────────────────

function SiretSection({ data, lang }: { data: ProfilEnrichiData; lang: Lang }) {
  const [siret, setSiret] = useState(data.numero_siret ?? "");
  const { state, save } = useSave();
  const isValid = siret === "" || /^\d{14}$/.test(siret.replace(/\s/g, ""));

  return (
    <SectionCard title={t(lang, "siret")}>
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-dusk/40 shrink-0" />
        <input
          value={siret}
          onChange={(e) => setSiret(e.target.value)}
          placeholder="00000000000000"
          maxLength={17}
          className={`flex-1 rounded-xl border px-3 py-2.5 text-sm bg-dust/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#C75D3B)]/25 ${
            isValid ? "border-dusk/15" : "border-red-400"
          }`}
        />
      </div>
      {!isValid && <p className="text-xs text-red-500 mt-1.5">{t(lang, "siretInvalid")}</p>}
      <a
        href="https://annuaire-entreprises.data.gouv.fr"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-xs text-dusk/45 hover:text-[var(--color-accent,#C75D3B)]"
      >
        <LinkIcon size={11} />
        {t(lang, "siretVerify")}
      </a>
      <form action={() => save(() => saveSiret(siret))}>
        <SaveBtn state={state} lang={lang} />
      </form>
    </SectionCard>
  );
}

// ── Slug ──────────────────────────────────────────────────────────────────────

function SlugSection({ data, lang }: { data: ProfilEnrichiData; lang: Lang }) {
  const [slug, setSlug] = useState(data.slug_personnalise ?? data.slug ?? "");
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [copied, setCopied] = useState(false);
  const { state, save } = useSave();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const SLUG_RE = /^[a-z0-9-]{3,30}$/;
    clearTimeout(timerRef.current);
    if (!slug) { setStatus("idle"); return; }
    if (!SLUG_RE.test(slug)) { setStatus("invalid"); return; }
    if (slug === (data.slug_personnalise ?? data.slug)) { setStatus("available"); return; }
    setStatus("checking");
    timerRef.current = setTimeout(async () => {
      const res = await checkSlugDisponible(slug);
      setStatus(res.disponible ? "available" : "taken");
    }, 500);
    return () => clearTimeout(timerRef.current);
  }, [slug, data.slug, data.slug_personnalise]);

  function copyUrl() {
    navigator.clipboard.writeText(`estime-app.com/artisan/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const statusColors: Record<string, string> = {
    available: "text-green-600",
    taken: "text-red-500",
    invalid: "text-amber-600",
  };

  const statusLabel: Record<string, string> = {
    available: t(lang, "slugAvailable"),
    taken: t(lang, "slugTaken"),
    invalid: t(lang, "slugInvalid"),
    checking: "…",
  };

  return (
    <SectionCard title={t(lang, "slug")}>
      <div className="flex items-center rounded-xl border border-dusk/15 bg-dust/40 overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-accent,#C75D3B)]/25">
        <span className="pl-3 pr-1 text-xs text-dusk/40 whitespace-nowrap shrink-0">{t(lang, "slugPrefix")}</span>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          maxLength={30}
          className="flex-1 bg-transparent py-2.5 text-sm text-dusk focus:outline-none min-w-0"
        />
        <button
          type="button"
          onClick={copyUrl}
          disabled={!slug}
          className="px-3 text-dusk/40 hover:text-dusk disabled:opacity-30"
          title={t(lang, "slugCopy")}
        >
          {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
        </button>
      </div>
      {status !== "idle" && (
        <p className={`text-xs mt-1.5 ${statusColors[status] ?? "text-dusk/40"}`}>
          {statusLabel[status] ?? ""}
        </p>
      )}
      <form action={() => save(() => saveSlugPersonnalise(slug))}>
        <SaveBtn state={state} lang={lang} />
      </form>
    </SectionCard>
  );
}

// ── Thème ─────────────────────────────────────────────────────────────────────

const THEME_LABELS: Record<string, string> = {
  "#C75D3B": "Terre cuite",
  "#385144": "Forêt",
  "#2D4A6B": "Marine",
  "#7B2D3E": "Bordeaux",
  "#C8922A": "Ambre",
  "#3D3D3D": "Anthracite",
};

function ThemeSection({ data, lang, onThemeChange }: { data: ProfilEnrichiData; lang: Lang; onThemeChange: (c: string) => void }) {
  const [couleur, setCouleur] = useState(data.theme_couleur);
  const { state, save } = useSave();

  function handleSelect(c: string) {
    setCouleur(c);
  }

  return (
    <SectionCard title="Personnalisation">
      {/* Couleur d'accent */}
      <p className="text-xs font-medium text-dusk/60 mb-2">{t(lang, "theme")}</p>
      <div className="flex flex-wrap gap-3 max-w-full mb-1">
        {VALID_THEMES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleSelect(c)}
            title={THEME_LABELS[c]}
            aria-label={THEME_LABELS[c]}
            className={`w-10 h-10 rounded-full transition-all ${
              couleur === c ? "scale-110" : "hover:scale-105"
            }`}
            style={{ backgroundColor: c, boxShadow: couleur === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : undefined }}
          />
        ))}
      </div>
      <p className="text-xs text-dusk/40 mb-1">{THEME_LABELS[couleur]}</p>

      {/* Aperçu icône */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-dust/40 border border-dusk/8 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm" style={{ backgroundColor: couleur }}>
          E
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-dusk">Icône de l&apos;app</p>
          <p className="text-[11px] text-dusk/45 leading-tight">
            Pour voir la nouvelle icône, réinstallez l&apos;app sur votre écran d&apos;accueil.
          </p>
        </div>
      </div>

      <form action={() => { save(() => saveTheme(couleur)); onThemeChange(couleur); }}>
        <SaveBtn state={state} lang={lang} />
      </form>

      {/* Mode sombre */}
      <div className="mt-6 pt-5 border-t border-dusk/8">
        <p className="text-xs font-medium text-dusk/60 mb-3">Mode d&apos;affichage</p>
        <ThemeToggle defaultMode={data.theme_mode} />
      </div>
    </SectionCard>
  );
}

// ── Langue ────────────────────────────────────────────────────────────────────

const LANGUES = [
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
];

function LangueSection({ data, lang, onLangChange }: { data: ProfilEnrichiData; lang: Lang; onLangChange: (l: Lang) => void }) {
  const [langue, setLangue] = useState(data.langue_interface);
  const { state, save } = useSave();

  async function handleSave() {
    await save(() => saveLangue(langue));
    onLangChange(langue as Lang);
  }

  return (
    <SectionCard title={t(lang, "langue")}>
      <div className="flex flex-wrap gap-2">
        {LANGUES.map(({ code, flag, label }) => (
          <button
            key={code}
            type="button"
            onClick={() => setLangue(code)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              langue === code
                ? "bg-[var(--color-accent,#C75D3B)] text-white border-transparent"
                : "bg-dust text-dusk border-dusk/10 hover:border-dusk/20"
            }`}
          >
            <span>{flag}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <form action={handleSave}>
        <SaveBtn state={state} lang={lang} />
      </form>
    </SectionCard>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function ProfilEnrichi({ data }: { data: ProfilEnrichiData }) {
  const [lang, setLang] = useState<Lang>((data.langue_interface as Lang) || "fr");
  const [themeColor, setThemeColor] = useState(data.theme_couleur);

  return (
    <div className="space-y-6">
      <DynamicManifest themeColor={themeColor} />
      <PhotoSection data={data} lang={lang} />
      <PresentationSection data={data} lang={lang} />
      <CertificationsSection data={data} lang={lang} />
      <ExperienceStatutSection data={data} lang={lang} />
      <ReseauxSection data={data} lang={lang} />
      <SiretSection data={data} lang={lang} />
      <SlugSection data={data} lang={lang} />
      <ThemeSection data={data} lang={lang} onThemeChange={setThemeColor} />
      <LangueSection data={data} lang={lang} onLangChange={setLang} />
    </div>
  );
}
