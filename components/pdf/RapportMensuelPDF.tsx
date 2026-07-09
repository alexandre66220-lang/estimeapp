import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { RapportData } from "@/lib/supabase/rapports";
import type { RapportAIContent } from "@/lib/anthropic/generate-rapport";

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  terracotta: "#C75D3B",
  cream: "#F8F5F2",
  dark: "#2C2C2C",
  muted: "#7A6E6A",
  separator: "#E8E0D8",
  lightBg: "#FAF7F5",
  green: "#16A34A",
  amber: "#D97706",
  white: "#FFFFFF",
};

// Register Helvetica (built-in, no download needed)
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: C.cream,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontSize: 10,
    color: C.dark,
  },
  // Cover
  coverTopBar: { height: 8, backgroundColor: C.terracotta },
  coverBody: { flex: 1, paddingHorizontal: 48, paddingTop: 80, paddingBottom: 40 },
  coverLogo: { fontSize: 28, fontFamily: "Helvetica-Bold", color: C.terracotta, letterSpacing: 3, marginBottom: 6 },
  coverTagline: { fontSize: 9, color: C.muted, letterSpacing: 1, marginBottom: 60 },
  coverDivider: { height: 3, width: 60, backgroundColor: C.terracotta, marginBottom: 48 },
  coverTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.dark, lineHeight: 1.3, marginBottom: 12 },
  coverSub: { fontSize: 13, color: C.muted, marginBottom: 60 },
  coverDate: { fontSize: 9, color: C.muted },
  coverFooter: { marginTop: "auto", paddingTop: 24, borderTopWidth: 1, borderTopColor: C.separator },
  coverFooterText: { fontSize: 8, color: C.muted },
  // Inner pages
  innerPage: { fontFamily: "Helvetica", backgroundColor: C.white, paddingTop: 0, paddingBottom: 0, paddingHorizontal: 0, fontSize: 10, color: C.dark },
  innerHeader: { backgroundColor: C.cream, paddingHorizontal: 48, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: C.separator, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  innerHeaderLogo: { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.terracotta, letterSpacing: 2 },
  innerHeaderMois: { fontSize: 9, color: C.muted },
  innerBody: { paddingHorizontal: 48, paddingTop: 32, paddingBottom: 40, flex: 1 },
  sectionTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 20 },
  // Stats grid
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard: { width: "47%", backgroundColor: C.lightBg, borderRadius: 8, padding: 14 },
  statValue: { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.terracotta, marginBottom: 4 },
  statLabel: { fontSize: 8, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  // Score
  scoreRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  scoreBig: { fontSize: 48, fontFamily: "Helvetica-Bold", color: C.terracotta, marginRight: 20 },
  scoreInfo: { flex: 1 },
  scoreLabel: { fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  progressBg: { height: 8, backgroundColor: C.separator, borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: C.terracotta, borderRadius: 4 },
  scoreEvol: { fontSize: 9, marginTop: 6 },
  // AI message
  aiBox: { backgroundColor: C.cream, borderLeftWidth: 3, borderLeftColor: C.terracotta, padding: 16, borderRadius: 4, marginBottom: 0 },
  aiText: { fontSize: 10, color: C.dark, lineHeight: 1.6, fontFamily: "Helvetica-Oblique" },
  // Chantiers
  chantierRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.separator },
  chantierName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.dark, flex: 1, marginRight: 8 },
  chantierMeta: { fontSize: 8, color: C.muted, marginTop: 2 },
  chantierRight: { alignItems: "flex-end" },
  chantierMontant: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.terracotta },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginTop: 4 },
  badgeText: { fontSize: 7, fontFamily: "Helvetica-Bold" },
  // Avis
  avisBarRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 24, height: 80 },
  avisBarWrap: { flex: 1, alignItems: "center" },
  avisBarFill: { backgroundColor: C.terracotta, borderRadius: 3, width: "100%" },
  avisBarLabel: { fontSize: 7, color: C.muted, marginTop: 4, textAlign: "center" },
  avisBarCount: { fontSize: 8, color: C.terracotta, fontFamily: "Helvetica-Bold", marginBottom: 2, textAlign: "center" },
  noteBox: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  noteBig: { fontSize: 40, fontFamily: "Helvetica-Bold", color: C.terracotta, marginRight: 16 },
  noteStars: { fontSize: 14, color: C.amber },
  // Review card
  reviewCard: { backgroundColor: C.lightBg, borderRadius: 6, padding: 12, marginBottom: 8 },
  reviewText: { fontSize: 9, color: C.dark, lineHeight: 1.5, marginBottom: 6, fontFamily: "Helvetica-Oblique" },
  reviewMeta: { fontSize: 8, color: C.muted },
  // Recommendations
  recoBullet: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  recoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.terracotta, marginTop: 3, marginRight: 12 },
  recoText: { flex: 1, fontSize: 11, color: C.dark, lineHeight: 1.5 },
  ctaBox: { backgroundColor: C.terracotta, borderRadius: 8, padding: 20, marginTop: 32, alignItems: "center" },
  ctaText: { fontSize: 11, color: C.white, fontFamily: "Helvetica-Bold", textAlign: "center", lineHeight: 1.5 },
  footer: { paddingHorizontal: 48, paddingVertical: 14, borderTopWidth: 1, borderTopColor: C.separator, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: C.muted },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function stars(note: number) {
  return "★".repeat(Math.round(note)) + "☆".repeat(5 - Math.round(note));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

function PageHeader({ moisLabel }: { moisLabel: string }) {
  return (
    <View style={styles.innerHeader}>
      <Text style={styles.innerHeaderLogo}>ESTIME</Text>
      <Text style={styles.innerHeaderMois}>{moisLabel}</Text>
    </View>
  );
}

function PageFooter({ page }: { page: string }) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Créé par AlcalSpark (alcalspark.com)</Text>
      <Text style={styles.footerText}>{page}</Text>
    </View>
  );
}

// ─── PDF Document ─────────────────────────────────────────────────────────────
export function RapportMensuelPDF({
  data,
  ai,
}: {
  data: RapportData;
  ai: RapportAIContent;
}) {
  const { artisan, moisLabel, stats, chantiers, avisData } = data;
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const maxAvis = Math.max(...avisData.historique.map((h) => h.count), 1);

  return (
    <Document
      title={`Rapport Estime, ${artisan.prenom} ${artisan.nom} (${moisLabel})`}
      author="Estime"
    >
      {/* ── PAGE 1 : COUVERTURE ───────────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverTopBar} />
        <View style={styles.coverBody}>
          <Text style={styles.coverLogo}>ESTIME</Text>
          <Text style={styles.coverTagline}>L'APPLICATION DES ARTISANS DU BÂTIMENT</Text>
          <View style={styles.coverDivider} />
          <Text style={styles.coverTitle}>
            Rapport mensuel{"\n"}{artisan.prenom} {artisan.nom}
          </Text>
          <Text style={styles.coverSub}>Bilan du mois de {moisLabel}</Text>
          {artisan.metier && (
            <Text style={[styles.coverDate, { marginBottom: 4 }]}>{artisan.metier}</Text>
          )}
          {artisan.ville && (
            <Text style={styles.coverDate}>{artisan.ville}</Text>
          )}
          <View style={[styles.coverFooter]}>
            <Text style={styles.coverFooterText}>Généré le {today}</Text>
            <Text style={[styles.coverFooterText, { marginTop: 4 }]}>
              Créé par AlcalSpark (alcalspark.com)
            </Text>
          </View>
        </View>
      </Page>

      {/* ── PAGE 2 : RÉSUMÉ DE L'ACTIVITÉ ────────────────────────────────── */}
      <Page size="A4" style={styles.innerPage}>
        <PageHeader moisLabel={moisLabel} />
        <View style={styles.innerBody}>
          <Text style={styles.sectionTitle}>Résumé de l&apos;activité</Text>

          {/* Score */}
          <View style={styles.scoreRow}>
            <Text style={styles.scoreBig}>{stats.score}</Text>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreLabel}>Score de réputation</Text>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${Math.min(stats.score, 100)}%` }]} />
              </View>
              {stats.scoreEvolutionPct !== null && (
                <Text
                  style={[
                    styles.scoreEvol,
                    { color: stats.scoreEvolutionPct >= 0 ? C.green : "#DC2626" },
                  ]}
                >
                  {stats.scoreEvolutionPct >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(stats.scoreEvolutionPct)}% vs mois précédent
                </Text>
              )}
            </View>
          </View>

          {/* 4 chiffres clés */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.chantiers}</Text>
              <Text style={styles.statLabel}>Chantiers réalisés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.posts}</Text>
              <Text style={styles.statLabel}>Posts générés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.emails}</Text>
              <Text style={styles.statLabel}>Emails envoyés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.avis}</Text>
              <Text style={styles.statLabel}>Avis reçus</Text>
            </View>
          </View>

          {/* Score comparatif */}
          {data.rangLocal && data.rangLocal.scope !== "pioneer" && (
            <View style={{ marginTop: 20, backgroundColor: "#FAF7F5", borderRadius: 8, padding: 14, flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginRight: 16 }}>
                <Text style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                  Classement {data.rangLocal.scope === "local" ? "local" : "national"}
                </Text>
                <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: C.terracotta }}>
                  #{data.rangLocal.rang}
                  <Text style={{ fontSize: 11, color: C.muted, fontFamily: "Helvetica" }}> / {data.rangLocal.nb_total}</Text>
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${Math.min(data.rangLocal.percentile, 100)}%` }]} />
                </View>
                <Text style={{ fontSize: 8, color: C.muted, marginTop: 4 }}>
                  Mieux que {Math.round(data.rangLocal.percentile)} % des artisans · Moy. {Math.round(data.rangLocal.score_moyen)} pts
                </Text>
              </View>
            </View>
          )}

          {/* Message IA */}
          <View style={[styles.aiBox, { marginTop: 20 }]}>
            <Text style={styles.aiText}>{ai.message}</Text>
          </View>
        </View>
        <PageFooter page="2 / 5" />
      </Page>

      {/* ── PAGE 3 : CHANTIERS DU MOIS ───────────────────────────────────── */}
      <Page size="A4" style={styles.innerPage}>
        <PageHeader moisLabel={moisLabel} />
        <View style={styles.innerBody}>
          <Text style={styles.sectionTitle}>
            Chantiers du mois ({chantiers.length})
          </Text>

          {chantiers.length === 0 ? (
            <View style={styles.aiBox}>
              <Text style={styles.aiText}>
                Aucun chantier ce mois-ci. Ajoutez vos prochains chantiers dans Estime
                pour générer vos posts Instagram et suivre votre activité.
              </Text>
            </View>
          ) : (
            chantiers.map((c, i) => {
              const isTermine = c.statut === "termine";
              return (
                <View key={i} style={styles.chantierRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chantierName}>{c.titre}</Text>
                    <Text style={styles.chantierMeta}>{fmtDate(c.created_at)}</Text>
                  </View>
                  <View style={styles.chantierRight}>
                    {c.montant != null && (
                      <Text style={styles.chantierMontant}>
                        {c.montant.toLocaleString("fr-FR")} €
                      </Text>
                    )}
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: isTermine ? "#DCFCE7" : "#FEF3C7" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: isTermine ? C.green : C.amber },
                        ]}
                      >
                        {isTermine ? "Terminé" : "En cours"}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
        <PageFooter page="3 / 5" />
      </Page>

      {/* ── PAGE 4 : RÉPUTATION GOOGLE ────────────────────────────────────── */}
      <Page size="A4" style={styles.innerPage}>
        <PageHeader moisLabel={moisLabel} />
        <View style={styles.innerBody}>
          <Text style={styles.sectionTitle}>Réputation Google</Text>

          <View style={styles.noteBox}>
            <Text style={styles.noteBig}>
              {avisData.noteMoyenne !== null ? avisData.noteMoyenne.toFixed(1) : "-"}
            </Text>
            <View>
              {avisData.noteMoyenne !== null && (
                <Text style={styles.noteStars}>{stars(avisData.noteMoyenne)}</Text>
              )}
              <Text style={[styles.coverDate, { marginTop: 4 }]}>
                {avisData.avisRecusMois} avis reçu{avisData.avisRecusMois > 1 ? "s" : ""} ce mois
              </Text>
            </View>
          </View>

          {/* Graphique barres 6 mois */}
          <Text style={[styles.scoreLabel, { marginBottom: 12 }]}>
            ÉVOLUTION SUR 6 MOIS
          </Text>
          <View style={styles.avisBarRow}>
            {avisData.historique.map((h, i) => {
              const heightPct = maxAvis > 0 ? (h.count / maxAvis) * 60 : 0;
              return (
                <View key={i} style={styles.avisBarWrap}>
                  <Text style={styles.avisBarCount}>
                    {h.count > 0 ? h.count : ""}
                  </Text>
                  <View style={[styles.avisBarFill, { height: Math.max(heightPct, 2) }]} />
                  <Text style={styles.avisBarLabel}>{h.mois}</Text>
                </View>
              );
            })}
          </View>

          {/* 3 derniers avis */}
          {avisData.dernierAvis.length > 0 && (
            <>
              <Text style={[styles.scoreLabel, { marginBottom: 12 }]}>
                DERNIERS AVIS REÇUS
              </Text>
              {avisData.dernierAvis.map((a, i) => (
                <View key={i} style={styles.reviewCard}>
                  {a.contenu && (
                    <Text style={styles.reviewText}>
                      &quot;{a.contenu.slice(0, 200)}{a.contenu.length > 200 ? "…" : ""}&quot;
                    </Text>
                  )}
                  <Text style={styles.reviewMeta}>
                    {a.note !== null ? stars(a.note) + "  " : ""}{fmtDate(a.created_at)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
        <PageFooter page="4 / 5" />
      </Page>

      {/* ── PAGE 5 : OBJECTIFS DU MOIS SUIVANT ───────────────────────────── */}
      <Page size="A4" style={styles.innerPage}>
        <PageHeader moisLabel={moisLabel} />
        <View style={styles.innerBody}>
          <Text style={styles.sectionTitle}>Recommandations pour le mois prochain</Text>

          {ai.recommandations.map((r, i) => (
            <View key={i} style={styles.recoBullet}>
              <View style={styles.recoDot} />
              <Text style={styles.recoText}>{r}</Text>
            </View>
          ))}

          <View style={styles.ctaBox}>
            <Text style={styles.ctaText}>
              Connectez-vous sur estime-app.com{"\n"}pour suivre votre activité au quotidien
            </Text>
          </View>
        </View>
        <PageFooter page="5 / 5" />
      </Page>
    </Document>
  );
}
