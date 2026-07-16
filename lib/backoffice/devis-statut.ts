// Pas de "server-only" : constantes/types réutilisés par les Server
// Components et les formulaires client.

export type DevisStatut = "brouillon" | "envoye" | "accepte" | "refuse" | "expire";

export type LigneDevis = {
  nom: string;
  description: string;
  prix_unitaire: number;
  quantite: number;
};

export const DEVIS_STATUTS: { value: DevisStatut; label: string }[] = [
  { value: "brouillon", label: "Brouillon" },
  { value: "envoye", label: "Envoyé" },
  { value: "accepte", label: "Accepté" },
  { value: "refuse", label: "Refusé" },
  { value: "expire", label: "Expiré" },
];

export const DEVIS_STATUT_TONE: Record<DevisStatut, "neutral" | "warning" | "success" | "error"> = {
  brouillon: "neutral",
  envoye: "warning",
  accepte: "success",
  refuse: "error",
  expire: "error",
};

export function devisStatutLabel(statut: DevisStatut): string {
  return DEVIS_STATUTS.find((s) => s.value === statut)?.label ?? statut;
}

export function calculerTotalHt(lignes: LigneDevis[]): number {
  return lignes.reduce((s, l) => s + l.prix_unitaire * l.quantite, 0);
}
