import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import MapSelector, { type MapCoordinate, type MapPin } from "@/components/MapSelector";
import {
  getRequestTitle,
  listMyRequests,
  removeRequestsSubscription,
  RequestStatus,
  subscribeToCurrentResidentRequests,
  subscribeToMyRequests,
  TrackedRequest,
} from "@/lib/tracking";

type SubmissionFilter = "all" | "dump" | "pickup";

const geocodeCache = new Map<string, MapCoordinate | null>();

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
  const [mapMarkers, setMapMarkers] = useState<MapPin[]>([]);
  const [mappingSubmissions, setMappingSubmissions] = useState(false);
  const [mapMessage, setMapMessage] = useState("");
  const [filter, setFilter] = useState<SubmissionFilter>("all");
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
      const activeIds = new Set(
        response
          .filter((item) => item.status !== "resolved")
          .map((item) => `${item.source}:${item.id}`),
      );
      setMapMarkers((current) => current.filter((marker) => activeIds.has(marker.id)));
      setMapMessage(
        response.length > 0 && activeIds.size === 0
          ? "Resolved submissions are hidden from Track."
          : "",
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Couldn't load requests.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const activeRequests = useMemo(
    () => requests.filter((item) => item.status !== "resolved"),
    [requests],
  );

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

  useEffect(() => {
    if (!activeRequests.length) return;

    let active = true;

    async function locateSubmissions() {
      const pins: MapPin[] = [];
      try {
        if (Platform.OS === "android") {
          const currentPermission = await Location.getForegroundPermissionsAsync();
          const permission = currentPermission.granted
            ? currentPermission
            : await Location.requestForegroundPermissionsAsync();
          if (!permission.granted) {
            if (active) {
              setMapMessage("Allow location access to place your submissions on the map.");
            }
            return;
          }
        }
        if (!active) return;
        setMappingSubmissions(true);
        setMapMessage("");
        setMapMarkers([]);

        for (let start = 0; start < activeRequests.length; start += 4) {
          if (!active) return;
          const batch = activeRequests.slice(start, start + 4);
          const batchPins = await Promise.all(
            batch.map(async (request) => {
              const address = /sri lanka/i.test(request.location)
                ? request.location
                : `${request.location}, Sri Lanka`;
              const cacheKey = address.trim().toLowerCase();
              let coordinate = geocodeCache.get(cacheKey);
              if (coordinate === undefined) {
                try {
                  const [result] = await Location.geocodeAsync(address);
                  coordinate = result
                    ? { latitude: result.latitude, longitude: result.longitude }
                    : null;
                } catch {
                  coordinate = null;
                }
                geocodeCache.set(cacheKey, coordinate);
              }
              if (!coordinate) return null;
              return {
                id: `${request.source}:${request.id}`,
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                title: `${request.source === "pickup_requests" ? "Pickup" : "Dump report"}: ${request.location}`,
                kind: request.source === "pickup_requests" ? "pickup" as const : "dump" as const,
              };
            }),
          );
          pins.push(...batchPins.filter((pin): pin is MapPin => pin !== null));
        }
        if (active) {
          setMapMarkers(pins);
          if (!pins.length) {
            setMapMessage("No submission locations could be found for the map.");
          }
        }
      } catch {
        if (active) {
          setMapMessage("Submission locations could not be loaded for the map.");
        }
      } finally {
        if (active) setMappingSubmissions(false);
      }
    }

    void locateSubmissions();
    return () => {
      active = false;
    };
  }, [activeRequests]);

  const filteredRequests = activeRequests.filter((item) => {
    if (filter === "dump") return item.source === "dumping_reports";
    if (filter === "pickup") return item.source === "pickup_requests";
    return true;
  });
  const filteredMapMarkers = mapMarkers.filter((marker) => {
    if (filter === "dump") return marker.kind === "dump";
    if (filter === "pickup") return marker.kind === "pickup";
    return true;
  });
  const request =
    filteredRequests.find((item) => item.status !== "resolved") ?? filteredRequests[0];
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
          <View style={styles.mapCanvas}>
            <MapSelector
              markers={filteredMapMarkers}
              onMapLoadError={setMapMessage}
            />
          </View>
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
              {mappingSubmissions
                ? "Locating submissions"
                : request?.status === "assigned"
                ? "Crew is on the way"
                : request
                  ? "Tracking your submissions"
                  : "Your submissions map"}
            </Text>
          </View>
          {mapMessage ? (
            <View style={styles.mapNotice}>
              <Text style={styles.mapNoticeText}>{mapMessage}</Text>
            </View>
          ) : null}
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.dumpDot]} />
              <Text style={styles.legendText}>Dump report</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.pickupDot]} />
              <Text style={styles.legendText}>Pickup</Text>
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
        ) : activeRequests.length ? (
          <View style={styles.submissions}>
            <View style={styles.submissionsHeader}>
              <Text style={styles.submissionsTitle}>My submissions</Text>
              <Text style={styles.submissionsCount}>{filteredRequests.length}</Text>
            </View>
            {error ? <Text style={styles.refreshError}>{error}</Text> : null}
            <View style={styles.filters}>
              {([
                { key: "all", label: `All (${activeRequests.length})` },
                {
                  key: "dump",
                  label: `Dump reports (${activeRequests.filter((item) => item.source === "dumping_reports").length})`,
                },
                {
                  key: "pickup",
                  label: `Pickup (${activeRequests.filter((item) => item.source === "pickup_requests").length})`,
                },
              ] as const).map((option) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === option.key }}
                  key={option.key}
                  onPress={() => setFilter(option.key)}
                  style={[
                    styles.filterButton,
                    filter === option.key && styles.filterButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === option.key && styles.filterTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {filteredRequests.length ? (
              filteredRequests.map((item) => (
                <TrackingSheet key={`${item.source}:${item.id}`} request={item} />
              ))
            ) : (
              <View style={styles.filteredEmpty}>
                <Text style={styles.emptyText}>
                  {filter === "dump"
                    ? "You haven’t submitted any dumping reports yet."
                    : "You haven’t submitted any pickup requests yet."}
                </Text>
              </View>
            )}
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
            <Text style={styles.emptyTitle}>
              {requests.length ? "No active submissions" : "Nothing to track yet"}
            </Text>
            <Text style={styles.emptyText}>
              {requests.length
                ? "Completed requests and reports are hidden from Track."
                : "Your pickup requests and reports will appear here with live updates from your local council."}
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
    backgroundColor: "#E7ECE7",
  },
  mapCanvas: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
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
  mapNotice: {
    position: "absolute",
    bottom: 55,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    maxWidth: "90%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 3,
  },
  mapNoticeText: {
    color: Colors.cardTextSecondary,
    fontSize: 11,
    textAlign: "center",
  },
  mapLegend: {
    position: "absolute",
    bottom: 14,
    left: 14,
    flexDirection: "row",
    gap: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    zIndex: 2,
  },
  legendItem: { alignItems: "center", flexDirection: "row", gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  dumpDot: { backgroundColor: "#E86B45" },
  pickupDot: { backgroundColor: "#08752B" },
  legendText: { color: Colors.cardTextSecondary, fontSize: 9, fontWeight: "600" },
  filters: { flexDirection: "row", gap: 8 },
  filterButton: {
    backgroundColor: Colors.surface,
    borderColor: "#E0E5E1",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  filterButtonSelected: {
    backgroundColor: "#EAFBF3",
    borderColor: Colors.forestGreen,
  },
  filterText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "600" },
  filterTextSelected: { color: Colors.forestGreen },
  filteredEmpty: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
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
