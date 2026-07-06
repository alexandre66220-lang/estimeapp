import { sanityClient } from "./client";
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
  slug: { current: string };
  metier: ConseilMetier[];
  categorie: ConseilCategorie;
  resume: string;
  contenu?: PortableTextBlock[];
  temps_lecture: number;
  image_principale?: { url: string; alt?: string };
  est_conseil_semaine: boolean;
  published_at: string;
};

// Récupère le conseil de la semaine
export const CONSEIL_SEMAINE_QUERY = `
  *[_type == "article_conseil" && est_conseil_semaine == true && actif == true] | order(published_at desc)[0] {
    _id,
    titre,
    slug,
    resume,
    categorie,
    metier,
    temps_lecture,
    published_at
  }
`;

// Récupère tous les articles actifs filtrés par métier (optionnel)
export const CONSEILS_QUERY = `
  *[_type == "article_conseil" && actif == true && (!defined($metier) || $metier in metier || "general" in metier)] | order(published_at desc) {
    _id,
    titre,
    slug,
    resume,
    categorie,
    metier,
    temps_lecture,
    published_at
  }
`;

// Récupère un article complet par son slug
export const CONSEIL_BY_SLUG_QUERY = `
  *[_type == "article_conseil" && slug.current == $slug && actif == true][0] {
    _id,
    titre,
    slug,
    resume,
    categorie,
    metier,
    temps_lecture,
    published_at,
    contenu,
    "image_principale": image_principale { "url": asset->url, alt }
  }
`;

// Récupère des articles similaires (même catégorie ou même métier, hors article courant)
export const CONSEILS_SIMILAIRES_QUERY = `
  *[_type == "article_conseil" && slug.current != $slug && actif == true && (categorie == $categorie || count(metier[@ in $metier]) > 0)] | order(published_at desc)[0...3] {
    _id,
    titre,
    slug,
    categorie,
    temps_lecture
  }
`;

export async function getConseilSemaine(metier?: string | null): Promise<ArticleConseil | null> {
  const query = metier && metier !== "general"
    ? `*[_type == "article_conseil" && est_conseil_semaine == true && actif == true && ($metier in metier || "general" in metier)] | order(published_at desc)[0] { _id, titre, slug, resume, categorie, metier, temps_lecture, published_at }`
    : CONSEIL_SEMAINE_QUERY;
  return sanityClient.fetch(query, { metier: metier ?? null });
}

export async function getConseils(metier?: string | null): Promise<ArticleConseil[]> {
  return sanityClient.fetch(CONSEILS_QUERY, { metier: metier && metier !== "general" ? metier : null });
}

export async function getConseil(slug: string): Promise<ArticleConseil | null> {
  return sanityClient.fetch(CONSEIL_BY_SLUG_QUERY, { slug });
}

export async function getConseillsSimilaires(slug: string, metier: string[], categorie: string): Promise<ArticleConseil[]> {
  return sanityClient.fetch(CONSEILS_SIMILAIRES_QUERY, { slug, metier, categorie });
}
