import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import {
  getRequestTitle,
  listMyRequests,
  removeRequestsSubscription,
  RequestStatus,
  subscribeToCurrentResidentRequests,
  subscribeToMyRequests,
  TrackedRequest,
} from "@/lib/tracking";

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Request received",
  in_review: "Being reviewed",
  assigned: "Crew assigned",
  resolved: "Request completed",
  rejected: "Request rejected",
};

const STATUS_PROGRESS: Record<RequestStatus, number> = {
  pending: 0.25,
  in_review: 0.5,
  assigned: 0.75,
  resolved: 1,
  rejected: 1,
};

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [requests, setRequests] = useState<TrackedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const response = await listMyRequests();
      setRequests(response);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Couldn't load requests.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadRequests();
      let active = true;
      let subscription:
        | ReturnType<typeof subscribeToMyRequests>
        | undefined;

      void subscribeToCurrentResidentRequests(() => {
        void loadRequests(true);
      })
        .then((channel) => {
          if (active) subscription = channel;
          else void removeRequestsSubscription(channel);
        })
        .catch(() => {
          // The initial fetch still works if realtime is unavailable.
        });

      return () => {
        active = false;
        if (subscription) void removeRequestsSubscription(subscription);
      };
    }, [loadRequests]),
  );

  const request =
    requests.find((item) => item.status !== "resolved") ?? requests[0];
  const mapHeight = Math.min(420, Math.max(280, height * 0.42));

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadRequests(true)}
            tintColor={Colors.forestGreen}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mapSection, { height: mapHeight }]}>
          <MapPreview />
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <View style={styles.brand}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.brandTitle}>Resident Tracking</Text>
            </View>
            <Pressable
              accessibilityLabel="Open profile"
              onPress={() => router.push("/(tabs)/profile")}
              style={styles.profileButton}
            >
              <Ionicons name="person" size={15} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.mapTopFade} />
          <View style={styles.crewPill}>
            <Ionicons name="bus" size={18} color="#FFFFFF" />
            <Text style={styles.crewPillText}>
              {request?.status === "assigned"
                ? "Crew is on the way"
                : request
                  ? "Tracking your submission"
                  : "Your submissions map"}
            </Text>
          </View>
          <View style={styles.locationMarker}>
            <View style={styles.markerPulse} />
            <View style={styles.markerDot}>
              <Ionicons name="location" size={16} color={Colors.forestGreen} />
            </View>
          </View>
        </View>

        {loading && !requests.length ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={Colors.forestGreen} />
          </View>
        ) : error && !requests.length ? (
          <View style={styles.stateCard}>
            <Text style={styles.error}>{error}</Text>
            <Pressable onPress={() => void loadRequests()} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : requests.length ? (
          <View style={styles.submissions}>
            <View style={styles.submissionsHeader}>
              <Text style={styles.submissionsTitle}>My submissions</Text>
              <Text style={styles.submissionsCount}>{requests.length}</Text>
            </View>
            {error ? <Text style={styles.refreshError}>{error}</Text> : null}
            {requests.map((item) => (
              <TrackingSheet key={`${item.source}:${item.id}`} request={item} />
            ))}
          </View>
        ) : (
          <View style={styles.stateCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="map-outline"
                size={25}
                color={Colors.forestGreen}
              />
            </View>
            <Text style={styles.emptyTitle}>Nothing to track yet</Text>
            <Text style={styles.emptyText}>
              Your pickup requests and reports will appear here with live
              updates from your local council.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function TrackingSheet({ request }: { request: TrackedRequest }) {
  const progress = STATUS_PROGRESS[request.status];

  return (
    <View style={styles.sheet}>
      <View style={styles.sheetHeader}>
        <View style={styles.sheetIcon}>
          <Ionicons
            name={
              request.source === "pickup_requests"
                ? "trash-outline"
                : "warning-outline"
            }
            size={25}
            color={Colors.forestGreen}
          />
        </View>
        <View style={styles.sheetHeading}>
          <Text style={styles.sheetTitle}>{STATUS_LABELS[request.status]}</Text>
          <Text style={styles.sheetSubtitle}>
            {request.source === "pickup_requests"
              ? "Waste pickup request"
              : "Illegal dumping report"}
          </Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <Text style={styles.requestTitle} numberOfLines={2}>
        {getRequestTitle(request)}
      </Text>

      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={20} color={Colors.forestGreen} />
        <Text style={styles.infoText}>
          Submitted {new Date(request.submitted_at).toLocaleDateString()}
        </Text>
      </View>
      {request.notes ? (
        <Text style={styles.notes} numberOfLines={3}>
          {request.notes}
        </Text>
      ) : null}
      {request.image_url ? (
        <Image
          contentFit="cover"
          source={{ uri: request.image_url }}
          style={styles.requestImage}
        />
      ) : null}
      <View style={styles.infoRow}>
        <Ionicons
          name="location-outline"
          size={20}
          color={Colors.forestGreen}
        />
        <Text style={styles.infoText} numberOfLines={1}>
          {request.location}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabel}>Submitted</Text>
        <Text style={styles.progressLabel}>In progress</Text>
        <Text style={styles.progressLabel}>Complete</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: "/tracking-detail",
            params: { id: request.id, source: request.source },
          })
        }
        style={styles.detailsButton}
      >
        <Text style={styles.detailsButtonText}>View request details</Text>
        <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function MapPreview() {
  return (
    <View style={styles.mapPreview}>
      <View style={[styles.mapRoad, styles.mapRoadOne]} />
      <View style={[styles.mapRoad, styles.mapRoadTwo]} />
      <View style={[styles.mapRoad, styles.mapRoadThree]} />
      <View style={[styles.mapRoad, styles.mapRoadFour]} />
      <View style={[styles.mapBlock, styles.mapBlockOne]} />
      <View style={[styles.mapBlock, styles.mapBlockTwo]} />
      <View style={[styles.mapBlock, styles.mapBlockThree]} />
      <View style={[styles.mapBlock, styles.mapBlockFour]} />
      <View style={styles.mapWater} />
      <View style={styles.mapScale}>
        <View style={styles.mapScaleLine} />
        <Text style={styles.mapScaleLabel}>Colombo, Sri Lanka</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.homeBackground },
  scrollContent: { paddingBottom: 26 },
  submissions: { gap: 14, padding: 16 },
  submissionsHeader: { alignItems: "center", flexDirection: "row", gap: 8 },
  submissionsTitle: {
    color: Colors.cardTextPrimary,
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
  },
  submissionsCount: {
    color: Colors.forestGreen,
    fontSize: 15,
    fontWeight: "700",
  },
  refreshError: { color: Colors.error, fontSize: 13 },
  mapSection: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#D5E6D5",
  },
  mapPreview: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#D8E9D7",
    overflow: "hidden",
  },
  mapRoad: {
    position: "absolute",
    backgroundColor: "#F8F4E8",
    borderColor: "#CADCC6",
    borderWidth: 1,
  },
  mapRoadOne: {
    width: "130%",
    height: 44,
    top: 138,
    left: -50,
    transform: [{ rotate: "-25deg" }],
  },
  mapRoadTwo: {
    width: "140%",
    height: 28,
    top: 330,
    left: -40,
    transform: [{ rotate: "20deg" }],
  },
  mapRoadThree: {
    width: 26,
    height: "130%",
    top: -80,
    left: "48%",
    transform: [{ rotate: "27deg" }],
  },
  mapRoadFour: {
    width: "100%",
    height: 20,
    top: 470,
    left: 10,
    transform: [{ rotate: "-11deg" }],
  },
  mapBlock: {
    position: "absolute",
    backgroundColor: "rgba(105, 161, 103, 0.3)",
    borderRadius: 12,
  },
  mapBlockOne: { width: 100, height: 78, top: 75, left: 18 },
  mapBlockTwo: { width: 128, height: 86, top: 105, right: -12 },
  mapBlockThree: { width: 105, height: 130, top: 290, left: -18 },
  mapBlockFour: { width: 135, height: 88, top: 405, right: 14 },
  mapWater: {
    position: "absolute",
    width: 160,
    height: 260,
    right: -45,
    bottom: -80,
    borderRadius: 100,
    backgroundColor: "rgba(151, 199, 213, 0.35)",
    transform: [{ rotate: "22deg" }],
  },
  mapTopFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: "rgba(249,249,253,0.7)",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    minHeight: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  logo: { width: 30, height: 30, borderRadius: 8 },
  brandTitle: {
    color: Colors.cardTextPrimary,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.25,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.pickupGradientEnd,
    alignItems: "center",
    justifyContent: "center",
  },
  crewPill: {
    position: "absolute",
    top: "52%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 17,
    height: 38,
    borderRadius: 20,
    backgroundColor: Colors.pickupGradientEnd,
    shadowColor: "#121417",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    zIndex: 3,
  },
  crewPillText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  locationMarker: {
    position: "absolute",
    top: "59%",
    alignSelf: "center",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,69,13,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  markerPulse: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.homeBackground,
  },
  markerDot: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: Colors.forestGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  mapScale: {
    position: "absolute",
    left: 16,
    bottom: 18,
    gap: 3,
  },
  mapScaleLine: {
    width: 38,
    height: 3,
    backgroundColor: Colors.cardTextSecondary,
  },
  mapScaleLabel: {
    color: Colors.cardTextSecondary,
    fontSize: 9,
    fontWeight: "600",
  },
  sheet: {
    marginHorizontal: 0,
    marginTop: 0,
    padding: 18,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    shadowColor: "#121417",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
    zIndex: 5,
    gap: 12,
  },
  sheetHeader: { flexDirection: "row", alignItems: "center", gap: 11 },
  sheetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EAFBF3",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetHeading: { flex: 1, gap: 3 },
  sheetTitle: {
    color: Colors.cardTextPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  sheetSubtitle: { color: Colors.textSecondary, fontSize: 11 },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#EAFBF3",
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#168047" },
  liveText: { color: Colors.forestGreen, fontSize: 9, fontWeight: "800" },
  requestTitle: {
    color: Colors.cardTextPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  infoText: { color: Colors.cardTextSecondary, fontSize: 12, flex: 1 },
  notes: { color: Colors.cardTextSecondary, fontSize: 13, lineHeight: 19 },
  requestImage: { width: "100%", height: 150, borderRadius: 12 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,69,13,0.1)",
    overflow: "hidden",
    marginTop: 3,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.forestGreen,
  },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { color: Colors.textSecondary, fontSize: 9 },
  detailsButton: {
    marginTop: 2,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: Colors.pickupGradientEnd,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  detailsButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  stateCard: {
    marginHorizontal: 20,
    marginTop: -48,
    minHeight: 170,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    zIndex: 5,
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
