import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import MapSelector, { type MapCoordinate, type MapPin } from "@/components/MapSelector";

const DEFAULT_CENTER: MapCoordinate = { latitude: 6.9271, longitude: 79.8612 };
const coordinateCache = new Map<string, MapCoordinate | null>();

type RequestLocationMapProps = {
  location: string;
  kind: MapPin["kind"];
};

export function RequestLocationMap({ location, kind }: RequestLocationMapProps) {
  const [coordinate, setCoordinate] = useState<MapCoordinate | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!location.trim()) return;
    let active = true;
    const address = /sri lanka/i.test(location) ? location : `${location}, Sri Lanka`;
    const key = address.trim().toLowerCase();

    async function locateAddress() {
      setLoading(true);
      setMessage("");
      let result = coordinateCache.get(key);
      if (result === undefined) {
        try {
          const [match] = await Location.geocodeAsync(address);
          result = match ? { latitude: match.latitude, longitude: match.longitude } : null;
        } catch {
          result = null;
        }
        coordinateCache.set(key, result);
      }
      if (!active) return;
      setCoordinate(result);
      setMessage(result ? "" : "This address could not be located on the map.");
      setLoading(false);
    }

    void locateAddress();
    return () => { active = false; };
  }, [location]);

  const marker: MapPin | null = coordinate ? {
    id: `council-request:${location}`,
    ...coordinate,
    title: location,
    kind,
  } : null;

  return (
    <View style={styles.container}>
      <View style={styles.map}>
        <MapSelector
          selectedPoint={coordinate ?? DEFAULT_CENTER}
          markers={marker ? [marker] : []}
          onMapLoadError={setMessage}
        />
      </View>
      {loading ? (
        <View style={styles.statusRow}><ActivityIndicator size="small" color="#176B45" /><Text style={styles.message}>Locating request address…</Text></View>
      ) : message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  map: { height: 220, overflow: "hidden", borderRadius: 12 },
  statusRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  message: { color: "#66746A", fontSize: 12 },
});
