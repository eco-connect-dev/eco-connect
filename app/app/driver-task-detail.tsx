import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SlideToConfirm } from "@/components/driver/SlideToConfirm";
import MapSelector, { type MapCoordinate, type MapPin } from "@/components/MapSelector";
import { Colors } from "@/constants/Colors";
import { getCouncilRequest, resolveDriverTask, TrackingSource, TrackedRequest } from "@/lib/tracking";

export default function DriverTaskDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, source } = useLocalSearchParams<{ id: string; source: TrackingSource }>();
  const validParams = Boolean(id) && (source === "pickup_requests" || source === "dumping_reports");
  const [task, setTask] = useState<TrackedRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coordinate, setCoordinate] = useState<MapCoordinate | null>(null);
  const [mapMessage, setMapMessage] = useState("");

  useEffect(() => {
    if (!id || (source !== "pickup_requests" && source !== "dumping_reports")) {
      return;
    }
    let active = true;
    void getCouncilRequest(source, id).then((loaded) => {
      if (active) setTask(loaded);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Couldn't load this stop.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, source]);

  useEffect(() => {
    if (!task) return;
    let active = true;
    const address = /sri lanka/i.test(task.location) ? task.location : `${task.location}, Sri Lanka`;
    void Location.geocodeAsync(address).then(([result]) => {
      if (!active) return;
      if (result) setCoordinate({ latitude: result.latitude, longitude: result.longitude });
      else setMapMessage("This address could not be located on the map.");
    }).catch(() => {
      if (active) setMapMessage("The location map could not be loaded.");
    });
    return () => { active = false; };
  }, [task]);

  const locationPin: MapPin | null = task && coordinate ? {
    id: `${task.source}:${task.id}`,
    ...coordinate,
    title: task.location,
    kind: task.source === "pickup_requests" ? "pickup" : "dump",
  } : null;

  const confirmCollection = async () => {
    if (!id || !task || (source !== "pickup_requests" && source !== "dumping_reports") || saving) return;
    setSaving(true);
    setError("");
    try {
      await resolveDriverTask(source, id);
      router.replace("/(tabs)/driver-dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't confirm collection.");
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to route" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color="#17283A" /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.eyebrow}>ECOCONNECT • ACTIVE TASK</Text><Text style={styles.headerTitle}>Stop Verification</Text></View>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.taskBanner}><View style={styles.bannerIcon}><Ionicons name="clipboard-outline" size={27} color="#087A55" /></View><View style={styles.bannerCopy}><Text style={styles.eyebrow}>ASSIGNED STOP</Text><Text style={styles.bannerTitle}>Collection verification</Text><Text style={styles.subtleText}>Review the request details before confirming.</Text></View></View>
        {loading && validParams ? <View style={styles.state}><ActivityIndicator color={Colors.forestGreen} /><Text style={styles.subtleText}>Loading stop…</Text></View> : task ? <>
          <View style={styles.card}>
            <View style={styles.cardTop}><View style={styles.stopPill}><View style={styles.dot} /><Text style={styles.stopPillText}>Assigned</Text></View><Text style={styles.date}>{new Date(task.submitted_at).toLocaleDateString()}</Text></View>
            <Text style={styles.location}>{task.location}</Text>
            <Text style={styles.subtleText}>{task.source === "pickup_requests" ? "Pickup request" : "Illegal dumping report"} · {task.category}</Text>
            <View style={styles.contactRow}><View style={styles.locationIcon}><Ionicons name="location" size={20} color="#087A55" /></View><View style={styles.flex}><Text style={styles.rowLabel}>Collection location</Text><Text style={styles.rowValue}>{task.location}</Text></View></View>
          </View>
          <View style={styles.mapCard}><View style={styles.mapHeading}><Ionicons name="location" size={20} color="#087A55" /><Text style={styles.sectionTitle}>Stop location</Text></View><View style={styles.map}><MapSelector selectedPoint={coordinate ?? { latitude: 6.9271, longitude: 79.8612 }} markers={locationPin ? [locationPin] : []} onMapLoadError={setMapMessage} /></View>{mapMessage ? <Text style={styles.subtleText}>{mapMessage}</Text> : null}<Text style={styles.mapAddress}>{task.location}</Text></View>
          <View style={styles.card}><Text style={styles.sectionTitle}>Waste details</Text><Text style={styles.rowLabel}>Category</Text><Text style={styles.rowValue}>{task.category}</Text><Text style={[styles.rowLabel, { marginTop: 12 }]}>Resident notes</Text><Text style={styles.notes}>{task.notes || "No additional notes provided."}</Text>{task.image_url ? <Image source={{ uri: task.image_url }} contentFit="cover" style={styles.image} /> : null}</View>
          <View style={styles.confirmCard}><Text style={styles.sectionTitle}>Confirm collection</Text><Text style={styles.subtleText}>After the waste is collected, slide to mark this stop as resolved.</Text><SlideToConfirm disabled={saving} onConfirm={() => void confirmCollection()} /></View>
        </> : <View style={styles.state}><Ionicons name="alert-circle-outline" size={30} color="#AE2929" /><Text style={styles.subtleText}>{error || (validParams ? "Stop not found." : "This stop could not be identified.")}</Text></View>}
        {error && task ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F5F7FF", flex: 1 }, header: { alignItems: "center", backgroundColor: "#FFFFFF", borderBottomColor: "#E8EBF2", borderBottomWidth: 1, flexDirection: "row", gap: 14, paddingBottom: 14, paddingHorizontal: 18 },
  backButton: { alignItems: "center", backgroundColor: "#EAF0FF", borderRadius: 24, height: 44, justifyContent: "center", width: 44 }, headerCopy: { flex: 1 }, headerSpacer: { width: 12 }, eyebrow: { color: "#138260", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }, headerTitle: { color: "#17283A", fontSize: 20, fontWeight: "800", marginTop: 3 },
  content: { gap: 16, padding: 18, paddingBottom: 40 }, taskBanner: { alignItems: "center", backgroundColor: "#EAF0FF", borderRadius: 18, flexDirection: "row", gap: 13, padding: 16 }, bannerIcon: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, height: 54, justifyContent: "center", width: 54 }, bannerCopy: { flex: 1, gap: 3 }, bannerTitle: { color: "#17283A", fontSize: 16, fontWeight: "800" }, subtleText: { color: "#66746E", fontSize: 13, lineHeight: 19 },
  card: { backgroundColor: "#FFFFFF", borderColor: "#E9EDF4", borderRadius: 20, borderWidth: 1, gap: 10, padding: 18 }, cardTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, stopPill: { alignItems: "center", backgroundColor: "#E8F0FF", borderRadius: 20, flexDirection: "row", gap: 7, paddingHorizontal: 12, paddingVertical: 7 }, dot: { backgroundColor: "#087A55", borderRadius: 5, height: 9, width: 9 }, stopPillText: { color: "#087A55", fontSize: 12, fontWeight: "800" }, date: { color: "#63716C", fontSize: 12 }, location: { color: "#17283A", fontSize: 23, fontWeight: "800", lineHeight: 29 },
  contactRow: { alignItems: "center", backgroundColor: "#F0F4FF", borderRadius: 14, flexDirection: "row", gap: 12, marginTop: 7, padding: 12 }, locationIcon: { alignItems: "center", backgroundColor: "#DDF5EA", borderRadius: 25, height: 42, justifyContent: "center", width: 42 }, flex: { flex: 1 }, rowLabel: { color: "#68776F", fontSize: 12, fontWeight: "600" }, rowValue: { color: "#243649", fontSize: 15, fontWeight: "700", marginTop: 3 }, sectionTitle: { color: "#17283A", fontSize: 18, fontWeight: "800" }, notes: { backgroundColor: "#F5F7FF", borderRadius: 12, color: "#43524D", fontSize: 14, lineHeight: 21, padding: 13 }, image: { backgroundColor: "#E8EDF2", borderRadius: 14, height: 220, marginTop: 5, width: "100%" },
  mapCard: { backgroundColor: "#FFFFFF", borderColor: "#E9EDF4", borderRadius: 20, borderWidth: 1, gap: 11, padding: 14 }, mapHeading: { alignItems: "center", flexDirection: "row", gap: 8 }, map: { borderRadius: 14, height: 240, overflow: "hidden" }, mapAddress: { color: "#43524D", fontSize: 13, fontWeight: "600" },
  confirmCard: { backgroundColor: "#FFFFFF", borderColor: "#E9EDF4", borderRadius: 20, borderWidth: 1, gap: 11, padding: 18 }, state: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 18, gap: 12, padding: 30 }, error: { backgroundColor: "#FFF0F0", borderRadius: 10, color: "#AE2929", padding: 12 },
});
