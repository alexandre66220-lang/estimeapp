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

export interface VitrineConfig {
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
  return {
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
