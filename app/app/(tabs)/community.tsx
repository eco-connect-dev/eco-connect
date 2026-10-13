import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import {
  CommunityPost,
  getCommunityPosts,
  getPostTimeLabel,
} from "@/lib/community";

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      setPosts(await getCommunityPosts());
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load community posts. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPosts();
    }, [loadPosts]),
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.eyebrow}>YOUR NEIGHBORHOOD</Text>
          <Text style={styles.headerTitle}>Community</Text>
        </View>
        <Pressable
          accessibilityLabel="Create community post"
          accessibilityRole="button"
          onPress={() => router.push("/community-create")}
          style={styles.createButton}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadPosts(true)}
            tintColor={Colors.forestGreen}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && !posts.length ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={Colors.forestGreen} />
          </View>
        ) : error && !posts.length ? (
          <View style={styles.stateCard}>
            <Text style={styles.error}>{error}</Text>
            <Pressable
              onPress={() => void loadPosts()}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : posts.length ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <View style={styles.stateCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="people-outline"
                size={28}
                color={Colors.forestGreen}
              />
            </View>
            <Text style={styles.emptyTitle}>Your community starts here</Text>
            <Text style={styles.emptyText}>
              Share a local update, cleanup, or neighborhood moment with your
              community.
            </Text>
            <Pressable
              onPress={() => router.push("/community-create")}
              style={styles.emptyAction}
            >
              <Text style={styles.emptyActionText}>Create a post</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function PostCard({ post }: { post: CommunityPost }) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.author_name.trim().charAt(0).toUpperCase() || "C"}
          </Text>
        </View>
        <View style={styles.authorBlock}>
          <Text style={styles.authorName}>{post.author_name}</Text>
          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={13}
              color={Colors.textSecondary}
            />
            <Text style={styles.location} numberOfLines={1}>
              {post.location}
            </Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.time}>{getPostTimeLabel(post.created_at)}</Text>
          </View>
        </View>
      </View>
      {post.description ? (
        <Text style={styles.description}>{post.description}</Text>
      ) : null}
      {post.image_url ? (
        <Image
          contentFit="cover"
          source={{ uri: post.image_url }}
          style={styles.postImage}
          transition={180}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Colors.homeBackground, flex: 1 },
  header: {
    alignItems: "center",
    backgroundColor: Colors.homeBackground,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  eyebrow: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  headerTitle: {
    color: Colors.cardTextPrimary,
    fontSize: 25,
    fontWeight: "700",
    marginTop: 3,
  },
  createButton: {
    alignItems: "center",
    backgroundColor: Colors.forestGreen,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  content: { gap: 16, padding: 16, paddingBottom: 32 },
  postCard: {
    backgroundColor: Colors.surface,
    borderColor: "rgba(18,20,23,0.06)",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    padding: 14,
  },
  postHeader: { alignItems: "center", flexDirection: "row", gap: 10 },
  avatar: {
    alignItems: "center",
    backgroundColor: Colors.quickActionGreenBg,
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  avatarText: { color: Colors.forestGreen, fontSize: 17, fontWeight: "700" },
  authorBlock: { flex: 1, gap: 3 },
  authorName: {
    color: Colors.cardTextPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  metaRow: { alignItems: "center", flexDirection: "row", gap: 4 },
  location: { color: Colors.textSecondary, flexShrink: 1, fontSize: 11 },
  dot: { color: Colors.textSecondary, fontSize: 12 },
  time: { color: Colors.textSecondary, fontSize: 11 },
  description: {
    color: Colors.cardTextPrimary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
    marginTop: 12,
  },
  postImage: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    height: 230,
    width: "100%",
  },
  stateCard: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 18,
    gap: 12,
    padding: 24,
    marginTop: 8,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: Colors.quickActionGreenBg,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  emptyTitle: {
    color: Colors.cardTextPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  emptyAction: {
    backgroundColor: Colors.forestGreen,
    borderRadius: 12,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  emptyActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  error: { color: Colors.error, fontSize: 13, textAlign: "center" },
  retryButton: {
    backgroundColor: Colors.forestGreen,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
});
