import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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

const HEADER_EXTRA_PADDING = 8;
const TABS = ["All", "Pickups", "Dumping"] as const;

// TODO: replace with data from Supabase
const MOCK_ITEMS: PendingItem[] = [
  { id: "1", title: "Bulk Waste: Old Sofa", category: "pickup", wasteCategory: "bulk", location: "1042 Maple St", area: "Maple Street", date: "Aug 12", dateISO: "2026-08-12", status: "pending" },
  { id: "2", title: "Illegal Dumping", category: "dumping", wasteCategory: "illegal_dumping", location: "450 Industrial Rd", area: "Industrial Zone", date: "Aug 11", dateISO: "2026-08-11", status: "under_review" },
  { id: "3", title: "E-Waste Disposal", category: "pickup", wasteCategory: "hazardous", location: "789 Pine Ave", area: "Pine Avenue", date: "Aug 10", dateISO: "2026-08-10", status: "assigned" },
  { id: "4", title: "Tires Abandoned in Alley", category: "dumping", wasteCategory: "illegal_dumping", location: "Intersection 5th & Oak", area: "5th & Oak", date: "Aug 10", dateISO: "2026-08-10", status: "pending" },
  { id: "5", title: "Yard Waste Overload", category: "pickup", wasteCategory: "general", location: "211 Elm Blvd", area: "Elm Boulevard", date: "Aug 09", dateISO: "2026-08-09", status: "pending" },
  { id: "6", title: "Construction Debris", category: "dumping", wasteCategory: "illegal_dumping", location: "882 River Rd", area: "River Road", date: "Aug 08", dateISO: "2026-08-08", status: "under_review" },
];

const TOTAL_ITEMS = 24;
const TOTAL_PAGES = 4;

export default function CouncilDashboardScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const activeFilterCount =
      filters.statuses.length +
      filters.wasteCategories.length +
      (filters.area.trim() ? 1 : 0) +
      (filters.dateRange !== "all" ? 1 : 0);

  const filteredItems = useMemo(() => {
    return MOCK_ITEMS.filter((item) => {
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
  }, [activeTab, searchQuery, filters]);

  const pickupCount = MOCK_ITEMS.filter((i) => i.category === "pickup").length;
  const dumpingCount = MOCK_ITEMS.filter((i) => i.category === "dumping").length;

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
            <StatCard value={TOTAL_ITEMS} label="Total Pending" />
            <StatCard value={pickupCount} label="Pickups" />
            <StatCard value={dumpingCount} label="Dumping" />
          </View>

          {/* Tabs */}
          <View style={styles.tabSection}>
            <TabSwitcher tabs={[...TABS]} activeTab={activeTab} onChange={(t) => setActiveTab(t as typeof activeTab)} />

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
              <Text style={styles.listMetaText}>
                Showing {filteredItems.length} of {TOTAL_ITEMS} items
              </Text>
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
            {filteredItems.length === 0 ? (
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
                          }
                          // TODO: dumping items still need their own item-detail-report screen and route
                        }}
                    />
                ))
            )}
          </View>

          {/* Load more */}
          <View style={styles.loadMoreWrap}>
            <Pressable style={styles.loadMoreButton}>
              <Text style={styles.loadMoreText}>Load More Items (1 of {TOTAL_PAGES} pages)</Text>
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
