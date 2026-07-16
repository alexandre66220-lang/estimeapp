// Pas de "server-only" : réutilisé par les Server Components et les
// sélecteurs de période côté client.

export type PeriodeCle = "mois" | "mois_precedent" | "annee" | "custom";

export function resolvePeriode(
  cle: PeriodeCle | undefined,
  customDebut?: string,
  customFin?: string
): { debut: string; fin: string; label: string } {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();

  if (cle === "mois_precedent") {
    return {
      debut: new Date(Date.UTC(y, m - 1, 1)).toISOString().slice(0, 10),
      fin: new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10),
      label: "Mois précédent",
    };
  }

  if (cle === "annee") {
    return {
      debut: new Date(Date.UTC(y, 0, 1)).toISOString().slice(0, 10),
      fin: new Date(Date.UTC(y + 1, 0, 1)).toISOString().slice(0, 10),
      label: "Année en cours",
    };
  }

  if (cle === "custom" && customDebut && customFin) {
    return { debut: customDebut, fin: customFin, label: "Personnalisé" };
  }

  return {
    debut: new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10),
    fin: new Date(Date.UTC(y, m + 1, 1)).toISOString().slice(0, 10),
    label: "Mois en cours",
  };
}
