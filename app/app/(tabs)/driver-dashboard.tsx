import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MapSelector, { type MapCoordinate, type MapPin } from "@/components/MapSelector";
import { Colors } from "@/constants/Colors";
import { listAssignedDriverTasks, removeDriverTasksSubscription, subscribeToDriverTasks, TrackedRequest } from "@/lib/tracking";

const COLOMBO_CENTER = { latitude: 6.9271, longitude: 79.8612 };
const geocodeCache = new Map<string, MapCoordinate | null>();

export default function DriverDashboardScreen() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<TrackedRequest[]>([]);
  const [markers, setMarkers] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [error, setError] = useState("");
  const [mapMessage, setMapMessage] = useState("");

  const loadTasks = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      setTasks(await listAssignedDriverTasks());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't load assigned tasks.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadTasks();
    const channel = subscribeToDriverTasks(() => { void loadTasks(true); });
    return () => { void removeDriverTasksSubscription(channel); };
  }, [loadTasks]));

  useEffect(() => {
    let active = true;
    async function mapTasks() {
      if (!tasks.length) { setMarkers([]); setMapping(false); setMapMessage("Assigned stops will appear here."); return; }
      setMapping(true);
      setMapMessage("");
      const pins = await Promise.all(tasks.map(async (task): Promise<MapPin | null> => {
        const key = task.location.trim().toLowerCase();
        let coordinate = geocodeCache.get(key);
        if (coordinate === undefined) {
          try {
            const [result] = await Location.geocodeAsync(task.location);
            coordinate = result ? { latitude: result.latitude, longitude: result.longitude } : null;
          } catch { coordinate = null; }
          geocodeCache.set(key, coordinate);
        }
        if (!coordinate) return null;
        return { ...coordinate, id: `${task.source}:${task.id}`, title: task.location, kind: task.source === "pickup_requests" ? "pickup" : "dump" };
      }));
      if (!active) return;
      const validPins = pins.filter((pin): pin is MapPin => pin !== null);
      setMarkers(validPins);
      if (!validPins.length) setMapMessage("We couldn't locate these addresses. The assigned stops are still listed below.");
      setMapping(false);
    }
    void mapTasks();
    return () => { active = false; };
  }, [tasks]);

  const openStop = (task: TrackedRequest) => router.push({ pathname: "/driver-task-detail", params: { id: task.id, source: task.source } });

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}><Ionicons name="leaf" size={21} color="#FFFFFF" /></View>
          <View><Text style={styles.eyebrow}>ECOCONNECT • DRIVER</Text><Text style={styles.headerTitle}>Route Map</Text></View>
        </View>
        <Pressable accessibilityLabel="Open driver profile" onPress={() => router.push("/(tabs)/profile")} style={styles.profileButton}><Ionicons name="person-outline" size={20} color={Colors.forestGreen} /></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadTasks(true)} tintColor={Colors.forestGreen} />} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}><Ionicons name="git-branch-outline" size={24} color="#087A55" /></View>
          <View style={styles.summaryCopy}><Text style={styles.sectionTitle}>Route Progress</Text><Text style={styles.routeCount}>{tasks.length ? `0 of ${tasks.length} stops complete` : "No assigned stops"}</Text><Text style={styles.subtleText}>Pickup requests and dumping reports assigned by council</Text></View>
          <Text style={styles.count}>{tasks.length}</Text>
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <View style={styles.mapCard}>
          <View style={styles.mapHeading}><View><Text style={styles.sectionTitle}>Assigned Route</Text><Text style={styles.subtleText}>{mapping ? "Locating assigned addresses…" : `${markers.length} of ${tasks.length} stops located`}</Text></View><Ionicons name="navigate-circle" size={30} color="#087A55" /></View>
          <View style={styles.map}><MapSelector selectedPoint={COLOMBO_CENTER} markers={markers} onMapLoadError={setMapMessage} /></View>
          {mapMessage ? <Text style={styles.mapMessage}>{mapMessage}</Text> : null}
          <View style={styles.legend}><View style={[styles.greenDot, { backgroundColor: "#08752b" }]} /><Text style={styles.legendText}>Pickup</Text><View style={[styles.greenDot, { backgroundColor: "#e86b45" }]} /><Text style={styles.legendText}>Illegal dump</Text></View>
        </View>
        {loading && !tasks.length ? <View style={styles.stateCard}><ActivityIndicator color={Colors.forestGreen} /><Text style={styles.subtleText}>Loading assigned route…</Text></View> : tasks.length ? (
          <View style={styles.listSection}>
            <View style={styles.listHeading}><Text style={styles.sectionTitle}>Stops on Route</Text><Text style={styles.subtleText}>{tasks.length} assigned</Text></View>
            {tasks.map((task, index) => (
              <Pressable key={`${task.source}:${task.id}`} onPress={() => openStop(task)} style={styles.taskCard}>
                <View style={styles.stopNumber}><Text style={styles.stopNumberText}>{index + 1}</Text></View>
                <View style={styles.taskCopy}><Text style={styles.taskTitle} numberOfLines={2}>{task.location}</Text><Text style={styles.metaText}>{task.category} · {task.source === "pickup_requests" ? "Pickup" : "Illegal dump"}</Text></View>
                <Ionicons name="chevron-forward" size={20} color="#91A79C" />
              </Pressable>
            ))}
          </View>
        ) : <View style={styles.emptyCard}><View style={styles.emptyIcon}><Ionicons name="checkmark-done-outline" size={30} color="#087A55" /></View><Text style={styles.emptyTitle}>{error ? "Tasks unavailable" : "No assigned stops"}</Text><Text style={styles.subtleText}>{error ? "Pull down to retry loading your route." : "New stops will appear here when council dispatches them."}</Text><Pressable accessibilityRole="button" onPress={() => void loadTasks(true)} style={styles.refreshButton}><Text style={styles.refreshText}>Refresh route</Text></Pressable></View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F5F7FF", flex: 1 },
  header: { alignItems: "center", backgroundColor: "#FFFFFF", borderBottomColor: "#E8EBF2", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingBottom: 14, paddingHorizontal: 20 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 11 }, logoMark: { alignItems: "center", backgroundColor: "#087A55", borderRadius: 12, height: 40, justifyContent: "center", width: 40 },
  eyebrow: { color: "#138260", fontSize: 10, fontWeight: "800", letterSpacing: 1 }, headerTitle: { color: "#17283A", fontSize: 21, fontWeight: "800", marginTop: 2 },
  profileButton: { alignItems: "center", backgroundColor: "#EAF0FF", borderRadius: 24, height: 44, justifyContent: "center", width: 44 },
  content: { gap: 16, padding: 18, paddingBottom: 34 }, summaryCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 18, flexDirection: "row", gap: 12, padding: 16 },
  summaryIcon: { alignItems: "center", backgroundColor: "#E1F8EE", borderRadius: 14, height: 46, justifyContent: "center", width: 46 }, summaryCopy: { flex: 1, gap: 4 },
  sectionTitle: { color: "#17283A", fontSize: 17, fontWeight: "800" }, subtleText: { color: "#66746E", fontSize: 13, lineHeight: 19 }, count: { color: "#087A55", fontSize: 24, fontWeight: "800" }, routeCount: { color: "#087A55", fontSize: 17, fontWeight: "700" },
  mapCard: { backgroundColor: "#FFFFFF", borderColor: "#E9EDF4", borderRadius: 20, borderWidth: 1, gap: 12, padding: 14 }, mapHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, map: { height: 300, overflow: "hidden", borderRadius: 16 }, mapMessage: { color: "#66746E", fontSize: 12 }, legend: { alignItems: "center", flexDirection: "row", gap: 7 }, legendText: { color: "#56655E", fontSize: 12, marginRight: 12 },
  listSection: { gap: 10 }, listHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 2 }, taskCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E9EDF4", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, padding: 15 }, stopNumber: { alignItems: "center", backgroundColor: "#E8F0FF", borderRadius: 20, height: 40, justifyContent: "center", width: 40 }, stopNumberText: { color: "#087A55", fontSize: 16, fontWeight: "800" }, taskCopy: { flex: 1, gap: 5 }, taskTitle: { color: "#17283A", fontSize: 16, fontWeight: "800" }, metaText: { color: "#63716C", fontSize: 12 },
  stateCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 18, gap: 12, padding: 28 }, emptyCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 20, gap: 12, marginTop: 24, padding: 28 }, emptyIcon: { alignItems: "center", backgroundColor: "#E1F8EE", borderRadius: 30, height: 60, justifyContent: "center", width: 60 }, emptyTitle: { color: "#17283A", fontSize: 19, fontWeight: "800" }, refreshButton: { backgroundColor: "#087A55", borderRadius: 10, marginTop: 4, paddingHorizontal: 18, paddingVertical: 11 }, refreshText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" }, error: { backgroundColor: "#FFF0F0", borderRadius: 10, color: "#AE2929", padding: 12 }, greenDot: { backgroundColor: "#087A55", borderRadius: 5, height: 9, width: 9 },
});
