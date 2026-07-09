// ── Types ─────────────────────────────────────────────────────────────────────

export type CtaAction = "formulaire" | "telephone" | "email";
export type VitrineTemplate = "classique" | "moderne" | "minimaliste";
export type VitrinePolice = "sans-serif" | "serif" | "grotesque";
export type VitrineStyleCards = "arrondi" | "carre" | "ombre";
export type HeroStyle = "plein_ecran" | "grand" | "compact";
export type HeroOverlay = "aucun" | "sombre" | "colore" | "degrade";
export type FormeTransition = "droite" | "vague" | "vague_angulaire" | "diagonale" | "courbe";
export type FondTexture = "aucune" | "beton" | "enduit" | "bois" | "papier" | "toile" | "geometrique";
export type DecorationLaterale = "aucune" | "bordure" | "bande" | "watermark";
export type SeparateurStyle = "aucun" | "ligne" | "vague" | "diagonale" | "points" | "icone";
export type PoliceTitres =
  | "Inter"
  | "Playfair Display"
  | "Montserrat"
  | "Raleway"
  | "Oswald"
  | "Merriweather"
  | "Poppins"
  | "Space Grotesk";
export type TailleTitres = "normal" | "grand" | "tres_grand";

export type PositionTexteHero = "centre" | "gauche" | "bas_gauche";
export type AnimEffet = "aucun" | "fondu" | "glissement_gauche" | "glissement_droite" | "zoom" | "rebond";
export type AnimIntensite = 1 | 2 | 3;
export type OmbreStyle = "aucune" | "legere" | "normale" | "prononcee";
export type BoutonForme = "pill" | "arrondi" | "carre";
export type BoutonStyle = "plein" | "contour" | "fantome";
export type BoutonTaille = "petit" | "moyen" | "grand";

export type AnimSectionKey =
  | "hero"
  | "chiffres_cles"
  | "chantiers"
  | "temoignage_vedette"
  | "faq"
  | "certifications_ruban"
  | "video"
  | "contact";

export interface AnimSectionConfig {
  effet: AnimEffet;
  intensite: AnimIntensite;
}

export interface VitrineConfig {
  couleurs: {
    principale: string;
    secondaire: string;
    accent: string;
    // Non exposé directement dans l'éditeur (3 pickers seulement), utilisé par les thèmes prédéfinis
    fond?: string;
  };
  animations: Record<AnimSectionKey, AnimSectionConfig>;
  cards: {
    rayon: number;
    ombre: OmbreStyle;
    bordure_active: boolean;
    bordure_epaisseur: 1 | 2 | 3;
    bordure_couleur: string;
    espacement_sections: number;
  };
  boutons: {
    forme: BoutonForme;
    style: BoutonStyle;
    taille: BoutonTaille;
    icone: boolean;
  };
  hero: {
    slogan: string;
    photo_couverture: string;
    couleur_principale: string;
    couleur_secondaire: string;
    cta_texte: string;
    cta_action: CtaAction;
    // new
    style: HeroStyle;
    overlay_couleur: HeroOverlay;
    overlay_opacite: number;
    forme_transition: FormeTransition;
    parallaxe: boolean;
    compteurs_hero: boolean;
    compteurs_position: "bas" | "overlay";
    // hero avancé
    video_url: string;
    overlay_degrade_couleur: string;
    overlay_degrade_opacite: number;
    position_texte: PositionTexteHero;
  };
  fond: {
    type: "uni" | "degrade" | "texture";
    texture: FondTexture;
    decorations_laterales: DecorationLaterale;
  };
  sections: {
    a_propos: {
      visible: boolean;
      texte: string;
      annees_experience: number | null;
      zone_intervention: string;
      specialites: string[];
    };
    chantiers: {
      visible: boolean;
      nombre: number;
      disposition: "grille" | "liste";
    };
    avis: {
      visible: boolean;
      nombre: number;
      style: "cards" | "compact";
    };
    certifications: {
      visible: boolean;
      liste: string[];
    };
    tarifs: {
      visible: boolean;
      lignes: Array<{ description: string; prix: string }>;
    };
    equipe: {
      visible: boolean;
      membres: Array<{ prenom: string; role: string }>;
    };
    contact: {
      visible: boolean;
      telephone: boolean;
      email: boolean;
      adresse: boolean;
      horaires: string;
      message_confirmation: string;
    };
    // new
    chiffres_cles: {
      visible: boolean;
      style: "cards" | "bande";
      satisfaction: number;
    };
    temoignage_vedette: {
      visible: boolean;
      texte_custom: string;
      auteur_custom: string;
      note: number;
    };
    certifications_ruban: {
      visible: boolean;
    };
    faq: {
      visible: boolean;
      items: Array<{ question: string; reponse: string }>;
    };
    video: {
      visible: boolean;
      url: string;
    };
  };
  separateurs: SeparateurStyle;
  typographie: {
    police_titres: PoliceTitres;
    taille_titres: TailleTitres;
  };
  mise_en_page: {
    template: VitrineTemplate;
    police: VitrinePolice;
    style_cards: VitrineStyleCards;
  };
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_VITRINE_CONFIG: VitrineConfig = {
  couleurs: {
    principale: "#C75D3B",
    secondaire: "#2B2521",
    accent: "#C75D3B",
    fond: "#F8F5F2",
  },
  animations: {
    hero: { effet: "fondu", intensite: 2 },
    chiffres_cles: { effet: "fondu", intensite: 2 },
    chantiers: { effet: "fondu", intensite: 2 },
    temoignage_vedette: { effet: "fondu", intensite: 2 },
    faq: { effet: "fondu", intensite: 2 },
    certifications_ruban: { effet: "aucun", intensite: 2 },
    video: { effet: "fondu", intensite: 2 },
    contact: { effet: "fondu", intensite: 2 },
  },
  cards: {
    rayon: 16,
    ombre: "aucune",
    bordure_active: true,
    bordure_epaisseur: 1,
    bordure_couleur: "#2B25210F",
    espacement_sections: 56,
  },
  boutons: {
    forme: "pill",
    style: "plein",
    taille: "moyen",
    icone: false,
  },
  hero: {
    slogan: "",
    photo_couverture: "",
    couleur_principale: "#C75D3B",
    couleur_secondaire: "#2B2521",
    cta_texte: "Demandez un devis",
    cta_action: "formulaire",
    style: "grand",
    overlay_couleur: "sombre",
    overlay_opacite: 30,
    forme_transition: "vague",
    parallaxe: false,
    compteurs_hero: false,
    compteurs_position: "bas",
    video_url: "",
    overlay_degrade_couleur: "#000000",
    overlay_degrade_opacite: 40,
    position_texte: "centre",
  },
  fond: {
    type: "uni",
    texture: "aucune",
    decorations_laterales: "aucune",
  },
  sections: {
    a_propos: {
      visible: true,
      texte: "",
      annees_experience: null,
      zone_intervention: "",
      specialites: [],
    },
    chantiers: { visible: true, nombre: 6, disposition: "grille" },
    avis: { visible: true, nombre: 5, style: "cards" },
    certifications: { visible: true, liste: [] },
    tarifs: { visible: false, lignes: [] },
    equipe: { visible: false, membres: [] },
    contact: {
      visible: true,
      telephone: true,
      email: true,
      adresse: false,
      horaires: "",
      message_confirmation:
        "Merci pour votre message, je vous répondrai dans les plus brefs délais.",
    },
    chiffres_cles: { visible: false, style: "bande", satisfaction: 98 },
    temoignage_vedette: {
      visible: false,
      texte_custom: "",
      auteur_custom: "",
      note: 5,
    },
    certifications_ruban: { visible: false },
    faq: { visible: false, items: [] },
    video: { visible: false, url: "" },
  },
  separateurs: "vague",
  typographie: {
    police_titres: "Inter",
    taille_titres: "normal",
  },
  mise_en_page: {
    template: "classique",
    police: "sans-serif",
    style_cards: "arrondi",
  },
};

// ── Merge helper ──────────────────────────────────────────────────────────────

export function mergeVitrineConfig(stored: unknown): VitrineConfig {
  if (!stored || typeof stored !== "object") return structuredClone(DEFAULT_VITRINE_CONFIG);
  const s = stored as Partial<VitrineConfig>;
  const ds = DEFAULT_VITRINE_CONFIG.sections;
  const ss: Partial<VitrineConfig["sections"]> = s.sections ?? {};
  const da = DEFAULT_VITRINE_CONFIG.animations;
  const sa: Partial<VitrineConfig["animations"]> = s.animations ?? {};
  return {
    couleurs: { ...DEFAULT_VITRINE_CONFIG.couleurs, ...(s.couleurs ?? {}) },
    animations: {
      hero: { ...da.hero, ...(sa.hero ?? {}) },
      chiffres_cles: { ...da.chiffres_cles, ...(sa.chiffres_cles ?? {}) },
      chantiers: { ...da.chantiers, ...(sa.chantiers ?? {}) },
      temoignage_vedette: { ...da.temoignage_vedette, ...(sa.temoignage_vedette ?? {}) },
      faq: { ...da.faq, ...(sa.faq ?? {}) },
      certifications_ruban: { ...da.certifications_ruban, ...(sa.certifications_ruban ?? {}) },
      video: { ...da.video, ...(sa.video ?? {}) },
      contact: { ...da.contact, ...(sa.contact ?? {}) },
    },
    cards: { ...DEFAULT_VITRINE_CONFIG.cards, ...(s.cards ?? {}) },
    boutons: { ...DEFAULT_VITRINE_CONFIG.boutons, ...(s.boutons ?? {}) },
    hero: { ...DEFAULT_VITRINE_CONFIG.hero, ...(s.hero ?? {}) },
    fond: { ...DEFAULT_VITRINE_CONFIG.fond, ...(s.fond ?? {}) },
    sections: {
      a_propos: { ...ds.a_propos, ...(ss.a_propos ?? {}) },
      chantiers: { ...ds.chantiers, ...(ss.chantiers ?? {}) },
      avis: { ...ds.avis, ...(ss.avis ?? {}) },
      certifications: { ...ds.certifications, ...(ss.certifications ?? {}) },
      tarifs: { ...ds.tarifs, ...(ss.tarifs ?? {}) },
      equipe: { ...ds.equipe, ...(ss.equipe ?? {}) },
      contact: { ...ds.contact, ...(ss.contact ?? {}) },
      chiffres_cles: { ...ds.chiffres_cles, ...(ss.chiffres_cles ?? {}) },
      temoignage_vedette: { ...ds.temoignage_vedette, ...(ss.temoignage_vedette ?? {}) },
      certifications_ruban: { ...ds.certifications_ruban, ...(ss.certifications_ruban ?? {}) },
      faq: { ...ds.faq, ...(ss.faq ?? {}) },
      video: { ...ds.video, ...(ss.video ?? {}) },
    },
    separateurs: s.separateurs ?? DEFAULT_VITRINE_CONFIG.separateurs,
    typographie: { ...DEFAULT_VITRINE_CONFIG.typographie, ...(s.typographie ?? {}) },
    mise_en_page: { ...DEFAULT_VITRINE_CONFIG.mise_en_page, ...(s.mise_en_page ?? {}) },
  };
}

// ── Static data ───────────────────────────────────────────────────────────────

export const CERTIFICATIONS_DISPONIBLES = [
  "RGE",
  "Qualibat",
  "Handibat",
  "Assurance décennale",
  "Qualipac",
  "QualiPV",
  "Qualifelec",
  "Eco-artisan",
];

export const COULEURS_PREDEFINIES = [
  { hex: "#C75D3B", label: "Terre cuite" },
  { hex: "#385144", label: "Forêt" },
  { hex: "#2D4A6B", label: "Marine" },
  { hex: "#7B2D3E", label: "Bordeaux" },
  { hex: "#C8922A", label: "Or" },
  { hex: "#3D3D3D", label: "Anthracite" },
  { hex: "#1A6B5A", label: "Émeraude" },
  { hex: "#5B3A8C", label: "Violet" },
];

export const POLICES_TITRES: Array<{ value: PoliceTitres; label: string; style: string }> = [
  { value: "Inter", label: "Inter", style: "font-family: Inter, sans-serif" },
  { value: "Playfair Display", label: "Playfair Display", style: "font-family: 'Playfair Display', serif" },
  { value: "Montserrat", label: "Montserrat", style: "font-family: Montserrat, sans-serif" },
  { value: "Raleway", label: "Raleway", style: "font-family: Raleway, sans-serif" },
  { value: "Oswald", label: "Oswald", style: "font-family: Oswald, sans-serif" },
  { value: "Merriweather", label: "Merriweather", style: "font-family: Merriweather, serif" },
  { value: "Poppins", label: "Poppins", style: "font-family: Poppins, sans-serif" },
  { value: "Space Grotesk", label: "Space Grotesk", style: "font-family: 'Space Grotesk', sans-serif" },
];

export function googleFontsUrl(police: PoliceTitres): string {
  const families: Record<PoliceTitres, string> = {
    "Inter": "Inter:wght@400;600;700;800",
    "Playfair Display": "Playfair+Display:wght@400;600;700;800",
    "Montserrat": "Montserrat:wght@400;600;700;800",
    "Raleway": "Raleway:wght@400;600;700;800",
    "Oswald": "Oswald:wght@400;600;700",
    "Merriweather": "Merriweather:wght@400;700",
    "Poppins": "Poppins:wght@400;600;700;800",
    "Space Grotesk": "Space+Grotesk:wght@400;600;700",
  };
  return `https://fonts.googleapis.com/css2?family=${families[police]}&display=swap`;
}

export function textureCSS(texture: FondTexture, couleur: string): string {
  const hex = couleur.replace("#", "");
  switch (texture) {
    case "beton":
      return `background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");`;
    case "enduit":
      return `background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.4' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");`;
    case "bois":
      return `background-image: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139,90,43,0.035) 3px, rgba(139,90,43,0.035) 4px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(139,90,43,0.02) 60px, rgba(139,90,43,0.02) 62px);`;
    case "papier":
      return `background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");`;
    case "toile":
      return `background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.018) 0px, rgba(0,0,0,0.018) 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.018) 0px, rgba(0,0,0,0.018) 1px, transparent 1px, transparent 12px);`;
    case "geometrique":
      return `background-image: linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px); background-size: 28px 28px;`;
    default:
      return "";
  }
}

export function heroHeightCSS(style: HeroStyle): string {
  switch (style) {
    case "plein_ecran": return "min-height: 100svh";
    case "grand": return "min-height: 70vh";
    case "compact": return "min-height: 50vh";
  }
}

export function waveTransitionSVG(style: FormeTransition, fillColor: string): string {
  const fill = encodeURIComponent(fillColor);
  switch (style) {
    case "vague":
      return `<svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="${fill}"/></svg>`;
    case "vague_angulaire":
      return `<svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,0 L720,60 L1440,0 L1440,60 L0,60 Z" fill="${fill}"/></svg>`;
    case "diagonale":
      return `<svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,0 L1440,60 L1440,60 L0,60 Z" fill="${fill}"/></svg>`;
    case "courbe":
      return `<svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><ellipse cx="720" cy="80" rx="900" ry="80" fill="${fill}"/></svg>`;
    default:
      return "";
  }
}

export function separateurSVG(style: SeparateurStyle, couleur: string): string {
  const fill = encodeURIComponent(couleur + "20");
  switch (style) {
    case "vague":
      return `url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,10 C360,20 1080,0 1440,10' stroke='${encodeURIComponent(couleur)}' stroke-width='1.5' fill='none' opacity='0.2'/%3E%3C/svg%3E")`;
    case "diagonale":
      return `repeating-linear-gradient(45deg, ${couleur}15 0px, ${couleur}15 1px, transparent 1px, transparent 8px)`;
    case "points":
      return `radial-gradient(circle, ${couleur}40 1px, transparent 1px)`;
    default:
      return "";
  }
}

// ── Cards / boutons helpers ────────────────────────────────────────────────────

export function ombreCSS(style: OmbreStyle): string {
  switch (style) {
    case "legere":
      return "0 1px 3px rgba(43,37,33,0.08)";
    case "normale":
      return "0 4px 12px rgba(43,37,33,0.10)";
    case "prononcee":
      return "0 12px 32px rgba(43,37,33,0.16)";
    default:
      return "none";
  }
}

export function boutonRadiusCSS(forme: BoutonForme): string {
  switch (forme) {
    case "pill": return "999px";
    case "arrondi": return "8px";
    case "carre": return "0px";
  }
}

export function boutonTailleCSS(taille: BoutonTaille): { padding: string; fontSize: string } {
  switch (taille) {
    case "petit": return { padding: "8px 18px", fontSize: "13px" };
    case "grand": return { padding: "16px 32px", fontSize: "16px" };
    default: return { padding: "12px 24px", fontSize: "14px" };
  }
}

export function boutonStyleCSS(
  style: BoutonStyle,
  couleur: string
): { background: string; color: string; border: string } {
  switch (style) {
    case "contour":
      return { background: "transparent", color: couleur, border: `2px solid ${couleur}` };
    case "fantome":
      return { background: `${couleur}18`, color: couleur, border: "none" };
    default:
      return { background: couleur, color: "#FFFFFF", border: "none" };
  }
}

// ── Vidéo hero ──────────────────────────────────────────────────────────────

export function parseVideoEmbedUrl(url: string, autoplay = false): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) {
    const id = ytMatch[1];
    return autoplay
      ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&modestbranding=1`
      : `https://www.youtube.com/embed/${id}`;
  }
  const viMatch = url.match(/vimeo\.com\/(\d+)/);
  if (viMatch) {
    const id = viMatch[1];
    return autoplay
      ? `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1`
      : `https://player.vimeo.com/video/${id}`;
  }
  return null;
}

// ── Animations au scroll ──────────────────────────────────────────────────────

export function animationClass(effet: AnimEffet): string {
  if (effet === "aucun") return "";
  return `vitrine-anim-${effet.replace(/_/g, "-")}`;
}

export function animationDurationMs(intensite: AnimIntensite): number {
  return { 1: 400, 2: 600, 3: 900 }[intensite];
}

export const ANIM_KEYFRAMES_CSS = `
  .vitrine-anim-fondu, .vitrine-anim-glissement-gauche, .vitrine-anim-glissement-droite, .vitrine-anim-zoom, .vitrine-anim-rebond {
    opacity: 0;
    will-change: opacity, transform;
  }
  .vitrine-anim-fondu.vitrine-anim-visible {
    animation: vitrineAnimFondu var(--vitrine-anim-duree, 600ms) ease both;
  }
  .vitrine-anim-glissement-gauche.vitrine-anim-visible {
    animation: vitrineAnimGlisseGauche var(--vitrine-anim-duree, 600ms) ease both;
  }
  .vitrine-anim-glissement-droite.vitrine-anim-visible {
    animation: vitrineAnimGlisseDroite var(--vitrine-anim-duree, 600ms) ease both;
  }
  .vitrine-anim-zoom.vitrine-anim-visible {
    animation: vitrineAnimZoom var(--vitrine-anim-duree, 600ms) ease both;
  }
  .vitrine-anim-rebond.vitrine-anim-visible {
    animation: vitrineAnimRebond var(--vitrine-anim-duree, 600ms) cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes vitrineAnimFondu {
    from { opacity: 0; transform: translateY(var(--vitrine-anim-amp, 20px)); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes vitrineAnimGlisseGauche {
    from { opacity: 0; transform: translateX(calc(-1 * var(--vitrine-anim-amp, 20px))); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes vitrineAnimGlisseDroite {
    from { opacity: 0; transform: translateX(var(--vitrine-anim-amp, 20px)); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes vitrineAnimZoom {
    from { opacity: 0; transform: scale(calc(1 - var(--vitrine-anim-scale, 0.06))); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes vitrineAnimRebond {
    from { opacity: 0; transform: translateY(var(--vitrine-anim-amp, 20px)) scale(0.94); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

export function animationAmplitude(intensite: AnimIntensite): { amp: string; scale: string } {
  switch (intensite) {
    case 1: return { amp: "10px", scale: "0.03" };
    case 3: return { amp: "36px", scale: "0.12" };
    default: return { amp: "20px", scale: "0.06" };
  }
}

// ── Thèmes prédéfinis ─────────────────────────────────────────────────────────

export interface ThemeVisuelPreset {
  id: string;
  label: string;
  description: string;
  apercu: { fond: string; principale: string; secondaire: string };
  config: Partial<Pick<VitrineConfig, "couleurs" | "cards" | "boutons" | "fond" | "typographie" | "mise_en_page" | "separateurs" | "animations">> & {
    hero?: Partial<Pick<VitrineConfig["hero"], "style" | "overlay_couleur" | "overlay_opacite" | "forme_transition" | "parallaxe" | "position_texte">>;
  };
}

export const THEMES_VISUELS: ThemeVisuelPreset[] = [
  {
    id: "moderne_epure",
    label: "Moderne épuré",
    description: "Fond blanc, typographie fine, coins carrés",
    apercu: { fond: "#FFFFFF", principale: "#2B2521", secondaire: "#6B6560" },
    config: {
      couleurs: { principale: "#2B2521", secondaire: "#6B6560", accent: "#C75D3B", fond: "#FFFFFF" },
      fond: { type: "uni", texture: "aucune", decorations_laterales: "aucune" },
      typographie: { police_titres: "Inter", taille_titres: "normal" },
      mise_en_page: { template: "minimaliste", police: "sans-serif", style_cards: "carre" },
      separateurs: "ligne",
      cards: { rayon: 0, ombre: "aucune", bordure_active: true, bordure_epaisseur: 1, bordure_couleur: "#2B25211A", espacement_sections: 64 },
      boutons: { forme: "carre", style: "contour", taille: "moyen", icone: false },
      hero: { style: "compact", overlay_couleur: "aucun", overlay_opacite: 0, forme_transition: "droite", parallaxe: false, position_texte: "centre" },
      animations: {
        hero: { effet: "fondu", intensite: 1 },
        chiffres_cles: { effet: "fondu", intensite: 1 },
        chantiers: { effet: "fondu", intensite: 1 },
        temoignage_vedette: { effet: "fondu", intensite: 1 },
        faq: { effet: "fondu", intensite: 1 },
        certifications_ruban: { effet: "aucun", intensite: 1 },
        video: { effet: "fondu", intensite: 1 },
        contact: { effet: "fondu", intensite: 1 },
      },
    },
  },
  {
    id: "chaud_artisanal",
    label: "Chaud artisanal",
    description: "Fond crème, typographie serif, textures bois",
    apercu: { fond: "#F8F5F2", principale: "#C75D3B", secondaire: "#8B5A2B" },
    config: {
      couleurs: { principale: "#C75D3B", secondaire: "#8B5A2B", accent: "#C8922A", fond: "#F8F5F2" },
      fond: { type: "texture", texture: "bois", decorations_laterales: "aucune" },
      typographie: { police_titres: "Merriweather", taille_titres: "grand" },
      mise_en_page: { template: "classique", police: "serif", style_cards: "arrondi" },
      separateurs: "vague",
      cards: { rayon: 16, ombre: "legere", bordure_active: true, bordure_epaisseur: 1, bordure_couleur: "#C75D3B33", espacement_sections: 80 },
      boutons: { forme: "arrondi", style: "plein", taille: "moyen", icone: true },
      hero: { style: "grand", overlay_couleur: "sombre", overlay_opacite: 25, forme_transition: "vague", parallaxe: true, position_texte: "centre" },
      animations: {
        hero: { effet: "fondu", intensite: 2 },
        chiffres_cles: { effet: "fondu", intensite: 2 },
        chantiers: { effet: "glissement_gauche", intensite: 2 },
        temoignage_vedette: { effet: "fondu", intensite: 2 },
        faq: { effet: "fondu", intensite: 2 },
        certifications_ruban: { effet: "aucun", intensite: 2 },
        video: { effet: "fondu", intensite: 2 },
        contact: { effet: "fondu", intensite: 2 },
      },
    },
  },
  {
    id: "sombre_premium",
    label: "Sombre premium",
    description: "Fond très sombre, accents dorés, ombres marquées",
    apercu: { fond: "#1A1512", principale: "#C8922A", secondaire: "#D4AF6A" },
    config: {
      couleurs: { principale: "#C8922A", secondaire: "#D4AF6A", accent: "#C8922A", fond: "#1A1512" },
      fond: { type: "uni", texture: "aucune", decorations_laterales: "aucune" },
      typographie: { police_titres: "Playfair Display", taille_titres: "tres_grand" },
      mise_en_page: { template: "moderne", police: "serif", style_cards: "ombre" },
      separateurs: "aucun",
      cards: { rayon: 12, ombre: "prononcee", bordure_active: false, bordure_epaisseur: 1, bordure_couleur: "#C8922A33", espacement_sections: 96 },
      boutons: { forme: "pill", style: "plein", taille: "grand", icone: true },
      hero: { style: "plein_ecran", overlay_couleur: "degrade", overlay_opacite: 55, forme_transition: "courbe", parallaxe: true, position_texte: "gauche" },
      animations: {
        hero: { effet: "zoom", intensite: 3 },
        chiffres_cles: { effet: "zoom", intensite: 3 },
        chantiers: { effet: "zoom", intensite: 2 },
        temoignage_vedette: { effet: "zoom", intensite: 2 },
        faq: { effet: "fondu", intensite: 2 },
        certifications_ruban: { effet: "aucun", intensite: 2 },
        video: { effet: "zoom", intensite: 2 },
        contact: { effet: "fondu", intensite: 2 },
      },
    },
  },
  {
    id: "lumineux_minimaliste",
    label: "Lumineux minimaliste",
    description: "Fond blanc cassé, espace généreux, animations douces",
    apercu: { fond: "#FBFAF8", principale: "#2B2521", secondaire: "#9A8F8B" },
    config: {
      couleurs: { principale: "#2B2521", secondaire: "#9A8F8B", accent: "#C75D3B", fond: "#FBFAF8" },
      fond: { type: "uni", texture: "aucune", decorations_laterales: "aucune" },
      typographie: { police_titres: "Raleway", taille_titres: "normal" },
      mise_en_page: { template: "minimaliste", police: "sans-serif", style_cards: "arrondi" },
      separateurs: "aucun",
      cards: { rayon: 20, ombre: "aucune", bordure_active: false, bordure_epaisseur: 1, bordure_couleur: "#2B25210F", espacement_sections: 112 },
      boutons: { forme: "pill", style: "fantome", taille: "moyen", icone: false },
      hero: { style: "compact", overlay_couleur: "aucun", overlay_opacite: 0, forme_transition: "droite", parallaxe: false, position_texte: "centre" },
      animations: {
        hero: { effet: "glissement_gauche", intensite: 1 },
        chiffres_cles: { effet: "glissement_droite", intensite: 1 },
        chantiers: { effet: "glissement_gauche", intensite: 1 },
        temoignage_vedette: { effet: "glissement_droite", intensite: 1 },
        faq: { effet: "fondu", intensite: 1 },
        certifications_ruban: { effet: "aucun", intensite: 1 },
        video: { effet: "fondu", intensite: 1 },
        contact: { effet: "fondu", intensite: 1 },
      },
    },
  },
];

export function applyThemeVisuel(current: VitrineConfig, themeId: string): VitrineConfig {
  const theme = THEMES_VISUELS.find((t) => t.id === themeId);
  if (!theme) return current;
  const c = theme.config;
  return {
    ...current,
    couleurs: c.couleurs ? { ...current.couleurs, ...c.couleurs } : current.couleurs,
    cards: c.cards ? { ...current.cards, ...c.cards } : current.cards,
    boutons: c.boutons ? { ...current.boutons, ...c.boutons } : current.boutons,
    fond: c.fond ? { ...current.fond, ...c.fond } : current.fond,
    typographie: c.typographie ? { ...current.typographie, ...c.typographie } : current.typographie,
    mise_en_page: c.mise_en_page ? { ...current.mise_en_page, ...c.mise_en_page } : current.mise_en_page,
    separateurs: c.separateurs ?? current.separateurs,
    animations: c.animations ? { ...current.animations, ...c.animations } : current.animations,
    hero: c.hero ? { ...current.hero, ...c.hero } : current.hero,
  };
}
