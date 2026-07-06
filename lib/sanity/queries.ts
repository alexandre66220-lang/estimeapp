import { getSanityClient } from "./client";
import type { PortableTextBlock } from "@portabletext/react";

export type ConseilMetier =
  | "general"
  | "peintre"
  | "plombier"
  | "electricien"
  | "macon"
  | "carreleur"
  | "couvreur"
  | "menuisier"
  | "plaquiste"
  | "chauffagiste"
  | "facadier";

export type ConseilCategorie = "Technique" | "Marketing" | "Gestion" | "Réputation" | "Sécurité";

export type ArticleConseil = {
  _id: string;
  titre: string;
  slug: string;
  metier: ConseilMetier[];
  categorie: ConseilCategorie;
  resume: string;
  contenu: PortableTextBlock[];
  temps_lecture: number;
  image_principale?: { url: string; alt?: string };
  est_conseil_semaine: boolean;
  published_at: string;
};

const ARTICLE_FIELDS = `
  _id,
  titre,
  "slug": slug.current,
  metier,
  categorie,
  resume,
  temps_lecture,
  est_conseil_semaine,
  published_at,
  "image_principale": image_principale { "url": asset->url, alt }
`;

export async function getConseilSemaine(metier?: string | null): Promise<ArticleConseil | null> {
  const metierFilter = metier && metier !== "general"
    ? `&& ("general" in metier || "${metier}" in metier)`
    : "";
  return getSanityClient().fetch(
    `*[_type == "article_conseil" && est_conseil_semaine == true && actif == true ${metierFilter}] | order(published_at desc)[0] { ${ARTICLE_FIELDS} }`
  );
}

export async function getConseils(metier?: string | null, limit = 6): Promise<ArticleConseil[]> {
  const metierFilter = metier && metier !== "general"
    ? `&& ("general" in metier || "${metier}" in metier)`
    : "";
  return getSanityClient().fetch(
    `*[_type == "article_conseil" && est_conseil_semaine != true && actif == true ${metierFilter}] | order(published_at desc)[0...${limit}] { ${ARTICLE_FIELDS} }`
  );
}

export async function getConseil(slug: string): Promise<ArticleConseil & { contenu: PortableTextBlock[] } | null> {
  return getSanityClient().fetch(
    `*[_type == "article_conseil" && slug.current == $slug && actif == true][0] { ${ARTICLE_FIELDS}, contenu }`,
    { slug }
  );
}

export async function getConseillsSimilaires(slug: string, metier: string[], categorie: string, limit = 3): Promise<ArticleConseil[]> {
  return getSanityClient().fetch(
    `*[_type == "article_conseil" && slug.current != $slug && actif == true && (categorie == $categorie || count(metier[@ in $metier]) > 0)] | order(published_at desc)[0...${limit}] { ${ARTICLE_FIELDS} }`,
    { slug, categorie, metier }
  );
}
