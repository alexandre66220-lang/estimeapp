import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Estime",
  description:
    "Toutes les réponses sur le fonctionnement d'Estime : génération de posts, relances d'avis Google, sécurité des données et résiliation.",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
