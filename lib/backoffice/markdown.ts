// Rendu markdown volontairement minimal (titres # / ##, listes à puces,
// paragraphes) : suffisant pour des documents type welcome kit / CGV,
// sans dépendance externe, réutilisable à l'identique côté web et PDF.

export type MarkdownBlock =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "li"; text: string }
  | { type: "p"; text: string };

export function parseMarkdown(source: string): MarkdownBlock[] {
  const lignes = source.split("\n");
  const blocks: MarkdownBlock[] = [];

  for (const ligneBrute of lignes) {
    const ligne = ligneBrute.trim();
    if (!ligne) continue;

    if (ligne.startsWith("## ")) {
      blocks.push({ type: "h2", text: ligne.slice(3) });
    } else if (ligne.startsWith("# ")) {
      blocks.push({ type: "h1", text: ligne.slice(2) });
    } else if (ligne.startsWith("- ")) {
      blocks.push({ type: "li", text: ligne.slice(2) });
    } else {
      blocks.push({ type: "p", text: ligne });
    }
  }

  return blocks;
}
