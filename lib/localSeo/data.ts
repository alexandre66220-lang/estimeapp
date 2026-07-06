export type MetierSeo = {
  slug: string;
  label: string;
  labelPluriel: string;
  description: string;
};

export type VilleSeo = {
  slug: string;
  label: string;
  departement: string;
  region: string;
};

export const METIERS_SEO: MetierSeo[] = [
  { slug: "peintre", label: "Peintre", labelPluriel: "Peintres", description: "peinture intérieure et extérieure, ravalement de façade" },
  { slug: "plombier", label: "Plombier", labelPluriel: "Plombiers", description: "plomberie, chauffage, sanitaire" },
  { slug: "electricien", label: "Électricien", labelPluriel: "Électriciens", description: "électricité, domotique, mise en conformité" },
  { slug: "macon", label: "Maçon", labelPluriel: "Maçons", description: "maçonnerie, gros œuvre, rénovation" },
  { slug: "carreleur", label: "Carreleur", labelPluriel: "Carreleurs", description: "carrelage, faïence, sol et mur" },
  { slug: "couvreur", label: "Couvreur", labelPluriel: "Couvreurs", description: "couverture, toiture, zinguerie" },
  { slug: "menuisier", label: "Menuisier", labelPluriel: "Menuisiers", description: "menuiserie, fenêtres, portes, parquet" },
  { slug: "facadier", label: "Façadier", labelPluriel: "Façadiers", description: "ravalement, isolation par l'extérieur" },
];

export const VILLES_SEO: VilleSeo[] = [
  { slug: "toulouse", label: "Toulouse", departement: "Haute-Garonne", region: "Occitanie" },
  { slug: "castres", label: "Castres", departement: "Tarn", region: "Occitanie" },
  { slug: "mazamet", label: "Mazamet", departement: "Tarn", region: "Occitanie" },
  { slug: "albi", label: "Albi", departement: "Tarn", region: "Occitanie" },
  { slug: "montpellier", label: "Montpellier", departement: "Hérault", region: "Occitanie" },
  { slug: "nimes", label: "Nîmes", departement: "Gard", region: "Occitanie" },
  { slug: "perpignan", label: "Perpignan", departement: "Pyrénées-Orientales", region: "Occitanie" },
  { slug: "montauban", label: "Montauban", departement: "Tarn-et-Garonne", region: "Occitanie" },
  { slug: "carcassonne", label: "Carcassonne", departement: "Aude", region: "Occitanie" },
  { slug: "beziers", label: "Béziers", departement: "Hérault", region: "Occitanie" },
  { slug: "paris", label: "Paris", departement: "Paris", region: "Île-de-France" },
  { slug: "lyon", label: "Lyon", departement: "Rhône", region: "Auvergne-Rhône-Alpes" },
  { slug: "marseille", label: "Marseille", departement: "Bouches-du-Rhône", region: "PACA" },
  { slug: "bordeaux", label: "Bordeaux", departement: "Gironde", region: "Nouvelle-Aquitaine" },
  { slug: "nantes", label: "Nantes", departement: "Loire-Atlantique", region: "Pays de la Loire" },
  { slug: "lille", label: "Lille", departement: "Nord", region: "Hauts-de-France" },
  { slug: "strasbourg", label: "Strasbourg", departement: "Bas-Rhin", region: "Grand Est" },
  { slug: "rennes", label: "Rennes", departement: "Ille-et-Vilaine", region: "Bretagne" },
  { slug: "nice", label: "Nice", departement: "Alpes-Maritimes", region: "PACA" },
];

export function findMetier(slug: string): MetierSeo | undefined {
  return METIERS_SEO.find((m) => m.slug === slug);
}

export function findVille(slug: string): VilleSeo | undefined {
  return VILLES_SEO.find((v) => v.slug === slug);
}
