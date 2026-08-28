import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";

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

  const handleSubmit = () => {
    Alert.alert("Request submitted", `${wasteType} pickup requested for 123 Greenview Lane, Eco District.`);
    setNotes("");
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + HEADER_EXTRA_PADDING }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerBrand}>
            <Image contentFit="contain" source={require("@/assets/images/logo.png")} style={styles.logo} />
            <Text style={styles.headerTitle}>Resident Request</Text>
          </View>
          <View style={styles.profileIcon}><Ionicons name="person-outline" size={18} color="#FFFFFF" /></View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.locationMap}>
          <View style={styles.mapPin}><Ionicons name="location" size={27} color="#FFFFFF" /></View>
          <View style={styles.locationCard}>
            <View style={styles.locationIcon}><Ionicons name="home-outline" size={21} color={Colors.forestGreen} /></View>
            <View style={styles.locationCopy}>
              <Text style={styles.locationTitle}>Pickup Location</Text>
              <Text style={styles.locationAddress}>123 Greenview Lane, Eco District</Text>
            </View>
            <Pressable accessibilityLabel="Edit pickup location" hitSlop={8}><Ionicons name="pencil" size={22} color={Colors.forestGreen} /></Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Waste Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeList}>
            {WASTE_TYPES.map((type) => {
              const selected = type.label === wasteType;
              return (
                <Pressable key={type.label} onPress={() => setWasteType(type.label)} style={[styles.typeChip, selected && styles.typeChipSelected]}>
                  <Ionicons name={type.icon} size={22} color={selected ? Colors.forestGreen : Colors.cardTextSecondary} />
                  <Text style={[styles.typeText, selected && styles.typeTextSelected]}>{type.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photo (Optional)</Text>
          <Pressable accessibilityLabel="Upload a photo" style={styles.uploadArea}>
            <View style={styles.uploadIcon}><Ionicons name="camera-outline" size={35} color={Colors.forestGreen} /></View>
            <Text style={styles.uploadTitle}>Tap to upload a photo</Text>
            <Text style={styles.uploadDescription}>Helps our team prepare the right{"\n"}equipment.</Text>
            <View style={styles.uploadDecoration} />
          </Pressable>
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

        <Pressable accessibilityRole="button" onPress={handleSubmit} style={styles.submitButton}>
          <LinearGradient colors={["#278037", "#0D631B"]} end={{ x: 1, y: 0.5 }} start={{ x: 0, y: 0.5 }} style={styles.submitGradient}>
            <Ionicons name="send-outline" size={24} color="#FFFFFF" />
            <Text style={styles.submitText}>Submit Request</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.homeBackground },
  header: { backgroundColor: "rgba(249,249,253,0.96)", shadowColor: "#121417", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  headerRow: { alignItems: "center", flexDirection: "row", height: 64, justifyContent: "space-between", paddingHorizontal: 20 },
  headerBrand: { alignItems: "center", flexDirection: "row", gap: 9 },
  logo: { height: 32, width: 32 },
  headerTitle: { color: Colors.cardTextPrimary, fontSize: 22, fontWeight: "700", letterSpacing: -0.5 },
  profileIcon: { alignItems: "center", backgroundColor: Colors.forestGreen, borderRadius: 999, height: 36, justifyContent: "center", width: 36 },
  content: { gap: 30, padding: 20, paddingBottom: 32 },
  locationMap: { backgroundColor: "#E3E4FF", borderRadius: 24, height: 240, justifyContent: "flex-end", padding: 14, position: "relative" },
  mapPin: { alignItems: "center", backgroundColor: Colors.coral, borderRadius: 32, elevation: 4, height: 56, justifyContent: "center", position: "absolute", shadowColor: Colors.coral, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, top: 90, alignSelf: "center", width: 56, zIndex: 1 },
  locationCard: { alignItems: "center", backgroundColor: Colors.surface, borderColor: "#ECEBF4", borderRadius: 24, borderWidth: 1, flexDirection: "row", minHeight: 82, paddingHorizontal: 14, shadowColor: "#2E335E", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  locationIcon: { alignItems: "center", backgroundColor: Colors.forestGreenLight, borderRadius: 20, height: 48, justifyContent: "center", width: 48 },
  locationCopy: { flex: 1, marginHorizontal: 13 },
  locationTitle: { color: Colors.cardTextSecondary, fontSize: 14, fontWeight: "700", marginBottom: 4 },
  locationAddress: { color: Colors.cardTextPrimary, fontSize: 14, fontWeight: "500", lineHeight: 19 },
  section: { gap: 15 },
  sectionTitle: { color: Colors.cardTextPrimary, fontSize: 20, fontWeight: "700", letterSpacing: -0.35 },
  typeList: { gap: 10, paddingRight: 20 },
  typeChip: { alignItems: "center", backgroundColor: "#F0F0F4", borderColor: "transparent", borderRadius: 22, borderWidth: 1, flexDirection: "row", gap: 8, minHeight: 45, paddingHorizontal: 17 },
  typeChipSelected: { backgroundColor: "#EAFBF3", borderColor: Colors.forestGreen },
  typeText: { color: Colors.cardTextSecondary, fontSize: 14, fontWeight: "700" },
  typeTextSelected: { color: Colors.forestGreen },
  uploadArea: { alignItems: "center", borderColor: "#C8DCD0", borderRadius: 24, borderStyle: "dashed", borderWidth: 2, height: 178, justifyContent: "center", overflow: "hidden", paddingTop: 5 },
  uploadIcon: { alignItems: "center", backgroundColor: Colors.surface, borderRadius: 999, height: 62, justifyContent: "center", shadowColor: "#101A12", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, width: 62 },
  uploadTitle: { color: Colors.cardTextPrimary, fontSize: 15, fontWeight: "500", marginTop: 13 },
  uploadDescription: { color: "#899089", fontSize: 12, fontWeight: "600", lineHeight: 16, marginTop: 7, textAlign: "center" },
  uploadDecoration: { backgroundColor: "rgba(86, 97, 88, 0.06)", borderRadius: 60, bottom: -38, height: 108, position: "absolute", right: -30, width: 108 },
  notesSection: { gap: 9 },
  notesLabel: { color: Colors.cardTextSecondary, fontSize: 13, fontWeight: "700" },
  notesInput: { backgroundColor: Colors.surface, borderRadius: 22, color: Colors.cardTextPrimary, fontSize: 14, lineHeight: 19, minHeight: 105, padding: 16 },
  submitButton: { borderRadius: 28, overflow: "hidden" },
  submitGradient: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "center", minHeight: 57 },
  submitText: { color: "#FFFFFF", fontSize: 19, fontWeight: "700" },
});
