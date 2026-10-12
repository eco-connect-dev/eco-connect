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
  Report,
  ReportStatus,
  updateReportStatus,
} from "@/lib/reports";

const STATUS_LABELS: Record<ReportStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  resolved: "Resolved",
};

export default function CouncilReportDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const reportId = Array.isArray(id) ? id[0] : id;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!reportId) {
      setError("Report not found.");
      setLoading(false);
      return;
    }
    try {
      const result = await getReportStatus(reportId);
      setReport(result.report);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Couldn't load report.",
      );
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function advanceStatus() {
    if (!report || report.status === "resolved") return;
    const nextStatus: ReportStatus =
      report.status === "submitted" ? "under_review" : "resolved";
    setSaving(true);
    setError("");
    try {
      setReport(await updateReportStatus(report.id, nextStatus));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Couldn't update the report status.",
      );
    } finally {
      setSaving(false);
    }
  }

  const nextLabel =
    report?.status === "submitted"
      ? "Move to under review"
      : report?.status === "under_review"
        ? "Mark as resolved"
        : "Report resolved";

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={22}
            color={Colors.councilTextPrimary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Resident report</Text>
        <View style={styles.backButton} />
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.forestGreen} />
        </View>
      ) : !report ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error || "Report not found."}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.statusLabel}>CURRENT STATUS</Text>
            <Text style={styles.status}>{STATUS_LABELS[report.status]}</Text>
            <Text style={styles.title}>{report.title}</Text>
            <Text style={styles.description}>{report.description}</Text>
            <View style={styles.divider} />
            <Info label="Neighborhood" value={report.neighborhood} />
            <Info label="Address" value={report.address_line} />
            <Info
              label="Submitted"
              value={new Date(report.created_at).toLocaleString()}
            />
          </View>
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={saving || report.status === "resolved"}
            onPress={() => void advanceStatus()}
            style={[
              styles.button,
              (saving || report.status === "resolved") && styles.buttonDisabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{nextLabel}</Text>
            )}
          </Pressable>
          <Text style={styles.hint}>
            Status changes are recorded and sent to the resident live.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.councilBorder,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: Colors.councilHeaderText,
    fontSize: 18,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: { padding: 16, gap: 14 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  statusLabel: {
    color: Colors.councilTextSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  status: { color: Colors.forestGreen, fontSize: 19, fontWeight: "700" },
  title: {
    color: Colors.councilTextPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginTop: 6,
  },
  description: {
    color: Colors.councilTextSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.councilBorder,
    marginVertical: 3,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  infoLabel: { color: Colors.councilTextSecondary, fontSize: 12 },
  infoValue: {
    color: Colors.councilTextPrimary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  button: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: Colors.forestGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  hint: {
    color: Colors.councilTextSecondary,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 16,
  },
  error: { color: Colors.error, fontSize: 13, textAlign: "center" },
});
