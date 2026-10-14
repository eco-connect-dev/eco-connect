import * as Location from "expo-location";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import MapSelector, { type MapCoordinate } from "@/components/MapSelector";

export const DEFAULT_MAP_COORDINATE: MapCoordinate = {
  latitude: 6.9271,
  longitude: 79.8612,
};

type LocationPickerModalProps = {
  visible: boolean;
  initialPoint: MapCoordinate;
  onClose: () => void;
  onSelect: (location: MapCoordinate & { address: string }) => void;
};

export function LocationPickerModal({
  visible,
  initialPoint,
  onClose,
  onSelect,
}: LocationPickerModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedPoint, setSelectedPoint] = useState(initialPoint);
  const [manualAddress, setManualAddress] = useState("");
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");
  const [mapLoadError, setMapLoadError] = useState("");

  async function handleUseSelectedPoint() {
    if (resolving) return;
    setResolving(true);
    setError("");
    try {
      if (manualAddress.trim()) {
        onSelect({ ...selectedPoint, address: manualAddress.trim() });
        return;
      }
      if (Platform.OS === "android") {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") {
          throw new Error(
            "Allow location access to look up the address for the point you selected.",
          );
        }
      }

      const results = await Location.reverseGeocodeAsync(selectedPoint);
      const result = results[0];
      if (!result) {
        throw new Error("No street address was found for this map point. Try another point.");
      }

      const street = [result.streetNumber, result.street]
        .filter(Boolean)
        .join(" ");
      const address = result.formattedAddress ||
        [street || result.name, result.district, result.city, result.region, result.postalCode, result.country]
          .filter((part, index, all) => Boolean(part) && all.indexOf(part) === index)
          .join(", ");
      if (!address) {
        throw new Error("No street address was found for this map point. Try another point.");
      }

      onSelect({ ...selectedPoint, address });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not find the address. Try another point or enter the address manually.",
      );
    } finally {
      setResolving(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={styles.title}>Choose a location</Text>
              <Text style={styles.subtitle}>Tap the map to select a point.</Text>
            </View>
            <Pressable accessibilityLabel="Close map" onPress={onClose} style={styles.close}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.map}>
            {visible ? (
              <MapSelector
                selectedPoint={selectedPoint}
                onMapLoadError={setMapLoadError}
                onSelectPoint={(point) => {
                  setSelectedPoint(point);
                  setManualAddress("");
                  setError("");
                  setMapLoadError("");
                }}
              />
            ) : null}
          </View>
          {mapLoadError ? (
            <Text accessibilityRole="alert" style={styles.mapError}>
              Map failed to load. Check your internet connection and reopen the picker.
            </Text>
          ) : null}
          <TextInput
            autoCapitalize="words"
            onChangeText={setManualAddress}
            placeholder="Address (filled from map, or enter manually)"
            placeholderTextColor={Colors.textSecondary}
            style={styles.addressInput}
            value={manualAddress}
          />
          <Text style={styles.coordinateText}>
            {selectedPoint.latitude.toFixed(5)}, {selectedPoint.longitude.toFixed(5)}
          </Text>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable
            accessibilityRole="button"
            disabled={resolving}
            onPress={() => void handleUseSelectedPoint()}
            style={[styles.confirmButton, resolving && styles.disabled]}
          >
            {resolving ? (
              <ActivityIndicator color="#FFFFFF" />
              ) : (
              <Text style={styles.confirmText}>
                {manualAddress.trim() ? "Use entered address" : "Use this map location"}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: "rgba(20,24,21,0.45)", flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.homeBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 12,
    padding: 18,
  },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  heading: { gap: 3 },
  title: { color: Colors.cardTextPrimary, fontSize: 19, fontWeight: "700" },
  subtitle: { color: Colors.textSecondary, fontSize: 13 },
  close: { alignItems: "center", backgroundColor: Colors.surface, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  closeText: { color: Colors.cardTextSecondary, fontSize: 27, lineHeight: 30 },
  map: { height: 360 },
  mapError: { color: Colors.error, fontSize: 12, textAlign: "center" },
  coordinateText: { color: Colors.textSecondary, fontSize: 12, textAlign: "center" },
  addressInput: {
    backgroundColor: Colors.surface,
    borderColor: "#E0E5E1",
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.cardTextSecondary,
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  error: { color: Colors.error, fontSize: 13, textAlign: "center" },
  confirmButton: { alignItems: "center", backgroundColor: Colors.forestGreen, borderRadius: 12, justifyContent: "center", minHeight: 50 },
  confirmText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  disabled: { opacity: 0.7 },
});
