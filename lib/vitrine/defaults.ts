export type CtaAction = "formulaire" | "telephone" | "email";
export type VitrineTemplate = "classique" | "moderne" | "minimaliste";
export type VitrinePolice = "sans-serif" | "serif" | "grotesque";
export type VitrineStyleCards = "arrondi" | "carre" | "ombre";

export interface VitrineConfig {
  hero: {
    slogan: string;
    photo_couverture: string;
    couleur_principale: string;
    couleur_secondaire: string;
    cta_texte: string;
    cta_action: CtaAction;
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
  };
  mise_en_page: {
    template: VitrineTemplate;
    police: VitrinePolice;
    style_cards: VitrineStyleCards;
  };
}

export const DEFAULT_VITRINE_CONFIG: VitrineConfig = {
  hero: {
    slogan: "",
    photo_couverture: "",
    couleur_principale: "#C75D3B",
    couleur_secondaire: "#2B2521",
    cta_texte: "Demandez un devis",
    cta_action: "formulaire",
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
  },
  mise_en_page: {
    template: "classique",
    police: "sans-serif",
    style_cards: "arrondi",
  },
};

export function mergeVitrineConfig(stored: unknown): VitrineConfig {
  if (!stored || typeof stored !== "object") return structuredClone(DEFAULT_VITRINE_CONFIG);
  const s = stored as Partial<VitrineConfig>;
  return {
    hero: { ...DEFAULT_VITRINE_CONFIG.hero, ...(s.hero ?? {}) },
    sections: {
      a_propos: {
        ...DEFAULT_VITRINE_CONFIG.sections.a_propos,
        ...(s.sections?.a_propos ?? {}),
      },
      chantiers: {
        ...DEFAULT_VITRINE_CONFIG.sections.chantiers,
        ...(s.sections?.chantiers ?? {}),
      },
      avis: { ...DEFAULT_VITRINE_CONFIG.sections.avis, ...(s.sections?.avis ?? {}) },
      certifications: {
        ...DEFAULT_VITRINE_CONFIG.sections.certifications,
        ...(s.sections?.certifications ?? {}),
      },
      tarifs: {
        ...DEFAULT_VITRINE_CONFIG.sections.tarifs,
        ...(s.sections?.tarifs ?? {}),
      },
      equipe: {
        ...DEFAULT_VITRINE_CONFIG.sections.equipe,
        ...(s.sections?.equipe ?? {}),
      },
      contact: {
        ...DEFAULT_VITRINE_CONFIG.sections.contact,
        ...(s.sections?.contact ?? {}),
      },
    },
    mise_en_page: {
      ...DEFAULT_VITRINE_CONFIG.mise_en_page,
      ...(s.mise_en_page ?? {}),
    },
  };
}

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
