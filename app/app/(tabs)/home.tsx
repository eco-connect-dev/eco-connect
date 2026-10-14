import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoticeCard } from "@/components/resident/NoticeCard";
import { PickupCard } from "@/components/resident/PickupCard";
import { QuickActionCard } from "@/components/resident/QuickActionCard";
import { Colors } from "@/constants/Colors";
import { CommunityPost, getCommunityPosts, getPostTimeLabel } from "@/lib/community";
import { listMyRequests, TrackedRequest } from "@/lib/tracking";

const HEADER_EXTRA_PADDING = 8;

export default function ResidentHomeScreen() {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [requests, setRequests] = useState<TrackedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [postError, setPostError] = useState("");
  const [requestError, setRequestError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    const [postResult, requestResult] = await Promise.allSettled([
      getCommunityPosts(),
      listMyRequests(),
    ]);

    if (postResult.status === "fulfilled") {
      setPosts(postResult.value.slice(0, 3));
      setPostError("");
    } else {
      setPostError(
        postResult.reason instanceof Error
          ? postResult.reason.message
          : "Could not load community notices.",
      );
    }

    if (requestResult.status === "fulfilled") {
      setRequests(requestResult.value);
      setRequestError("");
    } else {
      setRequestError(
        requestResult.reason instanceof Error
          ? requestResult.reason.message
          : "Could not load pickup requests.",
      );
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  const nextPickup =
    requests.find(
      (item) =>
        item.source === "pickup_requests" &&
        item.status !== "resolved" &&
        item.status !== "rejected",
    ) ?? requests.find((item) => item.source === "pickup_requests") ?? null;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + HEADER_EXTRA_PADDING },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.headerLogo}
              contentFit="contain"
            />
            <Text style={styles.headerTitle}>Resident Home</Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="person" size={12} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PickupCard
          request={nextPickup}
          loading={loading}
          onViewDetails={() =>
            router.push(nextPickup ? "/(tabs)/track" : "/(tabs)/request")
          }
        />
        {requestError ? (
          <Text accessibilityRole="alert" style={styles.dataError}>
            {requestError}
          </Text>
        ) : null}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <QuickActionCard
              icon="add-outline"
              label="Request Pickup"
              iconBgColor={Colors.quickActionGreenBg}
              iconColor={Colors.forestGreen}
              onPress={() => router.push("/(tabs)/request")}
            />
            <QuickActionCard
              icon="alert-circle-outline"
              label="Illegal dump"
              iconBgColor={Colors.quickActionCoralBg}
              iconColor={Colors.coral}
              onPress={() => router.push("/dumping-report")}
            />
          </View>
        </View>

        {/* Community Notices */}
        <View style={[styles.section, styles.noticesSection]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Community Notices</Text>
            <View style={styles.noticeActions}>
              <Pressable
                accessibilityLabel="Create community post"
                accessibilityRole="button"
                onPress={() => router.push("/community-create")}
                style={styles.addPostButton}
              >
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </Pressable>
              <Pressable onPress={() => router.push("/(tabs)/community")}>
                <Text style={styles.viewAllText}>View All</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.noticesList}>
            {loading && !posts.length ? (
              <ActivityIndicator color={Colors.forestGreen} />
            ) : postError && !posts.length ? (
              <Text accessibilityRole="alert" style={styles.dataError}>
                {postError}
              </Text>
            ) : posts.length ? (
              posts.map((post, index) => (
                <NoticeCard
                  key={post.id}
                  icon={post.image_url ? "image-outline" : "people-outline"}
                  iconBgColor={
                    index % 2 ? Colors.noticeIconCoralBg : Colors.noticeIconGreenBg
                  }
                  iconColor={index % 2 ? Colors.coral : Colors.forestGreen}
                  title={post.author_name}
                  preview={post.description || `Community update from ${post.location}`}
                  timeAgo={getPostTimeLabel(post.created_at)}
                  onPress={() => router.push("/(tabs)/community")}
                />
              ))
            ) : (
              <Text style={styles.emptyNotices}>
                No community notices yet. Be the first to share an update.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.homeBackground,
  },
  header: {
    backgroundColor: "rgba(249,249,253,0.9)",
    shadowColor: "#121417",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    zIndex: 10,
  },
  headerRow: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.44,
    color: Colors.cardTextPrimary,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: Colors.pickupGradientEnd,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.cardTextPrimary,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noticeActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  addPostButton: {
    alignItems: "center",
    backgroundColor: Colors.forestGreen,
    borderRadius: 18,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  viewAllText: {
    fontSize: 16,
    color: Colors.pickupGradientEnd,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  noticesSection: {
    gap: 8,
  },
  noticesList: {
    gap: 12,
    marginTop: 8,
  },
  dataError: { color: Colors.error, fontSize: 13 },
  emptyNotices: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
});
