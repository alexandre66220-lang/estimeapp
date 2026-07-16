// Pas de "server-only" : constantes/types réutilisés par les Server
// Components et les formulaires client.

export type FactureStatut = "envoyee" | "payee" | "en_retard";

export const FACTURE_STATUTS: { value: FactureStatut; label: string }[] = [
  { value: "envoyee", label: "Envoyée" },
  { value: "payee", label: "Payée" },
  { value: "en_retard", label: "En retard" },
];

export const FACTURE_STATUT_TONE: Record<FactureStatut, "success" | "warning" | "error"> = {
  envoyee: "warning",
  payee: "success",
  en_retard: "error",
};

export function factureStatutLabel(statut: FactureStatut): string {
  return FACTURE_STATUTS.find((s) => s.value === statut)?.label ?? statut;
}
