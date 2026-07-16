import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { parseMarkdown } from "@/lib/backoffice/markdown";

const C = {
  vertForet: "#385144",
  cream: "#F8F5F2",
  dark: "#2C2C2C",
  muted: "#7A6E6A",
  separator: "#E0DCD3",
};

const EMETTEUR = {
  nom: "ALCALSPARK",
  adresse: "90 Avenue Georges Guynemer, 81200 Mazamet",
  siret: "10451654700015",
};

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    fontSize: 10,
    color: C.dark,
    paddingHorizontal: 48,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: C.vertForet,
  },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.vertForet, letterSpacing: 2 },
  brandMeta: { fontSize: 8, color: C.muted, marginTop: 4 },
  h1: { fontSize: 15, fontFamily: "Helvetica-Bold", color: C.dark, marginTop: 16, marginBottom: 6 },
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.vertForet, marginTop: 12, marginBottom: 4 },
  li: { fontSize: 10, color: C.dark, marginBottom: 3, paddingLeft: 12 },
  p: { fontSize: 10, color: C.dark, marginBottom: 6, lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: C.separator,
    paddingTop: 10,
  },
  footerText: { fontSize: 7, color: C.muted, textAlign: "center" },
});

export function DocumentPDF({ titre, contenu }: { titre: string; contenu: string }) {
  const blocks = parseMarkdown(contenu);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>{EMETTEUR.nom}</Text>
          <Text style={styles.brandMeta}>{titre}</Text>
        </View>

        {blocks.map((b, i) => {
          if (b.type === "h1") return <Text key={i} style={styles.h1}>{b.text}</Text>;
          if (b.type === "h2") return <Text key={i} style={styles.h2}>{b.text}</Text>;
          if (b.type === "li") return <Text key={i} style={styles.li}>• {b.text}</Text>;
          return <Text key={i} style={styles.p}>{b.text}</Text>;
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {EMETTEUR.nom} · {EMETTEUR.adresse} · SIRET {EMETTEUR.siret}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
