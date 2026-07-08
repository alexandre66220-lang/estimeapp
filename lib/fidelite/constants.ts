export const ACTIONS_POINTS = {
  chantier_cree:    { label: "Chantier ajouté",                     points: 10  },
  post_instagram:   { label: "Post Instagram généré",                points: 15  },
  story_instagram:  { label: "Story Instagram générée",              points: 15  },
  avant_apres:      { label: "Avant/après généré",                   points: 20  },
  demande_avis:     { label: "Demande d'avis envoyée",               points: 10  },
  avis_recu:        { label: "Avis Google reçu",                     points: 30  },
  profil_complet:   { label: "Profil complété à 100 %",              points: 50  },
  streak_7_jours:   { label: "7 jours de connexion consécutifs",     points: 25  },
  parrainage:       { label: "Artisan parrainé abonné",              points: 100 },
  vitrine_complete: { label: "Page vitrine complétée à 100 %",        points: 50  },
} as const;

export type ActionFidelite = keyof typeof ACTIONS_POINTS;

export const NIVEAUX_FIDELITE = {
  apprenti: { label: "Apprenti", min: 0,    max: 199,  next: 200,  color: "#9CA3AF", emoji: "⬜" },
  confirme: { label: "Confirmé", min: 200,  max: 499,  next: 500,  color: "#CD7F32", emoji: "🥉" },
  expert:   { label: "Expert",   min: 500,  max: 999,  next: 1000, color: "#A8A9AD", emoji: "🥈" },
  maitre:   { label: "Maître",   min: 1000, max: 1999, next: 2000, color: "#FFD700", emoji: "🥇" },
  legende:  { label: "Légende",  min: 2000, max: null,  next: null, color: "#C75D3B", emoji: "🏆" },
} as const;

export type NiveauFidelite = keyof typeof NIVEAUX_FIDELITE;

export const NIVEAUX_ORDER: NiveauFidelite[] = [
  "apprenti", "confirme", "expert", "maitre", "legende",
];

export const STRIPE_CREDITS: Partial<Record<NiveauFidelite, number>> = {
  expert:  2900,  // 1 mois en centimes
  legende: 5800,  // 2 mois en centimes
};

export function niveauPourPoints(points: number): NiveauFidelite {
  if (points >= 2000) return "legende";
  if (points >= 1000) return "maitre";
  if (points >= 500)  return "expert";
  if (points >= 200)  return "confirme";
  return "apprenti";
}
