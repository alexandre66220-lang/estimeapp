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
} from "@phosphor-icons/react";
import { saveVitrineConfig, resetVitrineConfig } from "@/app/actions/vitrine";
import {
  DEFAULT_VITRINE_CONFIG,
  CERTIFICATIONS_DISPONIBLES,
  COULEURS_PREDEFINIES,
  mergeVitrineConfig,
  type VitrineConfig,
} from "@/lib/vitrine/defaults";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProfileInfo {
  prenom: string | null;
  nom: string | null;
  metier: string | null;
  ville: string | null;
  slug: string | null;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg" aria-hidden="true">{icon}</span>
        <h3 className="font-display text-base font-bold text-dusk">{title}</h3>
      </div>
      {children}
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
  return (
    <p className="text-xs font-medium text-dusk/55 mb-1.5">{children}</p>
  );
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

// ── Preview ───────────────────────────────────────────────────────────────────

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
  const fontClass =
    config.mise_en_page.police === "serif"
      ? "font-serif"
      : config.mise_en_page.police === "grotesque"
      ? "font-mono"
      : "";

  const cardRadius =
    config.mise_en_page.style_cards === "carre"
      ? "rounded-lg"
      : config.mise_en_page.style_cards === "ombre"
      ? "rounded-2xl shadow-md"
      : "rounded-2xl";

  const isModerne = config.mise_en_page.template === "moderne";
  const isMinimaliste = config.mise_en_page.template === "minimaliste";

  return (
    <div
      className={`bg-[#F8F5F2] min-h-[600px] text-[#2B2521] text-sm overflow-hidden ${fontClass}`}
      style={{ fontSize: "13px" }}
    >
      {/* Hero */}
      <header
        className={`${isModerne ? "py-10" : "py-6"} px-5 text-center border-b border-[#2B2521]/6 bg-white`}
        style={isModerne ? { backgroundColor: `${couleur}12` } : {}}
      >
        {/* Avatar placeholder */}
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: couleur }}
        >
          {((profile.prenom?.[0] ?? "") + (profile.nom?.[0] ?? "")).toUpperCase() || "A"}
        </div>

        <h1 className="font-bold text-base text-[#2B2521]">{artisanNom}</h1>
        {(profile.metier || profile.ville) && (
          <p className="text-xs text-[#2B2521]/50 mt-0.5">
            {[profile.metier, profile.ville && `📍 ${profile.ville}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        {config.hero.slogan && (
          <p
            className={`mt-3 font-semibold ${isMinimaliste ? "text-sm" : "text-base"}`}
            style={{ color: couleur }}
          >
            &ldquo;{config.hero.slogan}&rdquo;
          </p>
        )}

        <button
          className="mt-4 px-4 py-2 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: couleur }}
        >
          {config.hero.cta_texte || "Contactez-moi"}
        </button>
      </header>

      <div className="px-5 py-5 space-y-5">
        {/* À propos */}
        {config.sections.a_propos.visible && (
          <div className={`bg-white p-4 border border-[#2B2521]/6 ${cardRadius}`}>
            <p className="font-semibold text-xs text-[#2B2521]/50 mb-2 uppercase tracking-wider">
              À propos
            </p>
            {config.sections.a_propos.texte ? (
              <p className="text-[#2B2521]/70 leading-relaxed">
                {config.sections.a_propos.texte.slice(0, 120)}
                {config.sections.a_propos.texte.length > 120 ? "…" : ""}
              </p>
            ) : (
              <p className="text-[#2B2521]/30 italic">Votre présentation apparaîtra ici…</p>
            )}
            {config.sections.a_propos.specialites.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {config.sections.a_propos.specialites.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ backgroundColor: `${couleur}15`, color: couleur }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chantiers */}
        {config.sections.chantiers.visible && (
          <div>
            <p className="font-semibold text-xs text-[#2B2521]/50 mb-2 uppercase tracking-wider">
              Réalisations
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`aspect-square bg-[#E8E0D2] ${cardRadius}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Avis */}
        {config.sections.avis.visible && (
          <div>
            <p className="font-semibold text-xs text-[#2B2521]/50 mb-2 uppercase tracking-wider">
              Avis Google
            </p>
            <div className={`bg-white p-3 border border-[#2B2521]/6 ${cardRadius}`}>
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <span key={v} className="text-amber-400 text-xs">★</span>
                ))}
              </div>
              <div className="h-2 bg-[#E8E0D2] rounded w-3/4" />
              <div className="h-2 bg-[#E8E0D2] rounded w-1/2 mt-1" />
            </div>
          </div>
        )}

        {/* Certifications */}
        {config.sections.certifications.visible &&
          config.sections.certifications.liste.length > 0 && (
            <div>
              <p className="font-semibold text-xs text-[#2B2521]/50 mb-2 uppercase tracking-wider">
                Certifications
              </p>
              <div className="flex flex-wrap gap-1">
                {config.sections.certifications.liste.map((c) => (
                  <span
                    key={c}
                    className={`px-2 py-0.5 text-[10px] font-medium bg-[#2B2521]/5 text-[#2B2521]/70 border border-[#2B2521]/8 ${cardRadius}`}
                  >
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Tarifs */}
        {config.sections.tarifs.visible && config.sections.tarifs.lignes.length > 0 && (
          <div>
            <p className="font-semibold text-xs text-[#2B2521]/50 mb-2 uppercase tracking-wider">
              Tarifs
            </p>
            <div className="space-y-1.5">
              {config.sections.tarifs.lignes.map((l, i) => (
                <div
                  key={i}
                  className={`bg-white p-3 border border-[#2B2521]/6 flex justify-between ${cardRadius}`}
                >
                  <span className="text-[#2B2521]/70">{l.description || "—"}</span>
                  <span className="font-semibold" style={{ color: couleur }}>
                    {l.prix || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Équipe */}
        {config.sections.equipe.visible && config.sections.equipe.membres.length > 0 && (
          <div>
            <p className="font-semibold text-xs text-[#2B2521]/50 mb-2 uppercase tracking-wider">
              L&apos;équipe
            </p>
            <div className="flex flex-wrap gap-2">
              {config.sections.equipe.membres.map((m, i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: couleur }}
                  >
                    {m.prenom?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <p className="text-[10px] mt-1 font-medium">{m.prenom || "Prénom"}</p>
                  <p className="text-[9px] text-[#2B2521]/50">{m.role || "Rôle"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {config.sections.contact.visible && (
          <div className={`bg-white p-4 border border-[#2B2521]/6 ${cardRadius}`}>
            <p className="font-semibold text-xs text-[#2B2521]/50 mb-2 uppercase tracking-wider">
              Contact
            </p>
            <div className="space-y-1">
              {config.sections.contact.telephone && (
                <p className="text-xs text-[#2B2521]/60">📞 Téléphone</p>
              )}
              {config.sections.contact.email && (
                <p className="text-xs text-[#2B2521]/60">✉️ Email</p>
              )}
              {config.sections.contact.horaires && (
                <p className="text-xs text-[#2B2521]/60">
                  🕐 {config.sections.contact.horaires}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#2B2521]/6 bg-white px-5 py-4 text-center">
        <p className="text-[10px] text-[#2B2521]/40">
          Propulsé par{" "}
          <span className="font-semibold" style={{ color: couleur }}>
            Estime
          </span>
        </p>
      </footer>
    </div>
  );
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
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const updateHero = useCallback(
    <K extends keyof VitrineConfig["hero"]>(key: K, value: VitrineConfig["hero"][K]) => {
      setConfig((c) => ({ ...c, hero: { ...c.hero, [key]: value } }));
    },
    []
  );

  const updateSection = useCallback(
    <S extends keyof VitrineConfig["sections"]>(
      section: S,
      patch: Partial<VitrineConfig["sections"][S]>
    ) => {
      setConfig((c) => ({
        ...c,
        sections: {
          ...c.sections,
          [section]: { ...c.sections[section], ...patch },
        },
      }));
    },
    []
  );

  const updateMiseEnPage = useCallback(
    <K extends keyof VitrineConfig["mise_en_page"]>(
      key: K,
      value: VitrineConfig["mise_en_page"][K]
    ) => {
      setConfig((c) => ({ ...c, mise_en_page: { ...c.mise_en_page, [key]: value } }));
    },
    []
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
    } catch {
      // silencieux
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

  const addSpecialite = useCallback(() => {
    const val = specialiteInput.trim();
    if (!val || config.sections.a_propos.specialites.includes(val)) return;
    updateSection("a_propos", {
      specialites: [...config.sections.a_propos.specialites, val],
    });
    setSpecialiteInput("");
  }, [specialiteInput, config.sections.a_propos.specialites, updateSection]);

  const removeSpecialite = useCallback(
    (s: string) => {
      updateSection("a_propos", {
        specialites: config.sections.a_propos.specialites.filter((x) => x !== s),
      });
    },
    [config.sections.a_propos.specialites, updateSection]
  );

  const addTarifLigne = useCallback(() => {
    updateSection("tarifs", {
      lignes: [...config.sections.tarifs.lignes, { description: "", prix: "" }],
    });
  }, [config.sections.tarifs.lignes, updateSection]);

  const updateTarifLigne = useCallback(
    (i: number, field: "description" | "prix", value: string) => {
      const lignes = [...config.sections.tarifs.lignes];
      lignes[i] = { ...lignes[i], [field]: value };
      updateSection("tarifs", { lignes });
    },
    [config.sections.tarifs.lignes, updateSection]
  );

  const removeTarifLigne = useCallback(
    (i: number) => {
      updateSection("tarifs", {
        lignes: config.sections.tarifs.lignes.filter((_, idx) => idx !== i),
      });
    },
    [config.sections.tarifs.lignes, updateSection]
  );

  const addMembreEquipe = useCallback(() => {
    if (config.sections.equipe.membres.length >= 5) return;
    updateSection("equipe", {
      membres: [...config.sections.equipe.membres, { prenom: "", role: "" }],
    });
  }, [config.sections.equipe.membres, updateSection]);

  const updateMembre = useCallback(
    (i: number, field: "prenom" | "role", value: string) => {
      const membres = [...config.sections.equipe.membres];
      membres[i] = { ...membres[i], [field]: value };
      updateSection("equipe", { membres });
    },
    [config.sections.equipe.membres, updateSection]
  );

  const removeMembre = useCallback(
    (i: number) => {
      updateSection("equipe", {
        membres: config.sections.equipe.membres.filter((_, idx) => idx !== i),
      });
    },
    [config.sections.equipe.membres, updateSection]
  );

  const toggleCertification = useCallback(
    (certif: string) => {
      const liste = config.sections.certifications.liste;
      updateSection("certifications", {
        liste: liste.includes(certif) ? liste.filter((c) => c !== certif) : [...liste, certif],
      });
    },
    [config.sections.certifications.liste, updateSection]
  );

  // ── Editor panels ──────────────────────────────────────────────────────────

  const EditorPanel = (
    <div className="space-y-4 overflow-y-auto">

      {/* Section Hero */}
      <SectionCard title="Hero & identité" icon="🎨">
        {/* Slogan */}
        <div className="mb-4">
          <FieldLabel>Slogan ({config.hero.slogan.length}/100)</FieldLabel>
          <Textarea
            value={config.hero.slogan}
            onChange={(v) => updateHero("slogan", v.slice(0, 100))}
            placeholder="Ex : Votre maison mérite le meilleur…"
            maxLength={100}
            rows={2}
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateSlogan}
              disabled={isGeneratingSlogan}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-ambre/10 text-ambre hover:bg-ambre/20 disabled:opacity-50 transition-all"
            >
              {isGeneratingSlogan ? (
                <SpinnerGap size={12} className="animate-spin" />
              ) : (
                <Sparkle size={12} weight="fill" />
              )}
              Générer avec l&apos;IA
            </button>
          </div>
          {slogansProposés.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {slogansProposés.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    updateHero("slogan", s);
                    setSlogansProposés([]);
                  }}
                  className="w-full text-left text-xs px-3 py-2 rounded-xl border border-ambre/25 bg-ambre/5 text-dusk hover:bg-ambre/10 transition-all"
                >
                  &ldquo;{s}&rdquo;
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Couleur principale */}
        <div className="mb-4">
          <FieldLabel>Couleur principale</FieldLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {COULEURS_PREDEFINIES.map((c) => (
              <button
                key={c.hex}
                type="button"
                title={c.label}
                onClick={() => updateHero("couleur_principale", c.hex)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  config.hero.couleur_principale === c.hex
                    ? "border-dusk scale-110 shadow-sm"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.hero.couleur_principale}
              onChange={(e) => updateHero("couleur_principale", e.target.value)}
              className="w-8 h-8 rounded-lg border border-dusk/15 cursor-pointer bg-transparent"
            />
            <span className="text-xs text-dusk/50 font-mono">{config.hero.couleur_principale}</span>
          </div>
        </div>

        {/* Couleur secondaire */}
        <div className="mb-4">
          <FieldLabel>Couleur secondaire</FieldLabel>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.hero.couleur_secondaire}
              onChange={(e) => updateHero("couleur_secondaire", e.target.value)}
              className="w-8 h-8 rounded-lg border border-dusk/15 cursor-pointer bg-transparent"
            />
            <span className="text-xs text-dusk/50 font-mono">{config.hero.couleur_secondaire}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Texte du bouton CTA</FieldLabel>
            <SelectField
              value={config.hero.cta_texte}
              onChange={(v) => updateHero("cta_texte", v)}
              options={[
                { value: "Demandez un devis", label: "Demandez un devis" },
                { value: "Contactez-moi", label: "Contactez-moi" },
                { value: "Appelez-moi", label: "Appelez-moi" },
                { value: "Prenez rendez-vous", label: "Prenez rendez-vous" },
              ]}
            />
          </div>
          <div>
            <FieldLabel>Action du CTA</FieldLabel>
            <SelectField
              value={config.hero.cta_action}
              onChange={(v) => updateHero("cta_action", v as "formulaire" | "telephone" | "email")}
              options={[
                { value: "formulaire", label: "Formulaire" },
                { value: "telephone", label: "Téléphone" },
                { value: "email", label: "Email" },
              ]}
            />
          </div>
        </div>
      </SectionCard>

      {/* Section À propos */}
      <SectionCard title="À propos" icon="👷">
        <div className="flex items-center justify-between mb-3">
          <Toggle
            checked={config.sections.a_propos.visible}
            onChange={(v) => updateSection("a_propos", { visible: v })}
            label="Afficher la section"
          />
        </div>

        <div className="mb-3">
          <FieldLabel>
            Présentation ({config.sections.a_propos.texte.length}/500)
          </FieldLabel>
          <Textarea
            value={config.sections.a_propos.texte}
            onChange={(v) => updateSection("a_propos", { texte: v.slice(0, 500) })}
            placeholder="Décrivez votre activité, vos valeurs, votre expérience…"
            maxLength={500}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <FieldLabel>Année de début d&apos;activité</FieldLabel>
            <Input
              type="number"
              value={config.sections.a_propos.annees_experience?.toString() ?? ""}
              onChange={(v) =>
                updateSection("a_propos", {
                  annees_experience: v ? parseInt(v) : null,
                })
              }
              placeholder="Ex : 2008"
            />
          </div>
          <div>
            <FieldLabel>Zone d&apos;intervention</FieldLabel>
            <Input
              value={config.sections.a_propos.zone_intervention}
              onChange={(v) => updateSection("a_propos", { zone_intervention: v })}
              placeholder="Paris, Versailles…"
            />
          </div>
        </div>

        <div>
          <FieldLabel>Spécialités (tags)</FieldLabel>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={specialiteInput}
              onChange={(e) => setSpecialiteInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialite())}
              placeholder="Ex : Rénovation, Carrelage…"
              className="flex-1 px-3 py-2 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 transition-all"
            />
            <button
              type="button"
              onClick={addSpecialite}
              className="px-3 py-2 rounded-xl bg-ambre/10 text-ambre hover:bg-ambre/20 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
          {config.sections.a_propos.specialites.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {config.sections.a_propos.specialites.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ambre/10 text-ambre text-xs font-medium"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSpecialite(s)}
                    className="hover:text-braise transition-colors"
                    aria-label={`Supprimer ${s}`}
                  >
                    <Trash size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Section Chantiers */}
      <SectionCard title="Chantiers réalisés" icon="🏗️">
        <div className="flex items-center justify-between mb-4">
          <Toggle
            checked={config.sections.chantiers.visible}
            onChange={(v) => updateSection("chantiers", { visible: v })}
            label="Afficher la section"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Nombre à afficher</FieldLabel>
            <SelectField
              value={String(config.sections.chantiers.nombre)}
              onChange={(v) => updateSection("chantiers", { nombre: parseInt(v) })}
              options={[
                { value: "3", label: "3 chantiers" },
                { value: "6", label: "6 chantiers" },
                { value: "9", label: "9 chantiers" },
                { value: "12", label: "12 chantiers" },
              ]}
            />
          </div>
          <div>
            <FieldLabel>Disposition</FieldLabel>
            <SelectField
              value={config.sections.chantiers.disposition}
              onChange={(v) => updateSection("chantiers", { disposition: v as "grille" | "liste" })}
              options={[
                { value: "grille", label: "Grille" },
                { value: "liste", label: "Liste" },
              ]}
            />
          </div>
        </div>
      </SectionCard>

      {/* Section Avis */}
      <SectionCard title="Avis Google" icon="⭐">
        <div className="flex items-center justify-between mb-4">
          <Toggle
            checked={config.sections.avis.visible}
            onChange={(v) => updateSection("avis", { visible: v })}
            label="Afficher la section"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Nombre à afficher</FieldLabel>
            <SelectField
              value={String(config.sections.avis.nombre)}
              onChange={(v) => updateSection("avis", { nombre: parseInt(v) })}
              options={[
                { value: "3", label: "3 avis" },
                { value: "5", label: "5 avis" },
                { value: "10", label: "10 avis" },
              ]}
            />
          </div>
          <div>
            <FieldLabel>Style d&apos;affichage</FieldLabel>
            <SelectField
              value={config.sections.avis.style}
              onChange={(v) => updateSection("avis", { style: v as "cards" | "compact" })}
              options={[
                { value: "cards", label: "Cards" },
                { value: "compact", label: "Compact" },
              ]}
            />
          </div>
        </div>
      </SectionCard>

      {/* Certifications */}
      <SectionCard title="Certifications" icon="🏅">
        <div className="flex items-center justify-between mb-4">
          <Toggle
            checked={config.sections.certifications.visible}
            onChange={(v) => updateSection("certifications", { visible: v })}
            label="Afficher la section"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CERTIFICATIONS_DISPONIBLES.map((certif) => {
            const checked = config.sections.certifications.liste.includes(certif);
            return (
              <button
                key={certif}
                type="button"
                onClick={() => toggleCertification(certif)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all ${
                  checked
                    ? "border-ambre/40 bg-ambre/8 text-ambre"
                    : "border-dusk/12 bg-dust text-dusk/60 hover:border-dusk/25"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                    checked ? "bg-ambre" : "bg-dusk/15"
                  }`}
                >
                  {checked && <Check size={10} weight="bold" className="text-white" />}
                </div>
                {certif}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Tarifs */}
      <SectionCard title="Tarifs" icon="💶">
        <div className="flex items-center justify-between mb-4">
          <Toggle
            checked={config.sections.tarifs.visible}
            onChange={(v) => updateSection("tarifs", { visible: v })}
            label="Afficher la section"
          />
        </div>
        <div className="space-y-2 mb-3">
          {config.sections.tarifs.lignes.map((ligne, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={ligne.description}
                onChange={(e) => updateTarifLigne(i, "description", e.target.value)}
                placeholder="Description"
                className="flex-1 px-3 py-2 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 transition-all"
              />
              <input
                type="text"
                value={ligne.prix}
                onChange={(e) => updateTarifLigne(i, "prix", e.target.value)}
                placeholder="Prix"
                className="w-24 px-3 py-2 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 transition-all"
              />
              <button
                type="button"
                onClick={() => removeTarifLigne(i)}
                className="px-2 py-2 rounded-xl text-dusk/40 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
        {config.sections.tarifs.lignes.length < 6 && (
          <button
            type="button"
            onClick={addTarifLigne}
            className="flex items-center gap-1.5 text-xs text-dusk/55 hover:text-ambre transition-colors"
          >
            <Plus size={14} />
            Ajouter une ligne
          </button>
        )}
      </SectionCard>

      {/* Équipe */}
      <SectionCard title="Mon équipe" icon="👥">
        <div className="flex items-center justify-between mb-4">
          <Toggle
            checked={config.sections.equipe.visible}
            onChange={(v) => updateSection("equipe", { visible: v })}
            label="Afficher la section"
          />
        </div>
        <div className="space-y-2 mb-3">
          {config.sections.equipe.membres.map((membre, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={membre.prenom}
                onChange={(e) => updateMembre(i, "prenom", e.target.value)}
                placeholder="Prénom"
                className="flex-1 px-3 py-2 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 transition-all"
              />
              <input
                type="text"
                value={membre.role}
                onChange={(e) => updateMembre(i, "role", e.target.value)}
                placeholder="Rôle"
                className="flex-1 px-3 py-2 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 transition-all"
              />
              <button
                type="button"
                onClick={() => removeMembre(i)}
                className="px-2 py-2 rounded-xl text-dusk/40 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
        {config.sections.equipe.membres.length < 5 && (
          <button
            type="button"
            onClick={addMembreEquipe}
            className="flex items-center gap-1.5 text-xs text-dusk/55 hover:text-ambre transition-colors"
          >
            <Plus size={14} />
            Ajouter un membre
          </button>
        )}
      </SectionCard>

      {/* Contact */}
      <SectionCard title="Contact" icon="📞">
        <div className="flex items-center justify-between mb-4">
          <Toggle
            checked={config.sections.contact.visible}
            onChange={(v) => updateSection("contact", { visible: v })}
            label="Afficher le formulaire"
          />
        </div>
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <Toggle
              checked={config.sections.contact.telephone}
              onChange={(v) => updateSection("contact", { telephone: v })}
              label="Afficher le téléphone"
            />
            <Toggle
              checked={config.sections.contact.email}
              onChange={(v) => updateSection("contact", { email: v })}
              label="Afficher l'email"
            />
            <Toggle
              checked={config.sections.contact.adresse}
              onChange={(v) => updateSection("contact", { adresse: v })}
              label="Afficher l'adresse"
            />
          </div>
          <div>
            <FieldLabel>Horaires</FieldLabel>
            <Input
              value={config.sections.contact.horaires}
              onChange={(v) => updateSection("contact", { horaires: v })}
              placeholder="Lun-Ven : 8h-18h"
            />
          </div>
          <div>
            <FieldLabel>Message de confirmation</FieldLabel>
            <Textarea
              value={config.sections.contact.message_confirmation}
              onChange={(v) => updateSection("contact", { message_confirmation: v })}
              placeholder="Message après envoi du formulaire…"
              rows={2}
            />
          </div>
        </div>
      </SectionCard>

      {/* Mise en page */}
      <SectionCard title="Mise en page" icon="🖼️">
        <div className="space-y-4">
          <div>
            <FieldLabel>Template</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "classique", label: "Classique", desc: "Sections verticales" },
                  { value: "moderne", label: "Moderne", desc: "Hero plein écran" },
                  { value: "minimaliste", label: "Minimaliste", desc: "Sobre et épuré" },
                ] as const
              ).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => updateMiseEnPage("template", t.value)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    config.mise_en_page.template === t.value
                      ? "border-ambre bg-ambre/8 text-ambre"
                      : "border-dusk/12 bg-dust text-dusk/60 hover:border-dusk/25"
                  }`}
                >
                  <p className="text-xs font-semibold">{t.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-70">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Police</FieldLabel>
            <SelectField
              value={config.mise_en_page.police}
              onChange={(v) => updateMiseEnPage("police", v as "sans-serif" | "serif" | "grotesque")}
              options={[
                { value: "sans-serif", label: "Sans-serif moderne" },
                { value: "serif", label: "Serif élégant" },
                { value: "grotesque", label: "Grotesque contemporain" },
              ]}
            />
          </div>

          <div>
            <FieldLabel>Style des cards</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "arrondi", label: "Arrondi" },
                  { value: "carre", label: "Carré" },
                  { value: "ombre", label: "Ombre portée" },
                ] as const
              ).map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => updateMiseEnPage("style_cards", s.value)}
                  className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                    config.mise_en_page.style_cards === s.value
                      ? "border-ambre bg-ambre/8 text-ambre"
                      : "border-dusk/12 bg-dust text-dusk/60 hover:border-dusk/25"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Reset */}
      <button
        type="button"
        onClick={handleReset}
        className="flex items-center gap-2 text-sm text-dusk/40 hover:text-red-500 transition-colors py-2"
      >
        <ArrowCounterClockwise size={16} />
        Réinitialiser la configuration
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-dusk">Ma vitrine</h1>
          <p className="text-dusk/50 text-sm mt-0.5">
            Personnalisez votre page publique{" "}
            {profile.slug && (
              <a
                href={`/artisan/${profile.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ambre hover:underline inline-flex items-center gap-1"
              >
                /artisan/{profile.slug}
                <ArrowSquareOut size={12} />
              </a>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status */}
          <span
            className={`text-xs font-medium transition-all ${
              saveStatus === "saving"
                ? "text-dusk/40"
                : saveStatus === "saved"
                ? "text-emerald-600"
                : saveStatus === "error"
                ? "text-red-500"
                : "opacity-0"
            }`}
          >
            {saveStatus === "saving" && "Sauvegarde…"}
            {saveStatus === "saved" && "✓ Sauvegardé"}
            {saveStatus === "error" && "Erreur de sauvegarde"}
          </span>

          {profile.slug && (
            <a
              href={`/artisan/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border border-dusk/20 text-dusk hover:bg-dusk/5 transition-all"
            >
              <Eye size={16} />
              Voir en ligne
              <ArrowSquareOut size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden flex gap-1 mb-4 p-1 bg-dust rounded-xl">
        <button
          type="button"
          onClick={() => setMobileTab("edit")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all ${
            mobileTab === "edit"
              ? "bg-white text-dusk shadow-sm"
              : "text-dusk/55 hover:text-dusk"
          }`}
        >
          <PencilSimple size={15} />
          Éditer
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all ${
            mobileTab === "preview"
              ? "bg-white text-dusk shadow-sm"
              : "text-dusk/55 hover:text-dusk"
          }`}
        >
          <Eye size={15} />
          Aperçu
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Editor */}
        <div
          className={`w-full lg:w-[42%] ${
            mobileTab === "preview" ? "hidden lg:block" : ""
          }`}
        >
          {EditorPanel}
        </div>

        {/* Right: Preview */}
        <div
          className={`w-full lg:w-[58%] ${
            mobileTab === "edit" ? "hidden lg:block" : ""
          }`}
        >
          <div className="sticky top-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
              </div>
              <span className="text-xs text-dusk/40 font-mono">
                {profile.slug ? `/artisan/${profile.slug}` : "aperçu"}
              </span>
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
