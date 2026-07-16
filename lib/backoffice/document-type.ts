// Pas de "server-only" : type réutilisé par les Server Components et les
// formulaires client.

export type DocumentType = "template" | "envoye";

/**
 * Remplace les placeholders {{client_nom}}, {{client_entreprise}} par les
 * valeurs réelles du client. Utilisé à la fois côté serveur (envoi) et
 * côté client (aperçu en direct dans le formulaire).
 */
export function personnaliserContenu(
  contenu: string,
  client: { nom: string; entreprise?: string | null }
): string {
  return contenu
    .replaceAll("{{client_nom}}", client.nom)
    .replaceAll("{{client_entreprise}}", client.entreprise || client.nom);
}
