import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
import { submitDumpingReport } from "@/lib/tracking";

const CATEGORIES = ["Illegal dumping", "Street litter", "Overflowing bin"];

export default function DumpingReportScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (submitting) return;
    if (!location.trim() || !notes.trim()) {
      setError("Add the location and describe the issue before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await submitDumpingReport({ category, location, notes });
      setLocation("");
      setNotes("");
      Alert.alert(
        "Report submitted",
        "Your report has been sent to the council and is now available in Track.",
        [
          { text: "Done", style: "cancel" },
          {
            text: "Track report",
            onPress: () => router.push("/(tabs)/track"),
          },
        ],
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn't submit the report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={Colors.cardTextSecondary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Report an issue</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          Tell your council about dumping or another waste issue in your area.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Issue type</Text>
          <View style={styles.categories}>
            {CATEGORIES.map((item) => {
              const selected = category === item;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.category, selected && styles.categorySelected]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selected && styles.categoryTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Location</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={(value) => {
              setLocation(value);
              setError("");
            }}
            placeholder="Street, neighborhood, or nearby landmark"
            placeholderTextColor="#98A099"
            style={styles.input}
            value={location}
          />

          <Text style={styles.label}>Describe the issue</Text>
          <TextInput
            multiline
            onChangeText={(value) => {
              setNotes(value);
              setError("");
            }}
            placeholder="What did you see? Add details that can help the council find it."
            placeholderTextColor="#98A099"
            style={[styles.input, styles.notesInput]}
            textAlignVertical="top"
            value={notes}
          />
        </View>

        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={() => void submit()}
          style={[styles.submitButton, submitting && styles.disabled]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons name="send-outline" size={19} color="#FFFFFF" />
          )}
          <Text style={styles.submitText}>
            {submitting ? "Submitting..." : "Submit report"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.homeBackground },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: Colors.cardTextSecondary,
    fontSize: 19,
    fontWeight: "700",
  },
  content: { padding: 20, paddingBottom: 32, gap: 16 },
  intro: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "#EAEDEA",
    borderRadius: 16,
    padding: 16,
    gap: 9,
  },
  label: {
    color: Colors.cardTextSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  category: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E0E5E1",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categorySelected: {
    backgroundColor: "#EAFBF3",
    borderColor: Colors.forestGreen,
  },
  categoryText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTextSelected: { color: Colors.forestGreen },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E0E5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    color: Colors.cardTextSecondary,
    fontSize: 14,
  },
  notesInput: { minHeight: 130, paddingTop: 12 },
  submitButton: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: Colors.forestGreen,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  disabled: { opacity: 0.7 },
  submitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  error: { color: Colors.error, fontSize: 13, textAlign: "center" },
});
