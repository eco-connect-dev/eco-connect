import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
import { createCommunityPost } from "@/lib/community";
import { supabase } from "@/lib/supabase";

export default function CreateCommunityPostScreen() {
  const insets = useSafeAreaInsets();
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitPost = async () => {
    if (submitting) return;
    const cleanDescription = description.trim();
    const cleanLocation = location.trim();
    const cleanImageUrl = imageUrl.trim();

    if (!cleanDescription || !cleanLocation || !cleanImageUrl) {
      setError("Add a description, location, and image link to continue.");
      return;
    }
    if (!/^https?:\/\//i.test(cleanImageUrl)) {
      setError(
        "Enter a valid public image URL starting with http:// or https://.",
      );
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!data.user) {
        router.replace("/(auth)/login");
        return;
      }

      const authorName = String(
        data.user.user_metadata?.full_name ??
          data.user.email?.split("@")[0] ??
          "Community member",
      );
      await createCommunityPost({
        authorId: data.user.id,
        authorName,
        description: cleanDescription,
        location: cleanLocation,
        imageUrl: cleanImageUrl,
      });
      router.replace("/(tabs)/community");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not publish your post. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
            color={Colors.cardTextPrimary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Create a post</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>Share with your community</Text>
          <Text style={styles.subtitle}>
            Post a local update, event, or a moment from your neighborhood.
          </Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            accessibilityLabel="Post description"
            multiline
            onChangeText={(value) => {
              setDescription(value);
              setError("");
            }}
            placeholder="What would you like to share?"
            placeholderTextColor="#929A94"
            style={[styles.input, styles.descriptionInput]}
            textAlignVertical="top"
            value={description}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons
              name="location-outline"
              size={19}
              color={Colors.forestGreen}
            />
            <TextInput
              accessibilityLabel="Post location"
              onChangeText={(value) => {
                setLocation(value);
                setError("");
              }}
              placeholder="Neighborhood or address"
              placeholderTextColor="#929A94"
              style={styles.locationInput}
              value={location}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Image</Text>
          <Text style={styles.helper}>Paste a public link to an image.</Text>
          <TextInput
            accessibilityLabel="Image URL"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onChangeText={(value) => {
              setImageUrl(value);
              setError("");
            }}
            placeholder="https://example.com/photo.jpg"
            placeholderTextColor="#929A94"
            style={styles.input}
            value={imageUrl}
          />
          {/^https?:\/\//i.test(imageUrl.trim()) ? (
            <Image
              contentFit="cover"
              source={{ uri: imageUrl.trim() }}
              style={styles.imagePreview}
            />
          ) : null}
        </View>

        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={() => void submitPost()}
          style={[styles.submitButton, submitting && styles.submitDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons name="paper-plane-outline" size={19} color="#FFFFFF" />
          )}
          <Text style={styles.submitText}>
            {submitting ? "Publishing..." : "Publish post"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Colors.homeBackground, flex: 1 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  backButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  headerTitle: {
    color: Colors.cardTextPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  content: { gap: 20, padding: 20, paddingBottom: 36 },
  intro: { gap: 6 },
  title: { color: Colors.cardTextPrimary, fontSize: 22, fontWeight: "700" },
  subtitle: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  fieldGroup: { gap: 8 },
  label: { color: Colors.cardTextPrimary, fontSize: 14, fontWeight: "700" },
  helper: { color: Colors.textSecondary, fontSize: 12, marginTop: -4 },
  input: {
    backgroundColor: Colors.surface,
    borderColor: Colors.divider,
    borderRadius: 13,
    borderWidth: 1,
    color: Colors.cardTextPrimary,
    fontSize: 14,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  descriptionInput: { minHeight: 130 },
  inputWithIcon: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.divider,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingLeft: 12,
  },
  locationInput: {
    color: Colors.cardTextPrimary,
    flex: 1,
    fontSize: 14,
    minHeight: 48,
    paddingRight: 12,
  },
  imagePreview: {
    backgroundColor: Colors.background,
    borderRadius: 13,
    height: 210,
    marginTop: 4,
    width: "100%",
  },
  error: { color: Colors.error, fontSize: 13, lineHeight: 18 },
  submitButton: {
    alignItems: "center",
    backgroundColor: Colors.forestGreen,
    borderRadius: 14,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    minHeight: 52,
    marginTop: 4,
  },
  submitDisabled: { opacity: 0.65 },
  submitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
