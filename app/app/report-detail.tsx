import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import {
  getReportStatus,
  removeReportStatusSubscription,
  Report,
  ReportStatusChange,
  subscribeToReportStatus,
} from "@/lib/reports";

const STEPS = ["submitted", "under_review", "resolved"] as const;
const LABELS: Record<(typeof STEPS)[number], string> = {
  submitted: "Submitted",
  under_review: "Under review",
  resolved: "Resolved",
};

export default function ReportDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const reportId = Array.isArray(id) ? id[0] : id;
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<ReportStatusChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!reportId) {
      setError("This report link is invalid.");
      setLoading(false);
      return;
    }
    try {
      const result = await getReportStatus(reportId);
      setReport(result.report);
      setHistory(result.history);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Couldn't load this report.",
      );
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    if (!reportId) return;
    const channel = subscribeToReportStatus(reportId, () => void refresh());
    return () => {
      void removeReportStatusSubscription(channel);
    };
  }, [refresh, reportId]);

  const activeStep = report ? STEPS.indexOf(report.status) : -1;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={22}
            color={Colors.cardTextSecondary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Report status</Text>
        <View style={styles.backButton} />
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.forestGreen} />
        </View>
      ) : error || !report ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error || "Report not found."}</Text>
          <Pressable onPress={() => void refresh()} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statusCard}>
            <Text style={styles.eyebrow}>CURRENT STATUS</Text>
            <Text style={styles.currentStatus}>{LABELS[report.status]}</Text>
            <Text style={styles.liveHint}>
              <Ionicons name="radio" size={12} color={Colors.forestGreen} />
              {"  "}Live updates enabled
            </Text>
            <View
              accessibilityLabel={`Report progress: ${LABELS[report.status]}`}
              style={styles.stepper}
            >
              {STEPS.map((step, index) => {
                const complete = index <= activeStep;
                return (
                  <View key={step} style={styles.stepWrap}>
                    <View style={styles.stepLineWrap}>
                      {index > 0 ? (
                        <View
                          style={[
                            styles.connector,
                            index <= activeStep && styles.connectorComplete,
                          ]}
                        />
                      ) : null}
                      <View
                        style={[
                          styles.stepDot,
                          complete && styles.stepDotComplete,
                        ]}
                      >
                        {index < activeStep ? (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color="#FFFFFF"
                          />
                        ) : null}
                      </View>
                      {index < STEPS.length - 1 ? (
                        <View
                          style={[
                            styles.connector,
                            index < activeStep && styles.connectorComplete,
                          ]}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        complete && styles.stepLabelComplete,
                      ]}
                    >
                      {LABELS[step]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.description}>{report.description}</Text>
            <View style={styles.separator} />
            <InfoRow label="Neighborhood" value={report.neighborhood} />
            <InfoRow label="Address" value={report.address_line} />
            <InfoRow
              label="Submitted"
              value={new Date(report.created_at).toLocaleString()}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.historyTitle}>STATUS HISTORY</Text>
            {history.length ? (
              history.map((change, index) => (
                <View key={change.id} style={styles.historyRow}>
                  <View style={styles.historyMarkerColumn}>
                    <View
                      style={[
                        styles.historyMarker,
                        index === history.length - 1 &&
                          styles.historyMarkerCurrent,
                      ]}
                    />
                    {index < history.length - 1 ? (
                      <View style={styles.historyStem} />
                    ) : null}
                  </View>
                  <View style={styles.historyCopy}>
                    <Text style={styles.historyStatus}>
                      {LABELS[change.status]}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(change.changed_at).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.description}>
                No status updates recorded yet.
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.homeBackground },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: Colors.cardTextSecondary,
    fontSize: 19,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAEDEA",
    padding: 18,
  },
  eyebrow: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  currentStatus: {
    color: Colors.cardTextSecondary,
    fontSize: 22,
    fontWeight: "700",
    marginTop: 5,
  },
  liveHint: { color: Colors.forestGreen, fontSize: 11, marginTop: 6 },
  stepper: { flexDirection: "row", marginTop: 25 },
  stepWrap: { flex: 1, alignItems: "center" },
  stepLineWrap: { width: "100%", flexDirection: "row", alignItems: "center" },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#C9D1CC",
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotComplete: {
    backgroundColor: Colors.forestGreen,
    borderColor: Colors.forestGreen,
  },
  connector: { height: 2, flex: 1, backgroundColor: "#D9DFDB" },
  connectorComplete: { backgroundColor: Colors.forestGreen },
  stepLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 7,
    textAlign: "center",
  },
  stepLabelComplete: { color: Colors.forestGreen, fontWeight: "700" },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAEDEA",
    padding: 16,
  },
  reportTitle: {
    color: Colors.cardTextSecondary,
    fontSize: 17,
    fontWeight: "700",
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E4E8E5",
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    paddingVertical: 7,
  },
  infoLabel: { color: Colors.textSecondary, fontSize: 12 },
  infoValue: {
    color: Colors.cardTextSecondary,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  historyTitle: {
    color: Colors.cardTextSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 14,
  },
  historyRow: { flexDirection: "row", minHeight: 48 },
  historyMarkerColumn: { alignItems: "center", width: 14, marginRight: 10 },
  historyMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#A7B1AA",
    marginTop: 3,
  },
  historyMarkerCurrent: { backgroundColor: Colors.forestGreen },
  historyStem: {
    width: 1,
    flex: 1,
    backgroundColor: "#DCE2DD",
    marginVertical: 3,
  },
  historyCopy: { flex: 1, paddingBottom: 12 },
  historyStatus: {
    color: Colors.cardTextSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  historyDate: { color: Colors.textSecondary, fontSize: 11, marginTop: 3 },
  error: { color: Colors.error, fontSize: 14, textAlign: "center" },
  retryButton: { padding: 12 },
  retryText: { color: Colors.forestGreen, fontWeight: "700" },
});
