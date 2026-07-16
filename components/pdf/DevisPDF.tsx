import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { AdminDevisAvecClient } from "@/lib/backoffice/devis";

const C = {
  vertForet: "#385144",
  cream: "#F8F5F2",
  or: "#C9A84C",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: C.vertForet,
  },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: C.vertForet, letterSpacing: 2 },
  brandMeta: { fontSize: 8, color: C.muted, marginTop: 4, lineHeight: 1.5 },
  docTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", color: C.dark, textAlign: "right" },
  docMeta: { fontSize: 9, color: C.muted, textAlign: "right", marginTop: 4, lineHeight: 1.5 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 8, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  clientBox: { backgroundColor: C.cream, borderRadius: 6, padding: 12, width: "50%" },
  clientNom: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.dark },
  clientLigne: { fontSize: 9, color: C.muted, marginTop: 2 },
  table: { marginTop: 8 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.vertForet,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tableHeaderText: { fontSize: 8, color: C.cream, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.separator,
  },
  colNom: { width: "46%" },
  colPu: { width: "18%", textAlign: "right" },
  colQte: { width: "12%", textAlign: "right" },
  colTotal: { width: "24%", textAlign: "right" },
  ligneNom: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  ligneDesc: { fontSize: 8, color: C.muted, marginTop: 2 },
  totalBox: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  totalInner: { width: "45%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalLabel: { fontSize: 10, color: C.muted },
  totalValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.vertForet },
  tvaMention: { fontSize: 8, color: C.muted, textAlign: "right", marginTop: 2 },
  accordBox: {
    marginTop: 40,
    borderWidth: 1,
    borderColor: C.or,
    borderRadius: 6,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  accordText: { fontSize: 9, color: C.dark },
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

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function DevisPDF({ devis, client }: {
  devis: AdminDevisAvecClient;
  client: { nom: string; entreprise: string | null; email: string | null };
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{EMETTEUR.nom}</Text>
            <Text style={styles.brandMeta}>{EMETTEUR.adresse}</Text>
            <Text style={styles.brandMeta}>SIRET : {EMETTEUR.siret}</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>DEVIS {devis.numero}</Text>
            <Text style={styles.docMeta}>Émis le {fmtDate(devis.created_at)}</Text>
            <Text style={styles.docMeta}>Valable jusqu&apos;au {fmtDate(devis.date_validite)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Destinataire</Text>
          <View style={styles.clientBox}>
            <Text style={styles.clientNom}>{client.entreprise || client.nom}</Text>
            {client.entreprise && <Text style={styles.clientLigne}>{client.nom}</Text>}
            {client.email && <Text style={styles.clientLigne}>{client.email}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Prestations</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colNom]}>Prestation</Text>
              <Text style={[styles.tableHeaderText, styles.colPu]}>PU HT</Text>
              <Text style={[styles.tableHeaderText, styles.colQte]}>Qté</Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>Total HT</Text>
            </View>
            {devis.lignes.map((l, i) => (
              <View key={i} style={styles.row}>
                <View style={styles.colNom}>
                  <Text style={styles.ligneNom}>{l.nom}</Text>
                  {l.description && <Text style={styles.ligneDesc}>{l.description}</Text>}
                </View>
                <Text style={styles.colPu}>{l.prix_unitaire.toLocaleString("fr-FR")} €</Text>
                <Text style={styles.colQte}>{l.quantite}</Text>
                <Text style={styles.colTotal}>{(l.prix_unitaire * l.quantite).toLocaleString("fr-FR")} €</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalBox}>
            <View style={styles.totalInner}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total HT</Text>
                <Text style={styles.totalValue}>{devis.total_ht.toLocaleString("fr-FR")} €</Text>
              </View>
              <Text style={styles.tvaMention}>TVA non applicable, art. 293 B du CGI</Text>
            </View>
          </View>
        </View>

        <View style={styles.accordBox}>
          <Text style={styles.accordText}>Bon pour accord{"\n"}Date et signature :</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {EMETTEUR.nom} · {EMETTEUR.adresse} · SIRET {EMETTEUR.siret}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
