"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkle,
  Eye,
  PencilSimple,
  ArrowSquareOut,
  Check,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash,
  ArrowCounterClockwise,
  SpinnerGap,
  CaretDown,
} from "@phosphor-icons/react";
import { saveVitrineConfig, resetVitrineConfig } from "@/app/actions/vitrine";
import {
  DEFAULT_VITRINE_CONFIG,
  CERTIFICATIONS_DISPONIBLES,
  COULEURS_PREDEFINIES,
  POLICES_TITRES,
  mergeVitrineConfig,
  textureCSS,
  type VitrineConfig,
  type HeroStyle,
  type HeroOverlay,
  type FormeTransition,
  type FondTexture,
  type SeparateurStyle,
  type PoliceTitres,
  type TailleTitres,
} from "@/lib/vitrine/defaults";

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-dusk/8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">{icon}</span>
          <h3 className="font-display text-base font-bold text-dusk">{title}</h3>
        </div>
        <CaretDown
          size={16}
          className="text-dusk/40 transition-transform duration-200"
          style={{ transform: open ? "rotate(-180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-sm font-medium text-dusk/70 hover:text-dusk transition-colors"
      aria-pressed={checked}
    >
      {checked ? (
        <ToggleRight size={24} weight="fill" className="text-ambre" />
      ) : (
        <ToggleLeft size={24} className="text-dusk/30" />
      )}
      {label}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-dusk/55 mb-1.5">{children}</p>;
}

function Input({
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={rows}
      className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all resize-none"
    />
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ChipGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            value === o.value
              ? "bg-ambre text-white"
              : "bg-dust text-dusk/60 border border-dusk/12 hover:border-dusk/25"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Live Preview ──────────────────────────────────────────────────────────────

function VitrinePreview({
  config,
  profile,
}: {
  config: VitrineConfig;
  profile: ProfileInfo;
}) {
  const artisanNom =
    [profile.prenom, profile.nom].filter(Boolean).join(" ") || "Votre nom";
  const couleur = config.hero.couleur_principale || "#C75D3B";
  const cardRadius =
    config.mise_en_page.style_cards === "carre"
      ? "rounded-lg"
      : config.mise_en_page.style_cards === "ombre"
      ? "rounded-2xl shadow-md"
      : "rounded-2xl";

  const heroH =
    config.hero.style === "plein_ecran"
      ? "min-h-[280px]"
      : config.hero.style === "compact"
      ? "min-h-[140px]"
      : "min-h-[200px]";

  const fontFamily = config.typographie.police_titres !== "Inter"
    ? `'${config.typographie.police_titres}', sans-serif`
    : undefined;

  const titleSize =
    config.typographie.taille_titres === "tres_grand"
      ? "text-lg"
      : config.typographie.taille_titres === "grand"
      ? "text-base"
      : "text-sm";

  const fondTexture =
    config.fond.type === "texture" ? textureCSS(config.fond.texture, couleur) : "";
  const decorLaterale = config.fond.decorations_laterales;

  return (
    <div
      className="relative bg-[#F8F5F2] min-h-[600px] text-[#2B2521] text-sm overflow-hidden"
      style={{
        fontSize: "13px",
        fontFamily,
        ...(config.fond.type === "degrade"
          ? { backgroundImage: `linear-gradient(160deg, ${couleur}12, transparent 60%)` }
          : {}),
        ...(fondTexture
          ? { backgroundImage: fondTexture.replace("background-image: ", "").replace(";", "") }
          : {}),
      }}
    >
      {/* Décorations latérales */}
      {decorLaterale === "bordure" && (
        <div className="absolute top-0 left-0 bottom-0 w-1 z-10" style={{ backgroundColor: couleur }} />
      )}
      {decorLaterale === "bande" && (
        <div className="absolute top-0 left-0 bottom-0 w-3 z-10" style={{ backgroundColor: `${couleur}20` }} />
      )}
      {decorLaterale === "watermark" && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.06] text-2xl leading-[3] text-center select-none">
          {"🔨📐🧱🪚🔧🏗️".repeat(20)}
        </div>
      )}

      {/* Hero */}
      <div
        className={`relative ${heroH} flex flex-col items-center justify-center text-center px-4 py-8 overflow-hidden`}
        style={{
          backgroundColor:
            config.hero.overlay_couleur === "colore" ? `${couleur}dd` : undefined,
          background:
            config.hero.overlay_couleur === "degrade"
              ? `linear-gradient(135deg, ${couleur}cc 0%, ${config.hero.couleur_secondaire}cc 100%)`
              : config.hero.overlay_couleur === "sombre"
              ? `rgba(30,20,15,${config.hero.overlay_opacite / 100})`
              : undefined,
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: couleur }}
        >
          {((profile.prenom?.[0] ?? "") + (profile.nom?.[0] ?? "")).toUpperCase() || "A"}
        </div>

        <h1 className={`font-bold ${titleSize} text-[#2B2521]`} style={fontFamily ? { fontFamily } : {}}>
          {artisanNom}
        </h1>

        {(profile.metier || profile.ville) && (
          <p className="text-[10px] text-[#2B2521]/50 mt-0.5">
            {[profile.metier, profile.ville && `📍 ${profile.ville}`].filter(Boolean).join(" · ")}
          </p>
        )}

        {config.hero.slogan && (
          <p className="mt-2 text-xs font-semibold italic" style={{ color: couleur }}>
            &ldquo;{config.hero.slogan.slice(0, 60)}&rdquo;
          </p>
        )}

        <button
          className="mt-3 px-3 py-1.5 rounded-full text-[10px] font-semibold text-white"
          style={{ backgroundColor: couleur }}
        >
          {config.hero.cta_texte || "Contactez-moi"}
        </button>

        {/* Compteurs hero preview */}
        {config.hero.compteurs_hero && (
          <div className="mt-3 flex gap-4 text-[10px]">
            {["🏗️ Chantiers", "⭐ Avis", "✅ Satisfaits"].map((l) => (
              <span key={l} className="text-[#2B2521]/60">{l}</span>
            ))}
          </div>
        )}

        {/* Transition shape preview */}
        {config.hero.forme_transition !== "droite" && (
          <div className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, #F8F5F2 0%, transparent 100%)`,
                clipPath:
                  config.hero.forme_transition === "vague"
                    ? "ellipse(60% 100% at 50% 100%)"
                    : config.hero.forme_transition === "diagonale"
                    ? "polygon(0 100%, 100% 0, 100% 100%)"
                    : undefined,
              }}
            />
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Chiffres clés */}
        {config.sections.chiffres_cles.visible && (
          <div
            className={`py-3 rounded-xl ${config.sections.chiffres_cles.style === "bande" ? "" : "grid grid-cols-2 gap-2"}`}
            style={config.sections.chiffres_cles.style === "bande" ? { backgroundColor: couleur } : {}}
          >
            {config.sections.chiffres_cles.style === "bande" ? (
              <div className="flex justify-around">
                {["🏗️", "⭐", "✅"].map((icon) => (
                  <div key={icon} className="text-center">
                    <span>{icon}</span>
                    <p className="text-lg font-bold text-white tabular-nums">—</p>
                    <p className="text-[9px] text-white/70">—</p>
                  </div>
                ))}
              </div>
            ) : (
              ["🏗️ Chantiers", "⭐ Avis", "✅ Satisfaits", "📅 Ans"].map((l) => (
                <div key={l} className="bg-white rounded-xl p-3 text-center border border-[#2B2521]/5">
                  <p className="text-xs font-bold tabular-nums" style={{ color: couleur }}>—</p>
                  <p className="text-[9px] text-[#2B2521]/50">{l}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* À propos */}
        {config.sections.a_propos.visible && (
          <div className={`bg-white p-3 border border-[#2B2521]/6 ${cardRadius}`}>
            <p className="font-semibold text-[10px] text-[#2B2521]/40 uppercase tracking-wider mb-1">À propos</p>
            {config.sections.a_propos.texte ? (
              <p className="text-[11px] text-[#2B2521]/70 leading-relaxed line-clamp-3">
                {config.sections.a_propos.texte}
              </p>
            ) : (
              <p className="text-[11px] text-[#2B2521]/30 italic">Votre présentation ici…</p>
            )}
          </div>
        )}

        {/* Témoignage vedette */}
        {config.sections.temoignage_vedette.visible && (
          <div className={`p-3 ${cardRadius}`} style={{ backgroundColor: couleur }}>
            <p className="text-[11px] text-white/90 italic">
              &ldquo;{config.sections.temoignage_vedette.texte_custom || "Témoignage client…"}&rdquo;
            </p>
            <p className="text-[10px] text-white/70 mt-1">
              — {config.sections.temoignage_vedette.auteur_custom || "Client satisfait"}
            </p>
          </div>
        )}

        {/* Chantiers */}
        {config.sections.chantiers.visible && (
          <div>
            <p className="font-semibold text-[10px] text-[#2B2521]/40 uppercase tracking-wider mb-1">Réalisations</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`aspect-square bg-[#E8E0D2] ${cardRadius}`} />
              ))}
            </div>
          </div>
        )}

        {/* FAQ preview */}
        {config.sections.faq.visible && config.sections.faq.items.length > 0 && (
          <div>
            <p className="font-semibold text-[10px] text-[#2B2521]/40 uppercase tracking-wider mb-1">FAQ</p>
            {config.sections.faq.items.slice(0, 2).map((item, i) => (
              <div key={i} className={`bg-white p-2 border border-[#2B2521]/6 mb-1 ${cardRadius}`}>
                <p className="text-[10px] font-semibold text-[#2B2521]">{item.question}</p>
              </div>
            ))}
          </div>
        )}

        {/* Ruban certifications */}
        {config.sections.certifications_ruban.visible && config.sections.certifications.liste.length > 0 && (
          <div className="overflow-hidden">
            <p className="font-semibold text-[10px] text-[#2B2521]/40 uppercase tracking-wider mb-1">Certifications</p>
            <div className="flex gap-2">
              {config.sections.certifications.liste.slice(0, 4).map((c) => (
                <span key={c} className="px-2 py-0.5 bg-[#2B2521]/5 rounded-full text-[9px] whitespace-nowrap">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Video */}
        {config.sections.video.visible && config.sections.video.url && (
          <div className="bg-[#1a1a1a] rounded-xl aspect-video flex items-center justify-center">
            <span className="text-2xl">▶️</span>
          </div>
        )}

        {/* Avis */}
        {config.sections.avis.visible && (
          <div>
            <p className="font-semibold text-[10px] text-[#2B2521]/40 uppercase tracking-wider mb-1">Avis</p>
            <div className={`bg-white p-3 border border-[#2B2521]/6 ${cardRadius}`}>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((v) => <span key={v} className="text-amber-400 text-xs">★</span>)}
              </div>
              <div className="h-1.5 bg-[#E8E0D2] rounded w-3/4 mt-1" />
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-[#2B2521]/6 bg-white px-4 py-3 text-center">
        <p className="text-[10px] text-[#2B2521]/40">
          Propulsé par <span className="font-semibold" style={{ color: couleur }}>Estime</span>
        </p>
      </footer>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProfileInfo {
  prenom: string | null;
  nom: string | null;
  metier: string | null;
  ville: string | null;
  slug: string | null;
}

// ── Main Editor ───────────────────────────────────────────────────────────────

export function VitrineEditor({
  initialConfig,
  profile,
}: {
  initialConfig: VitrineConfig;
  profile: ProfileInfo;
}) {
  const [config, setConfig] = useState<VitrineConfig>(initialConfig);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isGeneratingSlogan, setIsGeneratingSlogan] = useState(false);
  const [slogansProposés, setSlogansProposés] = useState<string[]>([]);
  const [specialiteInput, setSpecialiteInput] = useState("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced auto-save
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(async () => {
      const result = await saveVitrineConfig(config);
      setSaveStatus(result.error ? "error" : "saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const updateHero = useCallback(
    <K extends keyof VitrineConfig["hero"]>(key: K, value: VitrineConfig["hero"][K]) => {
      setConfig((c) => ({ ...c, hero: { ...c.hero, [key]: value } }));
    }, []
  );

  const updateFond = useCallback(
    <K extends keyof VitrineConfig["fond"]>(key: K, value: VitrineConfig["fond"][K]) => {
      setConfig((c) => ({ ...c, fond: { ...c.fond, [key]: value } }));
    }, []
  );

  const updateSection = useCallback(
    <S extends keyof VitrineConfig["sections"]>(section: S, patch: Partial<VitrineConfig["sections"][S]>) => {
      setConfig((c) => ({ ...c, sections: { ...c.sections, [section]: { ...c.sections[section], ...patch } } }));
    }, []
  );

  const updateMiseEnPage = useCallback(
    <K extends keyof VitrineConfig["mise_en_page"]>(key: K, value: VitrineConfig["mise_en_page"][K]) => {
      setConfig((c) => ({ ...c, mise_en_page: { ...c.mise_en_page, [key]: value } }));
    }, []
  );

  const updateTypo = useCallback(
    <K extends keyof VitrineConfig["typographie"]>(key: K, value: VitrineConfig["typographie"][K]) => {
      setConfig((c) => ({ ...c, typographie: { ...c.typographie, [key]: value } }));
    }, []
  );

  const handleGenerateSlogan = useCallback(async () => {
    setIsGeneratingSlogan(true);
    setSlogansProposés([]);
    try {
      const res = await fetch("/api/vitrine/generer-slogan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metier: profile.metier, ville: profile.ville }),
      });
      const data = await res.json();
      if (data.slogans) setSlogansProposés(data.slogans);
    } finally {
      setIsGeneratingSlogan(false);
    }
  }, [profile.metier, profile.ville]);

  const handleReset = useCallback(async () => {
    if (!confirm("Réinitialiser toute la configuration de votre vitrine ?")) return;
    const newConfig = mergeVitrineConfig({});
    setConfig(newConfig);
    await resetVitrineConfig();
  }, []);

  // Spécialités
  const addSpecialite = useCallback(() => {
    const val = specialiteInput.trim();
    if (!val || config.sections.a_propos.specialites.includes(val)) return;
    updateSection("a_propos", { specialites: [...config.sections.a_propos.specialites, val] });
    setSpecialiteInput("");
  }, [specialiteInput, config.sections.a_propos.specialites, updateSection]);

  const removeSpecialite = useCallback((s: string) => {
    updateSection("a_propos", { specialites: config.sections.a_propos.specialites.filter((x) => x !== s) });
  }, [config.sections.a_propos.specialites, updateSection]);

  // Tarifs
  const addTarifLigne = useCallback(() => {
    updateSection("tarifs", { lignes: [...config.sections.tarifs.lignes, { description: "", prix: "" }] });
  }, [config.sections.tarifs.lignes, updateSection]);

  const updateTarifLigne = useCallback((i: number, field: "description" | "prix", value: string) => {
    const lignes = [...config.sections.tarifs.lignes];
    lignes[i] = { ...lignes[i], [field]: value };
    updateSection("tarifs", { lignes });
  }, [config.sections.tarifs.lignes, updateSection]);

  const removeTarifLigne = useCallback((i: number) => {
    updateSection("tarifs", { lignes: config.sections.tarifs.lignes.filter((_, idx) => idx !== i) });
  }, [config.sections.tarifs.lignes, updateSection]);

  // Équipe
  const addMembre = useCallback(() => {
    if (config.sections.equipe.membres.length >= 5) return;
    updateSection("equipe", { membres: [...config.sections.equipe.membres, { prenom: "", role: "" }] });
  }, [config.sections.equipe.membres, updateSection]);

  const updateMembre = useCallback((i: number, field: "prenom" | "role", value: string) => {
    const membres = [...config.sections.equipe.membres];
    membres[i] = { ...membres[i], [field]: value };
    updateSection("equipe", { membres });
  }, [config.sections.equipe.membres, updateSection]);

  const removeMembre = useCallback((i: number) => {
    updateSection("equipe", { membres: config.sections.equipe.membres.filter((_, idx) => idx !== i) });
  }, [config.sections.equipe.membres, updateSection]);

  // FAQ
  const addFaqItem = useCallback(() => {
    if (config.sections.faq.items.length >= 6) return;
    updateSection("faq", { items: [...config.sections.faq.items, { question: "", reponse: "" }] });
  }, [config.sections.faq.items, updateSection]);

  const updateFaqItem = useCallback((i: number, field: "question" | "reponse", value: string) => {
    const items = [...config.sections.faq.items];
    items[i] = { ...items[i], [field]: value };
    updateSection("faq", { items });
  }, [config.sections.faq.items, updateSection]);

  const removeFaqItem = useCallback((i: number) => {
    updateSection("faq", { items: config.sections.faq.items.filter((_, idx) => idx !== i) });
  }, [config.sections.faq.items, updateSection]);

  // Certifs toggle
  const toggleCertification = useCallback((certif: string) => {
    const liste = config.sections.certifications.liste;
    updateSection("certifications", {
      liste: liste.includes(certif) ? liste.filter((c) => c !== certif) : [...liste, certif],
    });
  }, [config.sections.certifications.liste, updateSection]);

  // ── Editor panels ──────────────────────────────────────────────────────────

  const inputCls = "flex-1 px-3 py-2 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 transition-all";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-dusk">Ma vitrine</h1>
          <p className="text-dusk/50 text-sm mt-0.5">
            Personnalisez votre page publique{" "}
            {profile.slug && (
              <a href={`/artisan/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                className="text-ambre hover:underline inline-flex items-center gap-1">
                /artisan/{profile.slug}<ArrowSquareOut size={12} />
              </a>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium transition-all ${
            saveStatus === "saving" ? "text-dusk/40" :
            saveStatus === "saved" ? "text-emerald-600" :
            saveStatus === "error" ? "text-red-500" : "opacity-0"}`}>
            {saveStatus === "saving" && "Sauvegarde…"}
            {saveStatus === "saved" && "✓ Sauvegardé"}
            {saveStatus === "error" && "Erreur de sauvegarde"}
          </span>
          {profile.slug && (
            <a href={`/artisan/${profile.slug}`} target="_blank" rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border border-dusk/20 text-dusk hover:bg-dusk/5 transition-all">
              <Eye size={16} />Voir en ligne<ArrowSquareOut size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden flex gap-1 mb-4 p-1 bg-dust rounded-xl">
        {(["edit", "preview"] as const).map((tab) => (
          <button key={tab} type="button" onClick={() => setMobileTab(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all ${
              mobileTab === tab ? "bg-white text-dusk shadow-sm" : "text-dusk/55 hover:text-dusk"}`}>
            {tab === "edit" ? <><PencilSimple size={15} />Éditer</> : <><Eye size={15} />Aperçu</>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Editor */}
        <div className={`w-full lg:w-[42%] space-y-4 overflow-y-auto ${mobileTab === "preview" ? "hidden lg:block" : ""}`}>

          {/* ── Hero & Identité ── */}
          <SectionCard title="Hero & identité" icon="🎨">
            {/* Slogan */}
            <div className="mb-4">
              <FieldLabel>Slogan ({config.hero.slogan.length}/100)</FieldLabel>
              <Textarea value={config.hero.slogan} onChange={(v) => updateHero("slogan", v.slice(0, 100))} placeholder="Ex : Votre maison mérite le meilleur…" maxLength={100} rows={2} />
              <div className="mt-2">
                <button type="button" onClick={handleGenerateSlogan} disabled={isGeneratingSlogan}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-ambre/10 text-ambre hover:bg-ambre/20 disabled:opacity-50 transition-all">
                  {isGeneratingSlogan ? <SpinnerGap size={12} className="animate-spin" /> : <Sparkle size={12} weight="fill" />}
                  Générer avec l&apos;IA
                </button>
              </div>
              {slogansProposés.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {slogansProposés.map((s, i) => (
                    <button key={i} type="button" onClick={() => { updateHero("slogan", s); setSlogansProposés([]); }}
                      className="w-full text-left text-xs px-3 py-2 rounded-xl border border-ambre/25 bg-ambre/5 text-dusk hover:bg-ambre/10 transition-all">
                      &ldquo;{s}&rdquo;
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Style du hero */}
            <div className="mb-4">
              <FieldLabel>Hauteur du hero</FieldLabel>
              <ChipGroup<HeroStyle>
                value={config.hero.style}
                onChange={(v) => updateHero("style", v)}
                options={[
                  { value: "compact", label: "Compact (50vh)" },
                  { value: "grand", label: "Grand (70vh)" },
                  { value: "plein_ecran", label: "Plein écran" },
                ]}
              />
            </div>

            {/* Overlay */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <FieldLabel>Overlay</FieldLabel>
                <ChipGroup<HeroOverlay>
                  value={config.hero.overlay_couleur}
                  onChange={(v) => updateHero("overlay_couleur", v)}
                  options={[
                    { value: "aucun", label: "Aucun" },
                    { value: "sombre", label: "Sombre" },
                    { value: "colore", label: "Coloré" },
                    { value: "degrade", label: "Dégradé" },
                  ]}
                />
              </div>
              {config.hero.overlay_couleur !== "aucun" && (
                <div>
                  <FieldLabel>Opacité ({config.hero.overlay_opacite}%)</FieldLabel>
                  <input type="range" min={0} max={80} step={5}
                    value={config.hero.overlay_opacite}
                    onChange={(e) => updateHero("overlay_opacite", parseInt(e.target.value))}
                    className="w-full accent-ambre" />
                </div>
              )}
            </div>

            {/* Forme de transition */}
            <div className="mb-4">
              <FieldLabel>Découpe bas du hero</FieldLabel>
              <ChipGroup<FormeTransition>
                value={config.hero.forme_transition}
                onChange={(v) => updateHero("forme_transition", v)}
                options={[
                  { value: "droite", label: "Droite" },
                  { value: "vague", label: "Vague" },
                  { value: "vague_angulaire", label: "Angulaire" },
                  { value: "diagonale", label: "Diagonale" },
                  { value: "courbe", label: "Courbe" },
                ]}
              />
            </div>

            {/* Effets */}
            <div className="mb-4 space-y-2">
              <Toggle checked={config.hero.parallaxe} onChange={(v) => updateHero("parallaxe", v)} label="Effet parallaxe" />
              <Toggle checked={config.hero.compteurs_hero} onChange={(v) => updateHero("compteurs_hero", v)} label="Compteurs dans le hero" />
              {config.hero.compteurs_hero && (
                <div className="ml-8">
                  <FieldLabel>Position des compteurs</FieldLabel>
                  <ChipGroup value={config.hero.compteurs_position}
                    onChange={(v) => updateHero("compteurs_position", v as "bas" | "overlay")}
                    options={[{ value: "bas", label: "En bas" }, { value: "overlay", label: "Sur l'image" }]} />
                </div>
              )}
            </div>

            {/* Couleurs */}
            <div className="mb-4">
              <FieldLabel>Couleur principale</FieldLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {COULEURS_PREDEFINIES.map((c) => (
                  <button key={c.hex} type="button" title={c.label} onClick={() => updateHero("couleur_principale", c.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${config.hero.couleur_principale === c.hex ? "border-dusk scale-110 shadow-sm" : "border-transparent hover:scale-105"}`}
                    style={{ backgroundColor: c.hex }} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="color" value={config.hero.couleur_principale}
                  onChange={(e) => updateHero("couleur_principale", e.target.value)}
                  className="w-8 h-8 rounded-lg border border-dusk/15 cursor-pointer bg-transparent" />
                <span className="text-xs text-dusk/50 font-mono">{config.hero.couleur_principale}</span>
              </div>
            </div>

            <div className="mb-4">
              <FieldLabel>Couleur secondaire</FieldLabel>
              <div className="flex items-center gap-2">
                <input type="color" value={config.hero.couleur_secondaire}
                  onChange={(e) => updateHero("couleur_secondaire", e.target.value)}
                  className="w-8 h-8 rounded-lg border border-dusk/15 cursor-pointer bg-transparent" />
                <span className="text-xs text-dusk/50 font-mono">{config.hero.couleur_secondaire}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Texte CTA</FieldLabel>
                <SelectField value={config.hero.cta_texte} onChange={(v) => updateHero("cta_texte", v)}
                  options={[
                    { value: "Demandez un devis", label: "Demandez un devis" },
                    { value: "Contactez-moi", label: "Contactez-moi" },
                    { value: "Appelez-moi", label: "Appelez-moi" },
                    { value: "Prenez rendez-vous", label: "Prenez rendez-vous" },
                  ]} />
              </div>
              <div>
                <FieldLabel>Action CTA</FieldLabel>
                <SelectField value={config.hero.cta_action}
                  onChange={(v) => updateHero("cta_action", v as "formulaire" | "telephone" | "email")}
                  options={[
                    { value: "formulaire", label: "Formulaire" },
                    { value: "telephone", label: "Téléphone" },
                    { value: "email", label: "Email" },
                  ]} />
              </div>
            </div>
          </SectionCard>

          {/* ── Arrière-plan ── */}
          <SectionCard title="Arrière-plan & décoration" icon="🖼️" defaultOpen={false}>
            <div className="mb-4">
              <FieldLabel>Type de fond</FieldLabel>
              <ChipGroup value={config.fond.type}
                onChange={(v) => updateFond("type", v as "uni" | "degrade" | "texture")}
                options={[
                  { value: "uni", label: "Uni" },
                  { value: "degrade", label: "Dégradé" },
                  { value: "texture", label: "Texture" },
                ]} />
            </div>

            {config.fond.type === "texture" && (
              <div className="mb-4">
                <FieldLabel>Texture</FieldLabel>
                <ChipGroup<FondTexture>
                  value={config.fond.texture}
                  onChange={(v) => updateFond("texture", v)}
                  options={[
                    { value: "aucune", label: "Aucune" },
                    { value: "beton", label: "Béton" },
                    { value: "enduit", label: "Enduit" },
                    { value: "bois", label: "Bois" },
                    { value: "papier", label: "Papier" },
                    { value: "toile", label: "Toile" },
                    { value: "geometrique", label: "Géométrique" },
                  ]}
                />
              </div>
            )}

            <div className="mb-4">
              <FieldLabel>Décorations latérales</FieldLabel>
              <ChipGroup value={config.fond.decorations_laterales}
                onChange={(v) => updateFond("decorations_laterales", v as "aucune" | "bordure" | "bande" | "watermark")}
                options={[
                  { value: "aucune", label: "Aucune" },
                  { value: "bordure", label: "Bordure" },
                  { value: "bande", label: "Bande" },
                  { value: "watermark", label: "Watermark" },
                ]} />
            </div>
          </SectionCard>

          {/* ── Chiffres clés ── */}
          <SectionCard title="Chiffres clés animés" icon="📊" defaultOpen={false}>
            <div className="flex items-center justify-between mb-4">
              <Toggle checked={config.sections.chiffres_cles.visible}
                onChange={(v) => updateSection("chiffres_cles", { visible: v })} label="Afficher la section" />
            </div>
            <div className="mb-3">
              <FieldLabel>Style</FieldLabel>
              <ChipGroup value={config.sections.chiffres_cles.style}
                onChange={(v) => updateSection("chiffres_cles", { style: v as "bande" | "cards" })}
                options={[{ value: "bande", label: "Bande colorée" }, { value: "cards", label: "Cards blanches" }]} />
            </div>
            <div>
              <FieldLabel>Satisfaction clients (%)</FieldLabel>
              <input type="number" min={0} max={100} value={config.sections.chiffres_cles.satisfaction}
                onChange={(e) => updateSection("chiffres_cles", { satisfaction: Math.min(100, parseInt(e.target.value) || 0) })}
                className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-ambre/30 transition-all" />
              <p className="text-xs text-dusk/40 mt-1">Les autres chiffres sont calculés automatiquement depuis vos données.</p>
            </div>
          </SectionCard>

          {/* ── Témoignage vedette ── */}
          <SectionCard title="Témoignage vedette" icon="💬" defaultOpen={false}>
            <div className="flex items-center justify-between mb-4">
              <Toggle checked={config.sections.temoignage_vedette.visible}
                onChange={(v) => updateSection("temoignage_vedette", { visible: v })} label="Afficher" />
            </div>
            <div className="space-y-3">
              <div>
                <FieldLabel>Texte du témoignage</FieldLabel>
                <Textarea value={config.sections.temoignage_vedette.texte_custom}
                  onChange={(v) => updateSection("temoignage_vedette", { texte_custom: v })}
                  placeholder="Travail impeccable, je recommande vivement…" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Nom du client</FieldLabel>
                  <Input value={config.sections.temoignage_vedette.auteur_custom}
                    onChange={(v) => updateSection("temoignage_vedette", { auteur_custom: v })}
                    placeholder="Marie D." />
                </div>
                <div>
                  <FieldLabel>Note (étoiles)</FieldLabel>
                  <SelectField value={String(config.sections.temoignage_vedette.note)}
                    onChange={(v) => updateSection("temoignage_vedette", { note: parseInt(v) })}
                    options={[
                      { value: "5", label: "★★★★★ 5/5" },
                      { value: "4", label: "★★★★☆ 4/5" },
                      { value: "3", label: "★★★☆☆ 3/5" },
                    ]} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── À propos ── */}
          <SectionCard title="À propos" icon="👷" defaultOpen={false}>
            <div className="flex items-center justify-between mb-3">
              <Toggle checked={config.sections.a_propos.visible}
                onChange={(v) => updateSection("a_propos", { visible: v })} label="Afficher" />
            </div>
            <div className="mb-3">
              <FieldLabel>Présentation ({config.sections.a_propos.texte.length}/500)</FieldLabel>
              <Textarea value={config.sections.a_propos.texte}
                onChange={(v) => updateSection("a_propos", { texte: v.slice(0, 500) })}
                placeholder="Décrivez votre activité, vos valeurs…" maxLength={500} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <FieldLabel>Année de début</FieldLabel>
                <Input type="number" value={config.sections.a_propos.annees_experience?.toString() ?? ""}
                  onChange={(v) => updateSection("a_propos", { annees_experience: v ? parseInt(v) : null })}
                  placeholder="Ex : 2008" />
              </div>
              <div>
                <FieldLabel>Zone d&apos;intervention</FieldLabel>
                <Input value={config.sections.a_propos.zone_intervention}
                  onChange={(v) => updateSection("a_propos", { zone_intervention: v })}
                  placeholder="Paris, Versailles…" />
              </div>
            </div>
            <div>
              <FieldLabel>Spécialités</FieldLabel>
              <div className="flex gap-2 mb-2">
                <input type="text" value={specialiteInput} onChange={(e) => setSpecialiteInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialite())}
                  placeholder="Ex : Rénovation…" className={inputCls} />
                <button type="button" onClick={addSpecialite}
                  className="px-3 py-2 rounded-xl bg-ambre/10 text-ambre hover:bg-ambre/20 transition-all"><Plus size={16} /></button>
              </div>
              {config.sections.a_propos.specialites.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {config.sections.a_propos.specialites.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ambre/10 text-ambre text-xs font-medium">
                      {s}
                      <button type="button" onClick={() => removeSpecialite(s)} className="hover:text-braise"><Trash size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Ruban certifications ── */}
          <SectionCard title="Ruban certifications" icon="🎗️" defaultOpen={false}>
            <div className="flex items-center justify-between mb-4">
              <Toggle checked={config.sections.certifications_ruban.visible}
                onChange={(v) => updateSection("certifications_ruban", { visible: v })} label="Afficher le ruban défilant" />
            </div>
            <div className="mb-4">
              <Toggle checked={config.sections.certifications.visible}
                onChange={(v) => updateSection("certifications", { visible: v })} label="Section certifications dans le hero" />
            </div>
            <FieldLabel>Certifications actives</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {CERTIFICATIONS_DISPONIBLES.map((certif) => {
                const checked = config.sections.certifications.liste.includes(certif);
                return (
                  <button key={certif} type="button" onClick={() => toggleCertification(certif)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all ${
                      checked ? "border-ambre/40 bg-ambre/8 text-ambre" : "border-dusk/12 bg-dust text-dusk/60 hover:border-dusk/25"}`}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${checked ? "bg-ambre" : "bg-dusk/15"}`}>
                      {checked && <Check size={10} weight="bold" className="text-white" />}
                    </div>
                    {certif}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* ── FAQ ── */}
          <SectionCard title="FAQ" icon="❓" defaultOpen={false}>
            <div className="flex items-center justify-between mb-4">
              <Toggle checked={config.sections.faq.visible}
                onChange={(v) => updateSection("faq", { visible: v })} label="Afficher la section FAQ" />
            </div>
            <div className="space-y-3 mb-3">
              {config.sections.faq.items.map((item, i) => (
                <div key={i} className="space-y-2 p-3 rounded-xl bg-dust border border-dusk/8">
                  <div className="flex gap-2">
                    <input type="text" value={item.question}
                      onChange={(e) => updateFaqItem(i, "question", e.target.value)}
                      placeholder={`Question ${i + 1}`} className={inputCls} />
                    <button type="button" onClick={() => removeFaqItem(i)}
                      className="px-2 py-2 rounded-xl text-dusk/40 hover:text-red-500 hover:bg-red-50 transition-all"><Trash size={14} /></button>
                  </div>
                  <textarea value={item.reponse}
                    onChange={(e) => updateFaqItem(i, "reponse", e.target.value)}
                    placeholder="Réponse…" rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-dusk/15 bg-white text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 transition-all resize-none" />
                </div>
              ))}
            </div>
            {config.sections.faq.items.length < 6 && (
              <button type="button" onClick={addFaqItem}
                className="flex items-center gap-1.5 text-xs text-dusk/55 hover:text-ambre transition-colors">
                <Plus size={14} />Ajouter une question
              </button>
            )}
          </SectionCard>

          {/* ── Vidéo ── */}
          <SectionCard title="Vidéo de présentation" icon="🎬" defaultOpen={false}>
            <div className="flex items-center justify-between mb-4">
              <Toggle checked={config.sections.video.visible}
                onChange={(v) => updateSection("video", { visible: v })} label="Afficher la section vidéo" />
            </div>
            <div>
              <FieldLabel>Lien YouTube ou Vimeo</FieldLabel>
              <Input value={config.sections.video.url}
                onChange={(v) => updateSection("video", { url: v })}
                placeholder="https://www.youtube.com/watch?v=..." />
              <p className="text-xs text-dusk/40 mt-1">Collez un lien YouTube ou Vimeo pour intégrer la vidéo.</p>
            </div>
          </SectionCard>

          {/* ── Chantiers ── */}
          <SectionCard title="Chantiers réalisés" icon="🏗️" defaultOpen={false}>
            <div className="flex items-center justify-between mb-4">
              <Toggle checked={config.sections.chantiers.visible}
                onChange={(v) => updateSection("chantiers", { visible: v })} label="Afficher" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Nombre</FieldLabel>
                <SelectField value={String(config.sections.chantiers.nombre)}
                  onChange={(v) => updateSection("chantiers", { nombre: parseInt(v) })}
                  options={[{ value: "3", label: "3" }, { value: "6", label: "6" }, { value: "9", label: "9" }, { value: "12", label: "12" }]} />
              </div>
              <div>
                <FieldLabel>Disposition</FieldLabel>
                <SelectField value={config.sections.chantiers.disposition}
                  onChange={(v) => updateSection("chantiers", { disposition: v as "grille" | "liste" })}
                  options={[{ value: "grille", label: "Grille" }, { value: "liste", label: "Liste" }]} />
              </div>
            </div>
          </SectionCard>

          {/* ── Avis ── */}
          <SectionCard title="Avis Google" icon="⭐" defaultOpen={false}>
            <div className="flex items-center justify-between mb-4">
              <Toggle checked={config.sections.avis.visible}
                onChange={(v) => updateSection("avis", { visible: v })} label="Afficher" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Nombre</FieldLabel>
                <SelectField value={String(config.sections.avis.nombre)}
                  onChange={(v) => updateSection("avis", { nombre: parseInt(v) })}
                  options={[{ value: "3", label: "3" }, { value: "5", label: "5" }, { value: "10", label: "10" }]} />
              </div>
              <div>
                <FieldLabel>Style</FieldLabel>
                <SelectField value={config.sections.avis.style}
                  onChange={(v) => updateSection("avis", { style: v as "cards" | "compact" })}
                  options={[{ value: "cards", label: "Cards" }, { value: "compact", label: "Compact" }]} />
              </div>
            </div>
          </SectionCard>

          {/* ── Tarifs ── */}
          <SectionCard title="Tarifs" icon="💶" defaultOpen={false}>
            <div className="flex items-center justify-between mb-4">
              <Toggle checked={config.sections.tarifs.visible}
                onChange={(v) => updateSection("tarifs", { visible: v })} label="Afficher" />
            </div>
            <div className="space-y-2 mb-3">
              {config.sections.tarifs.lignes.map((ligne, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={ligne.description} onChange={(e) => updateTarifLigne(i, "description", e.target.value)} placeholder="Description" className={inputCls} />
                  <input type="text" value={ligne.prix} onChange={(e) => updateTarifLigne(i, "prix", e.target.value)} placeholder="Prix" className="w-24 px-3 py-2 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 transition-all" />
                  <button type="button" onClick={() => removeTarifLigne(i)} className="px-2 py-2 rounded-xl text-dusk/40 hover:text-red-500 hover:bg-red-50 transition-all"><Trash size={14} /></button>
                </div>
              ))}
            </div>
            {config.sections.tarifs.lignes.length < 6 && (
              <button type="button" onClick={addTarifLigne} className="flex items-center gap-1.5 text-xs text-dusk/55 hover:text-ambre transition-colors"><Plus size={14} />Ajouter</button>
            )}
          </SectionCard>

          {/* ── Équipe ── */}
          <SectionCard title="Mon équipe" icon="👥" defaultOpen={false}>
            <div className="flex items-center justify-between mb-4">
              <Toggle checked={config.sections.equipe.visible}
                onChange={(v) => updateSection("equipe", { visible: v })} label="Afficher" />
            </div>
            <div className="space-y-2 mb-3">
              {config.sections.equipe.membres.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={m.prenom} onChange={(e) => updateMembre(i, "prenom", e.target.value)} placeholder="Prénom" className={inputCls} />
                  <input type="text" value={m.role} onChange={(e) => updateMembre(i, "role", e.target.value)} placeholder="Rôle" className={inputCls} />
                  <button type="button" onClick={() => removeMembre(i)} className="px-2 py-2 rounded-xl text-dusk/40 hover:text-red-500 hover:bg-red-50 transition-all"><Trash size={14} /></button>
                </div>
              ))}
            </div>
            {config.sections.equipe.membres.length < 5 && (
              <button type="button" onClick={addMembre} className="flex items-center gap-1.5 text-xs text-dusk/55 hover:text-ambre transition-colors"><Plus size={14} />Ajouter</button>
            )}
          </SectionCard>

          {/* ── Contact ── */}
          <SectionCard title="Contact" icon="📞" defaultOpen={false}>
            <div className="flex items-center justify-between mb-4">
              <Toggle checked={config.sections.contact.visible}
                onChange={(v) => updateSection("contact", { visible: v })} label="Afficher" />
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <Toggle checked={config.sections.contact.telephone} onChange={(v) => updateSection("contact", { telephone: v })} label="Téléphone" />
                <Toggle checked={config.sections.contact.email} onChange={(v) => updateSection("contact", { email: v })} label="Email" />
                <Toggle checked={config.sections.contact.adresse} onChange={(v) => updateSection("contact", { adresse: v })} label="Adresse" />
              </div>
              <div>
                <FieldLabel>Horaires</FieldLabel>
                <Input value={config.sections.contact.horaires} onChange={(v) => updateSection("contact", { horaires: v })} placeholder="Lun-Ven : 8h-18h" />
              </div>
            </div>
          </SectionCard>

          {/* ── Typographie & Mise en page ── */}
          <SectionCard title="Typographie & mise en page" icon="🔤" defaultOpen={false}>
            <div className="mb-4">
              <FieldLabel>Police des titres</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {POLICES_TITRES.map((p) => (
                  <button key={p.value} type="button" onClick={() => updateTypo("police_titres", p.value as PoliceTitres)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                      config.typographie.police_titres === p.value ? "border-ambre bg-ambre/8 text-ambre" : "border-dusk/12 bg-dust text-dusk/60 hover:border-dusk/25"}`}
                    style={{ fontFamily: `'${p.value}', sans-serif` }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <FieldLabel>Taille des titres</FieldLabel>
              <ChipGroup<TailleTitres>
                value={config.typographie.taille_titres}
                onChange={(v) => updateTypo("taille_titres", v)}
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "grand", label: "Grand" },
                  { value: "tres_grand", label: "Très grand" },
                ]}
              />
            </div>

            <div className="mb-4">
              <FieldLabel>Séparateurs entre sections</FieldLabel>
              <ChipGroup<SeparateurStyle>
                value={config.separateurs}
                onChange={(v) => setConfig((c) => ({ ...c, separateurs: v }))}
                options={[
                  { value: "aucun", label: "Aucun" },
                  { value: "ligne", label: "Ligne" },
                  { value: "vague", label: "Vague" },
                  { value: "diagonale", label: "Diagonal" },
                  { value: "points", label: "Points" },
                  { value: "icone", label: "Icône" },
                ]}
              />
            </div>

            <div className="mb-4">
              <FieldLabel>Template</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {(["classique", "moderne", "minimaliste"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => updateMiseEnPage("template", t)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${config.mise_en_page.template === t ? "border-ambre bg-ambre/8 text-ambre" : "border-dusk/12 bg-dust text-dusk/60 hover:border-dusk/25"}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Style des cards</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {([["arrondi", "Arrondi"], ["carre", "Carré"], ["ombre", "Ombre"]] as const).map(([v, l]) => (
                  <button key={v} type="button" onClick={() => updateMiseEnPage("style_cards", v)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${config.mise_en_page.style_cards === v ? "border-ambre bg-ambre/8 text-ambre" : "border-dusk/12 bg-dust text-dusk/60 hover:border-dusk/25"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Reset */}
          <button type="button" onClick={handleReset}
            className="flex items-center gap-2 text-sm text-dusk/40 hover:text-red-500 transition-colors py-2">
            <ArrowCounterClockwise size={16} />Réinitialiser la configuration
          </button>
        </div>

        {/* Right: Preview */}
        <div className={`w-full lg:w-[58%] ${mobileTab === "edit" ? "hidden lg:block" : ""}`}>
          <div className="sticky top-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
              </div>
              <span className="text-xs text-dusk/40 font-mono">{profile.slug ? `/artisan/${profile.slug}` : "aperçu"}</span>
            </div>
            <div className="rounded-2xl border border-dusk/8 overflow-hidden shadow-sm bg-white max-h-[calc(100vh-180px)] overflow-y-auto">
              <VitrinePreview config={config} profile={profile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
