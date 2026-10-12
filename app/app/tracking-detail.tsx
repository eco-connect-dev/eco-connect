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
  getMyTrackedRequest,
  removeRequestsSubscription,
  RequestStatus,
  subscribeToCurrentResidentRequests,
  TrackedRequest,
  TrackingSource,
} from "@/lib/tracking";

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Pending",
  in_review: "In review",
  assigned: "Assigned",
  resolved: "Resolved",
};
const STATUS_STEPS: RequestStatus[] = [
  "pending",
  "in_review",
  "assigned",
  "resolved",
];

export default function TrackingDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, source } = useLocalSearchParams<{
    id: string;
    source: TrackingSource;
  }>();
  const requestId = Array.isArray(id) ? id[0] : id;
  const requestSource = Array.isArray(source) ? source[0] : source;
  const [request, setRequest] = useState<TrackedRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequest = useCallback(async () => {
    if (
      !requestId ||
      (requestSource !== "dumping_reports" &&
        requestSource !== "pickup_requests")
    ) {
      setError("This request link is invalid.");
      setLoading(false);
      return;
    }
    try {
      const result = await getMyTrackedRequest(requestSource, requestId);
      setRequest(result);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Couldn't load this request.",
      );
    } finally {
      setLoading(false);
    }
  }, [requestId, requestSource]);

  useEffect(() => {
    let active = true;
    let channel: Awaited<
      ReturnType<typeof subscribeToCurrentResidentRequests>
    > | null = null;
    void Promise.resolve().then(loadRequest);
    void subscribeToCurrentResidentRequests(() => void loadRequest())
      .then((subscription) => {
        if (active) channel = subscription;
        else void removeRequestsSubscription(subscription);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      if (channel) void removeRequestsSubscription(channel);
    };
  }, [loadRequest]);

  const activeStep = request ? STATUS_STEPS.indexOf(request.status) : -1;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={Colors.cardTextSecondary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Request status</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.forestGreen} />
        </View>
      ) : error || !request ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error || "Request not found."}</Text>
          <Pressable onPress={() => void loadRequest()} style={styles.retry}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>CURRENT STATUS</Text>
            <Text style={styles.currentStatus}>
              {STATUS_LABELS[request.status]}
            </Text>
            <Text style={styles.liveText}>
              <Ionicons name="radio" size={12} color={Colors.forestGreen} />
              {"  "}Live updates enabled
            </Text>
            <View style={styles.stepper}>
              {STATUS_STEPS.map((status, index) => (
                <View key={status} style={styles.step}>
                  <View style={styles.stepTrack}>
                    {index > 0 ? (
                      <View
                        style={[
                          styles.connector,
                          index <= activeStep && styles.connectorActive,
                        ]}
                      />
                    ) : null}
                    <View
                      style={[
                        styles.dot,
                        index <= activeStep && styles.dotActive,
                      ]}
                    />
                    {index < STATUS_STEPS.length - 1 ? (
                      <View
                        style={[
                          styles.connector,
                          index < activeStep && styles.connectorActive,
                        ]}
                      />
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      index <= activeStep && styles.stepLabelActive,
                    ]}
                  >
                    {STATUS_LABELS[status]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{request.category}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>
                {request.source === "pickup_requests"
                  ? "Pickup request"
                  : "Illegal dumping report"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{request.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Submitted</Text>
              <Text style={styles.infoValue}>
                {new Date(request.submitted_at).toLocaleString()}
              </Text>
            </View>
            {request.notes ? (
              <View style={styles.notes}>
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={styles.notesText}>{request.notes}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
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
    alignItems: "center",
    justifyContent: "center",
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
  card: {
    backgroundColor: Colors.surface,
    borderColor: "#EAEDEA",
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  sectionLabel: {
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
  liveText: { color: Colors.forestGreen, fontSize: 11, marginTop: 6 },
  stepper: { flexDirection: "row", marginTop: 24 },
  step: { flex: 1, alignItems: "center" },
  stepTrack: { width: "100%", flexDirection: "row", alignItems: "center" },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#C9D1CC",
    backgroundColor: Colors.surface,
  },
  dotActive: {
    borderColor: Colors.forestGreen,
    backgroundColor: Colors.forestGreen,
  },
  connector: { flex: 1, height: 2, backgroundColor: "#D9DFDB" },
  connectorActive: { backgroundColor: Colors.forestGreen },
  stepLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    marginTop: 7,
    textAlign: "center",
  },
  stepLabelActive: { color: Colors.forestGreen, fontWeight: "700" },
  title: {
    color: Colors.cardTextSecondary,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
  },
  infoLabel: { color: Colors.textSecondary, fontSize: 12 },
  infoValue: {
    color: Colors.cardTextSecondary,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  notes: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E4E8E5",
    marginTop: 4,
    paddingTop: 12,
    gap: 6,
  },
  notesText: { color: Colors.cardTextSecondary, fontSize: 13, lineHeight: 19 },
  error: { color: Colors.error, fontSize: 14, textAlign: "center" },
  retry: { padding: 12 },
  retryText: { color: Colors.forestGreen, fontWeight: "700" },
});
