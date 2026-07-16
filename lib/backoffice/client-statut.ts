// Pas de "server-only" ici : ce fichier n'exporte que des constantes/types,
// réutilisées à la fois par les Server Components et les formulaires client.

export type ClientStatut = "prospect" | "devis_envoye" | "signe" | "en_cours" | "livre";

export const STATUTS: { value: ClientStatut; label: string }[] = [
  { value: "prospect", label: "Prospect" },
  { value: "devis_envoye", label: "Devis envoyé" },
  { value: "signe", label: "Signé" },
  { value: "en_cours", label: "En cours" },
  { value: "livre", label: "Livré" },
];

export const STATUT_TONE: Record<ClientStatut, "neutral" | "warning" | "success"> = {
  prospect: "neutral",
  devis_envoye: "warning",
  signe: "success",
  en_cours: "warning",
  livre: "success",
};

export function statutLabel(statut: ClientStatut): string {
  return STATUTS.find((s) => s.value === statut)?.label ?? statut;
}
