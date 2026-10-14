import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { CommunityPost, deleteCommunityPost, getCommunityPost, getPostTimeLabel } from "@/lib/community";

export default function CouncilCommunityPostDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    void getCommunityPost(id)
      .then((item) => { if (active) setPost(item); })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Couldn't load this community post.");
      });
    return () => { active = false; };
  }, [id]);

  const deletePost = async () => {
    if (!id || deleting) return;
    setDeleting(true);
    setError("");
    try {
      await deleteCommunityPost(id);
      router.replace("/(tabs)/council-dashboard");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Couldn't delete this post.");
      setDeleting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable accessibilityLabel="Back to council dashboard" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color={Colors.councilTextPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Community Post</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {post ? (
          <View style={styles.card}>
            <Text style={styles.author}>{post.author_name}</Text>
            <Text style={styles.meta}>{post.location} · {getPostTimeLabel(post.created_at)}</Text>
            {post.description ? <Text style={styles.description}>{post.description}</Text> : null}
            {post.image_url ? <Image source={{ uri: post.image_url }} style={styles.image} resizeMode="cover" /> : null}
          </View>
        ) : !error ? <Text style={styles.meta}>Loading post…</Text> : null}

        <Pressable disabled={!post || deleting} onPress={() => void deletePost()} style={[styles.deleteButton, (!post || deleting) && styles.disabledButton]}>
          <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>{deleting ? "Deleting…" : "Delete Post"}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.councilBorder,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: Colors.councilHeaderText },
  headerSpacer: { width: 32 },
  content: { padding: 16, gap: 16 },
  card: { backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.councilBorder, padding: 16, gap: 10 },
  author: { color: Colors.councilTextPrimary, fontSize: 17, fontWeight: "700" },
  meta: { color: Colors.councilTextSecondary, fontSize: 12 },
  description: { color: Colors.councilTextPrimary, fontSize: 14, lineHeight: 21 },
  image: { width: "100%", height: 240, borderRadius: 8, backgroundColor: Colors.councilIconCircleBg },
  error: { color: Colors.error, fontSize: 13 },
  deleteButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.error, borderRadius: 8, paddingVertical: 14 },
  disabledButton: { opacity: 0.55 },
  deleteButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
