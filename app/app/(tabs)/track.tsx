import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { listMyReports, Report, ReportStatus } from "@/lib/reports";

const STATUS_LABELS: Record<ReportStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  resolved: "Resolved",
};

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReports = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      setReports(await listMyReports());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Couldn't load reports.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadReports();
    }, [loadReports]),
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Track Reports</Text>
        <Text style={styles.subtitle}>Updates from your local council</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadReports(true)}
            tintColor={Colors.forestGreen}
          />
        }
      >
        {loading ? (
          <ActivityIndicator color={Colors.forestGreen} style={styles.loader} />
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.error}>{error}</Text>
            <Pressable onPress={() => void loadReports()} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : reports.length ? (
          reports.map((report) => (
            <Pressable
              accessibilityRole="button"
              key={report.id}
              onPress={() =>
                router.push({
                  pathname: "/report-detail",
                  params: { id: report.id },
                })
              }
              style={styles.reportCard}
            >
              <View style={styles.reportTop}>
                <Text style={styles.reportTitle} numberOfLines={2}>
                  {report.title}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#829087" />
              </View>
              <Text style={styles.neighborhood}>
                {report.neighborhood} ·{" "}
                {new Date(report.created_at).toLocaleDateString()}
              </Text>
              <View style={styles.statusLine}>
                <View style={[styles.dot, styles[`dot_${report.status}`]]} />
                <Text style={styles.statusText}>
                  {STATUS_LABELS[report.status]}
                </Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="document-text-outline"
                size={25}
                color={Colors.forestGreen}
              />
            </View>
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptyText}>
              Reports you submit will appear here with their latest council
              status.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.homeBackground },
  header: { paddingHorizontal: 20, paddingBottom: 18 },
  title: { color: Colors.cardTextSecondary, fontSize: 25, fontWeight: "700" },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  content: { padding: 16, paddingBottom: 30, gap: 12, flexGrow: 1 },
  loader: { marginTop: 32 },
  reportCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAEDEA",
    gap: 10,
  },
  reportTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  reportTitle: {
    color: Colors.cardTextSecondary,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  neighborhood: { color: Colors.textSecondary, fontSize: 12 },
  statusLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dot_submitted: { backgroundColor: "#D99018" },
  dot_under_review: { backgroundColor: "#2878C8" },
  dot_resolved: { backgroundColor: "#168047" },
  statusText: {
    color: Colors.cardTextSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyCard: {
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    gap: 9,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAFBF3",
  },
  emptyTitle: {
    color: Colors.cardTextSecondary,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  error: { color: Colors.error, fontSize: 13, textAlign: "center" },
  retry: { paddingHorizontal: 16, paddingVertical: 8 },
  retryText: { color: Colors.forestGreen, fontSize: 13, fontWeight: "700" },
});
