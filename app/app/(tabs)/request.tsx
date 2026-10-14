import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import MapSelector from "@/components/MapSelector";
import {
  DEFAULT_MAP_COORDINATE,
  LocationPickerModal,
} from "@/components/LocationPickerModal";
import { uploadImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

const HEADER_EXTRA_PADDING = 8;
const WASTE_TYPES = [
  { label: "General", icon: "trash-outline" as const },
  { label: "Recyclable", icon: "reload-outline" as const },
  { label: "Hazardous", icon: "warning-outline" as const },
];

export default function RequestScreen() {
  const insets = useSafeAreaInsets();
  const [wasteType, setWasteType] = useState("General");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [location, setLocation] = useState({
    address: "",
    ...DEFAULT_MAP_COORDINATE,
  });
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [mapMessage, setMapMessage] = useState("");
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async () => {
    if (submitting) return;
    if (!location.address.trim()) {
      setSubmitError("Choose a pickup address from the map before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!data.user) {
        router.replace("/(auth)/login");
        return;
      }

      const image_url = photo
        ? await uploadImage("pickup_requests", data.user.id, photo)
        : null;

      const { error } = await supabase.from("pickup_requests").insert({
        resident_id: data.user.id,
        category: wasteType,
        status: "pending",
        location: location.address.trim(),
        notes: notes.trim() || null,
        image_url,
      });
      if (error) throw error;

      setWasteType("General");
      setNotes("");
      setPhoto(null);
      router.replace("/(tabs)/home");
    } catch (error) {
      setSubmitError(formatSubmitError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const choosePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled) {
        setPhoto(result.assets[0]);
        setSubmitError("");
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not open the photo library. Please try again.",
      );
    }
  };

  const selectMapPoint = async (point: { latitude: number; longitude: number }) => {
    setLocation((current) => ({ ...current, ...point, address: "" }));
    setMapMessage("Finding address…");
    setSubmitError("");
    setResolvingLocation(true);
    try {
      if (Platform.OS === "android") {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          throw new Error("Allow location access to find an address for this map point.");
        }
      }

      const [result] = await Location.reverseGeocodeAsync(point);
      if (!result) throw new Error("No address found. Try another point or use the location editor.");

      const street = [result.streetNumber, result.street].filter(Boolean).join(" ");
      const address = result.formattedAddress || [
        street || result.name,
        result.district,
        result.city,
        result.region,
        result.postalCode,
        result.country,
      ].filter((part, index, all) => Boolean(part) && all.indexOf(part) === index).join(", ");
      if (!address) throw new Error("No address found. Try another point or use the location editor.");

      setLocation((current) => ({ ...current, address }));
      setMapMessage("");
    } catch (error) {
      setMapMessage(error instanceof Error ? error.message : "Could not find this address.");
    } finally {
      setResolvingLocation(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + HEADER_EXTRA_PADDING },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerBrand}>
            <Image
              contentFit="contain"
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.headerTitle}>Resident Request</Text>
          </View>
          <View style={styles.profileIcon}>
            <Ionicons name="person-outline" size={18} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.locationMap}>
          <View style={styles.mapCanvas}>
            <MapSelector
              selectedPoint={location}
              onSelectPoint={(point) => void selectMapPoint(point)}
              onMapLoadError={setMapMessage}
            />
          </View>
          <View style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <Ionicons
                name="home-outline"
                size={21}
                color={Colors.forestGreen}
              />
            </View>
            <View style={styles.locationCopy}>
              <Text style={styles.locationTitle}>Pickup Location</Text>
              <Text style={styles.locationAddress}>
                {resolvingLocation
                  ? "Finding address…"
                  : location.address || "Tap the map to select a pickup address"}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Edit pickup location"
              hitSlop={8}
              onPress={() => setIsLocationPickerOpen(true)}
            >
              <Ionicons name="pencil" size={22} color={Colors.forestGreen} />
            </Pressable>
          </View>
          {mapMessage ? (
            <View pointerEvents="none" style={styles.mapMessage}>
              <Text style={styles.mapMessageText}>{mapMessage}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Waste Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeList}
          >
            {WASTE_TYPES.map((type) => {
              const selected = type.label === wasteType;
              return (
                <Pressable
                  key={type.label}
                  onPress={() => setWasteType(type.label)}
                  style={[styles.typeChip, selected && styles.typeChipSelected]}
                >
                  <Ionicons
                    name={type.icon}
                    size={22}
                    color={
                      selected ? Colors.forestGreen : Colors.cardTextSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeText,
                      selected && styles.typeTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photo (Optional)</Text>
          <Pressable
            accessibilityLabel="Upload a photo"
            accessibilityRole="button"
            disabled={submitting}
            onPress={() => void choosePhoto()}
            style={[styles.uploadArea, photo && styles.uploadAreaSelected]}
          >
            {photo ? (
              <>
                <Image
                  contentFit="cover"
                  source={{ uri: photo.uri }}
                  style={styles.photoPreview}
                />
                <Text style={styles.uploadTitle}>Tap to change photo</Text>
              </>
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <Ionicons
                    name="camera-outline"
                    size={35}
                    color={Colors.forestGreen}
                  />
                </View>
                <Text style={styles.uploadTitle}>Tap to upload a photo</Text>
                <Text style={styles.uploadDescription}>
                  Helps our team prepare the right{"\n"}equipment.
                </Text>
                <View style={styles.uploadDecoration} />
              </>
            )}
          </Pressable>
          {photo ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setPhoto(null)}
              style={styles.removePhotoButton}
            >
              <Text style={styles.removePhotoText}>Remove photo</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Pickup Notes</Text>
          <TextInput
            multiline
            onChangeText={setNotes}
            placeholder="E.g., Gate code is 1234. Items are by the side door."
            placeholderTextColor="#A3A9A4"
            style={styles.notesInput}
            textAlignVertical="top"
            value={notes}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={() => void handleSubmit()}
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled,
          ]}
        >
          <LinearGradient
            colors={["#278037", "#0D631B"]}
            end={{ x: 1, y: 0.5 }}
            start={{ x: 0, y: 0.5 }}
            style={styles.submitGradient}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons name="send-outline" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.submitText}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Text>
          </LinearGradient>
        </Pressable>
        {submitError ? (
          <Text accessibilityRole="alert" style={styles.submitError}>
            {submitError}
          </Text>
        ) : null}
      </ScrollView>

      <LocationPickerModal
        visible={isLocationPickerOpen}
        initialPoint={location}
        onClose={() => setIsLocationPickerOpen(false)}
        onSelect={(selected) => {
          setLocation(selected);
          setIsLocationPickerOpen(false);
        }}
      />
    </View>
  );
}

function formatSubmitError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return "We couldn't submit your request. Please try again.";
  }

  const databaseError = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };
  const code = databaseError.code;
  const detail = [databaseError.message, databaseError.details, databaseError.hint]
    .filter(Boolean)
    .join(" — ");

  if (code === "PGRST204" || code === "42703") {
    return `The pickup_requests.image_url column is missing or not in the API schema cache. Apply migration 20261014000008_pickup_request_image_uploads.sql, then reload the Supabase schema cache. ${detail}`;
  }
  if (code === "42501") {
    return `Supabase denied saving this pickup request. Apply migration 20261014000009_fix_pickup_request_insert.sql and confirm you are signed in. ${detail}`;
  }
  return [code, detail].filter(Boolean).join(" — ") || "We couldn't submit your request. Please try again.";
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.homeBackground },
  header: {
    backgroundColor: "rgba(249,249,253,0.96)",
    shadowColor: "#121417",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 64,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerBrand: { alignItems: "center", flexDirection: "row", gap: 9 },
  logo: { height: 32, width: 32 },
  headerTitle: {
    color: Colors.cardTextPrimary,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  profileIcon: {
    alignItems: "center",
    backgroundColor: Colors.forestGreen,
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  content: { gap: 30, padding: 20, paddingBottom: 32 },
  locationMap: {
    backgroundColor: "#E3E4FF",
    borderRadius: 24,
    height: 240,
    justifyContent: "flex-end",
    overflow: "hidden",
    padding: 14,
    position: "relative",
  },
  mapCanvas: {
    ...StyleSheet.absoluteFill,
    bottom: 0,
  },
  mapMessage: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 10,
    bottom: 108,
    maxWidth: "90%",
    paddingHorizontal: 10,
    paddingVertical: 7,
    zIndex: 2,
  },
  mapMessageText: {
    color: Colors.cardTextSecondary,
    fontSize: 12,
    textAlign: "center",
  },
  locationCard: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: "#ECEBF4",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 82,
    paddingHorizontal: 14,
    shadowColor: "#2E335E",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  locationIcon: {
    alignItems: "center",
    backgroundColor: Colors.forestGreenLight,
    borderRadius: 20,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  locationCopy: { flex: 1, marginHorizontal: 13 },
  locationTitle: {
    color: Colors.cardTextSecondary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  locationAddress: {
    color: Colors.cardTextPrimary,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 19,
  },
  section: { gap: 15 },
  sectionTitle: {
    color: Colors.cardTextPrimary,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.35,
  },
  typeList: { gap: 10, paddingRight: 20 },
  typeChip: {
    alignItems: "center",
    backgroundColor: "#F0F0F4",
    borderColor: "transparent",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 45,
    paddingHorizontal: 17,
  },
  typeChipSelected: {
    backgroundColor: "#EAFBF3",
    borderColor: Colors.forestGreen,
  },
  typeText: {
    color: Colors.cardTextSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  typeTextSelected: { color: Colors.forestGreen },
  uploadArea: {
    alignItems: "center",
    borderColor: "#C8DCD0",
    borderRadius: 24,
    borderStyle: "dashed",
    borderWidth: 2,
    height: 178,
    justifyContent: "center",
    overflow: "hidden",
    paddingTop: 5,
  },
  uploadAreaSelected: { height: 210, paddingTop: 0 },
  photoPreview: { height: 150, width: "100%" },
  uploadIcon: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 999,
    height: 62,
    justifyContent: "center",
    shadowColor: "#101A12",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    width: 62,
  },
  uploadTitle: {
    color: Colors.cardTextPrimary,
    fontSize: 15,
    fontWeight: "500",
    marginTop: 13,
  },
  uploadDescription: {
    color: "#899089",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    marginTop: 7,
    textAlign: "center",
  },
  uploadDecoration: {
    backgroundColor: "rgba(86, 97, 88, 0.06)",
    borderRadius: 60,
    bottom: -38,
    height: 108,
    position: "absolute",
    right: -30,
    width: 108,
  },
  removePhotoButton: { alignSelf: "flex-end", marginTop: -20 },
  removePhotoText: { color: Colors.error, fontSize: 13, fontWeight: "600" },
  notesSection: { gap: 9 },
  notesLabel: {
    color: Colors.cardTextSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    color: Colors.cardTextPrimary,
    fontSize: 14,
    lineHeight: 19,
    minHeight: 105,
    padding: 16,
  },
  submitButton: { borderRadius: 28, overflow: "hidden" },
  submitButtonDisabled: { opacity: 0.7 },
  submitGradient: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 57,
  },
  submitText: { color: "#FFFFFF", fontSize: 19, fontWeight: "700" },
  submitError: { color: Colors.error, fontSize: 13, textAlign: "center" },
});
