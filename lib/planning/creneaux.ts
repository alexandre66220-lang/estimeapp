export type ReseauSocial = "instagram" | "facebook" | "tiktok";

export type Creneau = {
  heure: string; // "HH:MM"
  label: string;
  meilleur?: boolean;
};

// Jour de la semaine 0=Dimanche..6=Samedi
export function getCreneauxRecommandes(reseau: ReseauSocial, date?: Date): Creneau[] {
  const dow = (date ?? new Date()).getDay(); // 0=Dim, 1=Lun...6=Sam

  if (reseau === "instagram") {
    const jours = [2, 3, 5]; // mar, mer, ven
    const base: Creneau[] = [
      { heure: "11:00", label: "11h00" },
      { heure: "13:00", label: "13h00", meilleur: true },
      { heure: "17:00", label: "17h00" },
    ];
    if (!jours.includes(dow)) {
      return base.map((c) => ({ ...c, meilleur: c.heure === "13:00" }));
    }
    return base;
  }

  if (reseau === "facebook") {
    const base: Creneau[] = [
      { heure: "13:00", label: "13h00" },
      { heure: "15:00", label: "15h00", meilleur: true },
      { heure: "19:00", label: "19h00" },
    ];
    return base;
  }

  // tiktok
  return [
    { heure: "07:00", label: "7h00" },
    { heure: "12:00", label: "12h00" },
    { heure: "19:00", label: "19h00", meilleur: true },
    { heure: "21:00", label: "21h00" },
  ];
}

export const RESEAU_META: Record<ReseauSocial, { label: string; color: string; bg: string }> = {
  instagram: { label: "Instagram", color: "#E1306C", bg: "#fce4ec" },
  facebook: { label: "Facebook", color: "#1877F2", bg: "#e3f2fd" },
  tiktok: { label: "TikTok", color: "#000000", bg: "#f5f5f5" },
};
