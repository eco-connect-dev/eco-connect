import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";

const HEADER_EXTRA_PADDING = 8;
const REQUESTS_STORAGE_KEY = "eco-connect:pickup-requests";
const MAX_PHOTOS = 5;
const WASTE_TYPES = [
  { label: "General", icon: "trash-outline" as const },
  { label: "Recyclable", icon: "reload-outline" as const },
  { label: "Hazardous", icon: "warning-outline" as const },
];

type RequestPhoto = {
  uri: string;
  fileName: string | null;
};

export default function RequestScreen() {
  const insets = useSafeAreaInsets();
  const [wasteType, setWasteType] = useState("General");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<RequestPhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState({
    address: "31/2, Seevali Mawatha, Malabe",
    latitude: 6.9271,
    longitude: 79.8612,
  });
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [locationDraft, setLocationDraft] = useState(location);
  const [pinPosition, setPinPosition] = useState({ x: 51, y: 49 });
  const [mapWidth, setMapWidth] = useState(1);

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      base64: true,
      mediaTypes: ["images"],
      quality: 0.7,
      selectionLimit: MAX_PHOTOS - photos.length,
    });

    if (result.canceled) return;

    const newPhotos = result.assets.map((asset, index) => ({
      fileName: asset.fileName ?? `pickup-photo-${Date.now()}-${index + 1}.jpg`,
      // Keeping the image data in AsyncStorage makes the request available locally after an app restart.
      uri: asset.base64
        ? `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`
        : asset.uri,
    }));

    setPhotos((current) => [...current, ...newPhotos].slice(0, MAX_PHOTOS));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const request = {
      id: `request-${Date.now()}`,
      createdAt: new Date().toISOString(),
      location,
      notes: notes.trim(),
      photos,
      status: "pending" as const,
      wasteType,
    };

    try {
      const savedRequests = await AsyncStorage.getItem(REQUESTS_STORAGE_KEY);
      const existingRequests = savedRequests ? JSON.parse(savedRequests) : [];
      const requests = Array.isArray(existingRequests) ? existingRequests : [];

      await AsyncStorage.setItem(
        REQUESTS_STORAGE_KEY,
        JSON.stringify([request, ...requests]),
      );
      setNotes("");
      setPhotos([]);
      Alert.alert(
        "Request submitted",
        "Your pickup request was saved successfully.",
      );
    } catch {
      Alert.alert(
        "Could not submit request",
        "Your request could not be saved locally. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLocationPicker = () => {
    setLocationDraft(location);
    setIsLocationPickerOpen(true);
  };

  const selectMapLocation = (x: number, y: number) => {
    const latitude = 6.955 - y * 0.00055;
    const longitude = 79.835 + x * 0.00055;
    setPinPosition({ x, y });
    setLocationDraft({
      address: `Selected map location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      latitude,
      longitude,
    });
  };

  const saveLocation = () => {
    setLocation(locationDraft);
    setIsLocationPickerOpen(false);
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
          <View style={styles.mapPin}>
            <Ionicons name="location" size={27} color="#FFFFFF" />
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
              <Text style={styles.locationAddress}>{location.address}</Text>
            </View>
            <Pressable
              accessibilityLabel="Edit pickup location"
              hitSlop={8}
              onPress={openLocationPicker}
            >
              <Ionicons name="pencil" size={22} color={Colors.forestGreen} />
            </Pressable>
          </View>
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
            accessibilityLabel="Choose photos"
            disabled={photos.length >= MAX_PHOTOS}
            onPress={pickPhotos}
            style={[
              styles.uploadArea,
              photos.length >= MAX_PHOTOS && styles.uploadAreaDisabled,
            ]}
          >
            <View style={styles.uploadIcon}>
              <Ionicons
                name="images-outline"
                size={35}
                color={Colors.forestGreen}
              />
            </View>
            <Text style={styles.uploadTitle}>
              {photos.length ? "Add another photo" : "Tap to upload photos"}
            </Text>
            <Text style={styles.uploadDescription}>
              {photos.length
                ? `${photos.length} of ${MAX_PHOTOS} photos selected`
                : "Helps our team prepare the right\n equipment."}
            </Text>
            <View style={styles.uploadDecoration} />
          </Pressable>
          {photos.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoList}
            >
              {photos.map((photo, index) => (
                <View key={`${photo.uri}-${index}`} style={styles.photoPreview}>
                  <Image
                    contentFit="cover"
                    source={{ uri: photo.uri }}
                    style={styles.photoPreviewImage}
                  />
                  <Pressable
                    accessibilityLabel={`Remove photo ${index + 1}`}
                    hitSlop={8}
                    onPress={() =>
                      setPhotos((current) =>
                        current.filter((_, photoIndex) => photoIndex !== index),
                      )
                    }
                    style={styles.removePhotoButton}
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
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
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
        >
          <LinearGradient
            colors={["#278037", "#0D631B"]}
            end={{ x: 1, y: 0.5 }}
            start={{ x: 0, y: 0.5 }}
            style={styles.submitGradient}
          >
            <Ionicons name="send-outline" size={24} color="#FFFFFF" />
            <Text style={styles.submitText}>
              {isSubmitting ? "Saving Request..." : "Submit Request"}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setIsLocationPickerOpen(false)}
        transparent
        visible={isLocationPickerOpen}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Choose pickup location</Text>
                <Text style={styles.modalSubtitle}>
                  Tap the map or enter an address below.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close location picker"
                hitSlop={8}
                onPress={() => setIsLocationPickerOpen(false)}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={Colors.cardTextSecondary}
                />
              </Pressable>
            </View>

            <Pressable
              accessibilityLabel="Map. Tap to choose a pickup point"
              onPress={(event) => {
                const { locationX, locationY } = event.nativeEvent;
                selectMapLocation(
                  (locationX / mapWidth) * 100,
                  (locationY / 230) * 100,
                );
              }}
              onLayout={(event) => setMapWidth(event.nativeEvent.layout.width)}
              style={styles.mapPicker}
            >
              <View style={styles.mapRoadHorizontal} />
              <View style={styles.mapRoadVertical} />
              <View style={styles.mapRoadDiagonal} />
              <View style={styles.mapParkOne} />
              <View style={styles.mapParkTwo} />
              <View
                style={[
                  styles.selectedPin,
                  { left: `${pinPosition.x}%`, top: `${pinPosition.y}%` },
                ]}
              >
                <Ionicons name="location" size={25} color="#FFFFFF" />
              </View>
              <View style={styles.mapHint}>
                <Ionicons
                  name="hand-left-outline"
                  size={14}
                  color={Colors.cardTextSecondary}
                />
                <Text style={styles.mapHintText}>Tap to place pin</Text>
              </View>
            </Pressable>

            <View style={styles.coordinateRow}>
              <Ionicons
                name="navigate-outline"
                size={16}
                color={Colors.forestGreen}
              />
              <Text style={styles.coordinateText}>
                {locationDraft.latitude.toFixed(4)},{" "}
                {locationDraft.longitude.toFixed(4)}
              </Text>
            </View>
            <Text style={styles.addressLabel}>Pickup address</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={(address) =>
                setLocationDraft((current) => ({ ...current, address }))
              }
              placeholder="Enter a custom address"
              placeholderTextColor="#98A099"
              style={styles.addressInput}
              value={locationDraft.address}
            />
            <Pressable
              accessibilityRole="button"
              onPress={saveLocation}
              style={styles.saveLocationButton}
            >
              <Text style={styles.saveLocationText}>Use this location</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
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
    padding: 14,
    position: "relative",
  },
  mapPin: {
    alignItems: "center",
    backgroundColor: Colors.coral,
    borderRadius: 32,
    elevation: 4,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    shadowColor: Colors.coral,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    top: 90,
    alignSelf: "center",
    width: 56,
    zIndex: 1,
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
  uploadAreaDisabled: { opacity: 0.65 },
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
  photoList: { gap: 12, paddingRight: 4 },
  photoPreview: {
    borderRadius: 14,
    height: 90,
    overflow: "visible",
    position: "relative",
    width: 90,
  },
  photoPreviewImage: { borderRadius: 14, height: 90, width: 90 },
  removePhotoButton: {
    alignItems: "center",
    backgroundColor: "rgba(22, 27, 24, 0.82)",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: -6,
    top: -6,
    width: 24,
  },
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
  modalOverlay: {
    backgroundColor: "rgba(25, 28, 29, 0.4)",
    flex: 1,
    justifyContent: "flex-end",
  },
  locationModal: {
    backgroundColor: Colors.homeBackground,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    color: Colors.cardTextPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  modalSubtitle: {
    color: Colors.cardTextSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  mapPicker: {
    backgroundColor: "#DDE9D7",
    borderRadius: 18,
    height: 230,
    overflow: "hidden",
    position: "relative",
  },
  mapRoadHorizontal: {
    backgroundColor: "rgba(255,255,255,0.92)",
    height: 29,
    left: -20,
    position: "absolute",
    top: 68,
    transform: [{ rotate: "-8deg" }],
    width: 410,
  },
  mapRoadVertical: {
    backgroundColor: "rgba(255,255,255,0.92)",
    height: 290,
    left: 134,
    position: "absolute",
    top: -26,
    transform: [{ rotate: "29deg" }],
    width: 25,
  },
  mapRoadDiagonal: {
    backgroundColor: "rgba(255,255,255,0.82)",
    height: 20,
    left: -36,
    position: "absolute",
    top: 160,
    transform: [{ rotate: "21deg" }],
    width: 410,
  },
  mapParkOne: {
    backgroundColor: "#B8DCB7",
    borderRadius: 60,
    height: 104,
    position: "absolute",
    right: -22,
    top: -28,
    width: 137,
  },
  mapParkTwo: {
    backgroundColor: "#C7E5BC",
    borderRadius: 40,
    bottom: -16,
    height: 83,
    left: -24,
    position: "absolute",
    width: 120,
  },
  selectedPin: {
    alignItems: "center",
    backgroundColor: Colors.coral,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginLeft: -24,
    marginTop: -48,
    position: "absolute",
    shadowColor: "#2A180E",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    width: 48,
  },
  mapHint: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.86)",
    borderRadius: 12,
    bottom: 10,
    flexDirection: "row",
    gap: 5,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: "absolute",
  },
  mapHintText: {
    color: Colors.cardTextSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  coordinateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
  },
  coordinateText: {
    color: Colors.cardTextSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  addressLabel: {
    color: Colors.cardTextSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 7,
  },
  addressInput: {
    backgroundColor: Colors.surface,
    borderColor: "#E5E7E4",
    borderRadius: 12,
    borderWidth: 1,
    color: Colors.cardTextPrimary,
    fontSize: 14,
    minHeight: 48,
    paddingHorizontal: 13,
  },
  saveLocationButton: {
    alignItems: "center",
    backgroundColor: Colors.forestGreen,
    borderRadius: 14,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 50,
  },
  saveLocationText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
