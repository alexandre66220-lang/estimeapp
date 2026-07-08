import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { AnalyseMateriau } from "@/lib/anthropic/analyze-materiau";

const C = {
  terracotta: "#C75D3B",
  cream: "#F8F5F2",
  dark: "#2B2521",
  muted: "#7A6E6A",
  separator: "#E8E0D8",
  white: "#FFFFFF",
};

const NIVEAU_COLORS: Record<string, string> = {
  faible: "#16A34A",
  modere: "#D97706",
  eleve: "#DC2626",
  critique: "#991B1B",
};

const NIVEAU_LABELS: Record<string, string> = {
  faible: "Faible",
  modere: "Modéré",
  eleve: "Élevé",
  critique: "Critique",
};

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", backgroundColor: C.white, padding: 40, fontSize: 10, color: C.dark },
  topBar: { height: 6, backgroundColor: C.terracotta, marginBottom: 24, marginHorizontal: -40, marginTop: -40 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: C.muted, marginBottom: 20 },
  sectionLabel: { fontSize: 9, color: C.muted, marginBottom: 2, textTransform: "uppercase" },
  sectionValue: { fontSize: 12, marginBottom: 14 },
  row: { flexDirection: "row", gap: 20, marginBottom: 14 },
  col: { flex: 1 },
  riskCard: { borderWidth: 1, borderColor: C.separator, borderRadius: 6, padding: 10, marginBottom: 8 },
  riskHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  riskSubstance: { fontSize: 11, fontWeight: 700 },
  riskLevel: { fontSize: 9, fontWeight: 700 },
  riskDesc: { fontSize: 9, color: C.muted },
  listItem: { fontSize: 10, marginBottom: 3 },
  footer: { marginTop: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.separator, fontSize: 8, color: C.muted },
});

export function FicheMateriauPDF({
  analyse,
  dateHoraire,
  chantierTitre,
}: {
  analyse: AnalyseMateriau;
  dateHoraire: string;
  chantierTitre: string | null;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />
        <Text style={styles.title}>Fiche de sécurité matériau</Text>
        <Text style={styles.subtitle}>
          Générée le {dateHoraire}{chantierTitre ? ` · Chantier : ${chantierTitre}` : ""}
        </Text>

        <Text style={styles.sectionLabel}>Matériau identifié</Text>
        <Text style={styles.sectionValue}>{analyse.nom_materiau}</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Date de pose probable</Text>
            <Text style={styles.sectionValue}>{analyse.date_pose_probable ?? "Indéterminée"}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Composition estimée</Text>
            <Text style={styles.sectionValue}>{analyse.composition_estimee ?? "Indéterminée"}</Text>
          </View>
        </View>

        {analyse.risques.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.sectionLabel}>Risques identifiés</Text>
            {analyse.risques.map((r, i) => (
              <View key={i} style={styles.riskCard}>
                <View style={styles.riskHeader}>
                  <Text style={styles.riskSubstance}>{r.substance}</Text>
                  <Text style={[styles.riskLevel, { color: NIVEAU_COLORS[r.niveau_risque] ?? C.dark }]}>
                    {NIVEAU_LABELS[r.niveau_risque] ?? r.niveau_risque}
                  </Text>
                </View>
                <Text style={styles.riskDesc}>{r.description}</Text>
              </View>
            ))}
          </View>
        )}

        {analyse.technique_depose_recommandee && (
          <>
            <Text style={styles.sectionLabel}>Technique de dépose recommandée</Text>
            <Text style={styles.sectionValue}>{analyse.technique_depose_recommandee}</Text>
          </>
        )}

        {analyse.equipements_protection.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.sectionLabel}>Équipements de protection nécessaires</Text>
            {analyse.equipements_protection.map((eq, i) => (
              <Text key={i} style={styles.listItem}>• {eq}</Text>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Analyse indicative générée par IA. En cas de doute sur la présence d&apos;amiante ou de plomb, faites appel à un diagnostiqueur certifié. Document généré par Estime.
        </Text>
      </Page>
    </Document>
  );
}
