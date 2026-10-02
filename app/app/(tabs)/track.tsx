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
import {
  getRequestTitle,
  listMyRequests,
  RequestStatus,
  subscribeToCurrentResidentRequests,
  removeRequestsSubscription,
  TrackedRequest,
} from "@/lib/tracking";

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Pending",
  in_review: "In review",
  assigned: "Assigned",
  resolved: "Resolved",
};

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState<TrackedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      setRequests(await listMyRequests());
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
      let active = true;
      let channel: Awaited<
        ReturnType<typeof subscribeToCurrentResidentRequests>
      > | null = null;
      void loadRequests();
      void subscribeToCurrentResidentRequests(() => {
        void loadRequests(true);
      })
        .then((subscription) => {
          if (active) channel = subscription;
          else void removeRequestsSubscription(subscription);
        })
        .catch(() => undefined);
      return () => {
        active = false;
        if (channel) void removeRequestsSubscription(channel);
      };
    }, [loadRequests]),
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Track Requests</Text>
        <Text style={styles.subtitle}>Updates from your local council</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadRequests(true)}
            tintColor={Colors.forestGreen}
          />
        }
      >
        {loading ? (
          <ActivityIndicator color={Colors.forestGreen} style={styles.loader} />
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.error}>{error}</Text>
            <Pressable onPress={() => void loadRequests()} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : requests.length ? (
          requests.map((request) => (
            <Pressable
              accessibilityRole="button"
              key={`${request.source}:${request.id}`}
              onPress={() =>
                router.push({
                  pathname: "/tracking-detail",
                  params: { id: request.id, source: request.source },
                })
              }
              style={styles.reportCard}
            >
              <View style={styles.reportTop}>
                <Text style={styles.reportTitle} numberOfLines={2}>
                  {getRequestTitle(request)}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#829087" />
              </View>
              <Text style={styles.neighborhood}>
                {request.location} ·{" "}
                {new Date(request.submitted_at).toLocaleDateString()}
              </Text>
              <Text style={styles.requestType}>
                {request.source === "pickup_requests"
                  ? "Pickup request"
                  : "Illegal dumping report"}
              </Text>
              <View style={styles.statusLine}>
                <View style={[styles.dot, styles[`dot_${request.status}`]]} />
                <Text style={styles.statusText}>
                  {STATUS_LABELS[request.status]}
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
            <Text style={styles.emptyTitle}>No requests or reports yet</Text>
            <Text style={styles.emptyText}>
              Your pickup requests and illegal dumping reports will appear here
              with their latest council status.
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
  requestType: { color: Colors.textSecondary, fontSize: 11 },
  statusLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dot_pending: { backgroundColor: "#D99018" },
  dot_in_review: { backgroundColor: "#2878C8" },
  dot_assigned: { backgroundColor: "#7A56C2" },
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
