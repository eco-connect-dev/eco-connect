import { StyleSheet, Text, View } from "react-native";

import type { MapCoordinate, MapPin } from "./MapSelector.native";

type MapSelectorProps = {
  selectedPoint?: MapCoordinate;
  markers?: MapPin[];
  onSelectPoint?: (point: MapCoordinate) => void;
  onMapLoadError?: (message: string) => void;
};

export default function MapSelector({
  selectedPoint: _selectedPoint,
  markers: _markers,
  onSelectPoint: _onSelectPoint,
  onMapLoadError: _onMapLoadError,
}: MapSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map selection is available in the mobile app</Text>
      <Text style={styles.description}>
        You can enter the street address directly in the location field.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#EEF3EF",
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: { color: "#22352A", fontSize: 16, fontWeight: "700", textAlign: "center" },
  description: { color: "#66746A", fontSize: 13, marginTop: 8, textAlign: "center" },
});
