import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  PendingItem,
  PendingItemCard,
} from "@/components/council/PendingItemCard";
import { StatCard } from "@/components/council/StatCard";
import { TabSwitcher } from "@/components/council/TabSwitcher";
import { EMPTY_FILTERS, FilterModal, FilterState } from "@/components/council/FilterModal";
import { Colors } from "@/constants/Colors";
import { isWithinDateRange } from "@/lib/itemFilters";
import { CommunityPost, getCommunityPosts, getPostTimeLabel } from "@/lib/community";
import { listCouncilRequests, TrackedRequest } from "@/lib/tracking";

const HEADER_EXTRA_PADDING = 8;
const TABS = ["All", "Pickups", "Dumping"] as const;

function toPendingItem(request: TrackedRequest): PendingItem {
  const submittedAt = new Date(request.submitted_at);
  const rawStatus = request.status;
  const status: PendingItem["status"] = rawStatus === "in_review" ? "under_review" : rawStatus === "resolved" ? "completed" : rawStatus;
  const category = request.source === "pickup_requests" ? "pickup" : "dumping";
  const normalizedCategory = request.category.toLowerCase();
  const wasteCategory: PendingItem["wasteCategory"] = category === "dumping"
    ? "illegal_dumping"
    : normalizedCategory.includes("recycl") ? "recyclable"
      : normalizedCategory.includes("hazard") || normalizedCategory.includes("e-waste") ? "hazardous"
        : normalizedCategory.includes("bulk") ? "bulk" : "general";

  return {
    id: request.id,
    title: category === "pickup" ? `${request.category} pickup` : request.category,
    category,
    wasteCategory,
    location: request.location,
    area: request.location,
    date: Number.isNaN(submittedAt.getTime()) ? "" : submittedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    dateISO: Number.isNaN(submittedAt.getTime()) ? "" : submittedAt.toISOString().slice(0, 10),
    status,
  };
}

export default function CouncilDashboardScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");
  const [requests, setRequests] = useState<TrackedRequest[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [requestError, setRequestError] = useState("");
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [postError, setPostError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void listCouncilRequests()
        .then((items) => { if (active) { setRequests(items); setRequestError(""); } })
        .catch((error: unknown) => { if (active) setRequestError(error instanceof Error ? error.message : "Couldn't load pickup and dumping requests."); })
        .finally(() => { if (active) setRequestsLoading(false); });
      void getCommunityPosts()
        .then((items) => { if (active) setPosts(items); })
        .catch((error: unknown) => { if (active) setPostError(error instanceof Error ? error.message : "Couldn't load community posts."); });
      return () => {
        active = false;
      };
    }, []),
  );

  const activeFilterCount =
    filters.statuses.length +
    filters.wasteCategories.length +
    (filters.area.trim() ? 1 : 0) +
    (filters.dateRange !== "all" ? 1 : 0);

  const allItems = useMemo(() => requests.map(toPendingItem), [requests]);
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (activeTab === "Pickups" && item.category !== "pickup") return false;
      if (activeTab === "Dumping" && item.category !== "dumping") return false;

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          item.area.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filters.statuses.length > 0 && !filters.statuses.includes(item.status)) {
        return false;
      }

      if (
        filters.wasteCategories.length > 0 &&
        !filters.wasteCategories.includes(item.wasteCategory)
      ) {
        return false;
      }

      if (filters.area.trim()) {
        const areaQuery = filters.area.trim().toLowerCase();
        const matchesArea =
          item.area.toLowerCase().includes(areaQuery) ||
          item.location.toLowerCase().includes(areaQuery);
        if (!matchesArea) return false;
      }

      if (!isWithinDateRange(item.dateISO, filters.dateRange)) {
        return false;
      }

      return true;
    });
  }, [allItems, activeTab, searchQuery, filters]);

  const pickupCount = allItems.filter((i) => i.category === "pickup").length;
  const dumpingCount = allItems.filter((i) => i.category === "dumping").length;
  const pendingCount = allItems.filter((item) => item.status === "pending" || item.status === "under_review").length;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + HEADER_EXTRA_PADDING }]}>
        <Text style={styles.headerTitle}>Pending Items</Text>
        <Pressable
          style={styles.profileButton}
          onPress={() => router.push("/council-profile")}
        >
          <Ionicons name="person-outline" size={16} color={Colors.councilHeaderText} />
          <Text style={styles.profileText}>Profile</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={pendingCount} label="Total Pending" />
          <StatCard value={pickupCount} label="Pickups" />
          <StatCard value={dumpingCount} label="Dumping" />
        </View>

        {/* Tabs */}
        <View style={styles.tabSection}>
          <TabSwitcher
            tabs={[...TABS]}
            activeTab={activeTab}
            onChange={(t) => setActiveTab(t as typeof activeTab)}
          />

          {/* Search */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={16} color={Colors.councilTextMuted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by title, location or area"
              placeholderTextColor={Colors.councilTextMuted}
            />
          </View>

          <View style={styles.listMetaRow}>
            <Text style={styles.listMetaText}>Showing {filteredItems.length} of {allItems.length} items</Text>
            <Pressable style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
              <Ionicons name="options-outline" size={14} color={Colors.councilTextSecondary} />
              <Text style={styles.filterButtonText}>Filters</Text>
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* List */}
        <View style={styles.list}>
          <Text style={styles.residentReportsTitle}>Pickup Requests and Dumping Reports</Text>
          {requestError ? <Text style={styles.reportError}>{requestError}</Text> : requestsLoading ? (
            <Text style={styles.reportEmpty}>Loading pickup requests and dumping reports…</Text>
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="file-tray-outline" size={28} color={Colors.councilTextMuted} />
              <Text style={styles.emptyStateText}>No requests match your filters</Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <PendingItemCard
                key={item.id}
                item={item}
                onPress={(pressedItem) => {
                  if (pressedItem.category === "pickup") {
                    router.push({
                      pathname: "/item-detail-pickup",
                      params: { id: pressedItem.id },
                    });
                  } else if (pressedItem.category === "dumping") {
                    router.push({
                      pathname: "/item-detail-report",
                      params: { id: pressedItem.id },
                    });
                  }
                }}
              />
            ))
          )}
        </View>

        <View style={styles.residentReports}>
          <Text style={styles.residentReportsTitle}>Community Posts</Text>
          {postError ? <Text style={styles.reportError}>{postError}</Text> : posts.length ? posts.slice(0, 5).map((post) => (
            <Pressable
              key={post.id}
              accessibilityRole="button"
              accessibilityLabel={`Open post by ${post.author_name}`}
              onPress={() => router.push({ pathname: "/council-community-post-detail", params: { id: post.id } })}
              style={styles.residentReportCard}
            >
              {post.image_url ? <Image source={{ uri: post.image_url }} style={styles.communityPostImage} /> : null}
              <View style={styles.residentReportCopy}>
                <Text style={styles.residentReportName} numberOfLines={1}>{post.author_name} · {post.location}</Text>
                {!!post.description && <Text style={styles.residentReportArea} numberOfLines={2}>{post.description}</Text>}
                <Text style={styles.residentReportArea}>{getPostTimeLabel(post.created_at)}</Text>
              </View>
            </Pressable>
          )) : <Text style={styles.reportEmpty}>No community posts yet.</Text>}
        </View>

        {/* Load more */}
        <View style={styles.loadMoreWrap}>
          <Pressable style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>{allItems.length} requests loaded</Text>
          </Pressable>
        </View>
      </ScrollView>

      <FilterModal
        visible={filterModalVisible}
        filters={filters}
        onChange={setFilters}
        onClose={() => setFilterModalVisible(false)}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.councilBorder,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.councilHeaderText,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  profileText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.councilHeaderText,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  residentReports: { gap: 9 },
  residentReportsTitle: {
    color: Colors.councilHeaderText,
    fontSize: 15,
    fontWeight: "700",
  },
  residentReportCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  residentReportCopy: { flex: 1, gap: 4 },
  residentReportName: {
    color: Colors.councilTextPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  residentReportArea: { color: Colors.councilTextSecondary, fontSize: 11 },
  communityPostImage: { width: 52, height: 52, borderRadius: 6, backgroundColor: Colors.councilIconCircleBg },
  reportError: { color: Colors.error, fontSize: 12 },
  reportEmpty: { color: Colors.councilTextSecondary, fontSize: 12 },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabSection: {
    gap: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.councilTextPrimary,
  },
  listMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listMetaText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.councilTextSecondary,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.councilTextSecondary,
  },
  filterBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.editProfileBg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.surface,
  },
  list: {
    gap: 10,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 13,
    color: Colors.councilTextMuted,
  },
  loadMoreWrap: {
    alignItems: "center",
    paddingTop: 4,
  },
  loadMoreButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.councilTextSecondary,
  },
});
