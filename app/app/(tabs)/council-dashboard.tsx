import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  PendingItem,
  PendingItemCard,
} from "@/components/council/PendingItemCard";
import { StatCard } from "@/components/council/StatCard";
import { TabSwitcher } from "@/components/council/TabSwitcher";
import { Colors } from "@/constants/Colors";
import { listCouncilReports, Report } from "@/lib/reports";

const HEADER_EXTRA_PADDING = 8;
const TABS = ["All", "Pickups", "Dumping"] as const;

// TODO: replace with data from Supabase
const MOCK_ITEMS: PendingItem[] = [
  {
    id: "1",
    title: "Bulk Waste: Old Sofa",
    category: "pickup",
    location: "1042 Maple St",
    date: "Aug 12",
    status: "pending",
  },
  {
    id: "2",
    title: "Illegal Dumping",
    category: "dumping",
    location: "450 Industrial Rd",
    date: "Aug 11",
    status: "under_review",
  },
  {
    id: "3",
    title: "E-Waste Disposal",
    category: "pickup",
    location: "789 Pine Ave",
    date: "Aug 10",
    status: "assigned",
  },
  {
    id: "4",
    title: "Tires Abandoned in Alley",
    category: "dumping",
    location: "Intersection 5th & Oak",
    date: "Aug 10",
    status: "pending",
  },
  {
    id: "5",
    title: "Yard Waste Overload",
    category: "pickup",
    location: "211 Elm Blvd",
    date: "Aug 09",
    status: "pending",
  },
  {
    id: "6",
    title: "Construction Debris",
    category: "dumping",
    location: "882 River Rd",
    date: "Aug 08",
    status: "under_review",
  },
];

const TOTAL_ITEMS = 24;
const TOTAL_PAGES = 4;

export default function CouncilDashboardScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");
  const [reports, setReports] = useState<Report[]>([]);
  const [reportError, setReportError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void listCouncilReports()
        .then((items) => {
          if (active) setReports(items);
        })
        .catch((error: unknown) => {
          if (active) {
            setReportError(
              error instanceof Error ? error.message : "Couldn't load reports.",
            );
          }
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const filteredItems = useMemo(() => {
    if (activeTab === "Pickups")
      return MOCK_ITEMS.filter((i) => i.category === "pickup");
    if (activeTab === "Dumping")
      return MOCK_ITEMS.filter((i) => i.category === "dumping");
    return MOCK_ITEMS;
  }, [activeTab]);

  const pickupCount = MOCK_ITEMS.filter((i) => i.category === "pickup").length;
  const dumpingCount = MOCK_ITEMS.filter(
    (i) => i.category === "dumping",
  ).length;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + HEADER_EXTRA_PADDING },
        ]}
      >
        <Text style={styles.headerTitle}>Pending Items</Text>
        <Pressable
          style={styles.profileButton}
          onPress={() => router.push("/council-profile")}
        >
          <Ionicons
            name="person-outline"
            size={16}
            color={Colors.councilHeaderText}
          />
          <Text style={styles.profileText}>Profile</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.residentReports}>
          <Text style={styles.residentReportsTitle}>Resident Reports</Text>
          {reportError ? (
            <Text style={styles.reportError}>{reportError}</Text>
          ) : reports.length ? (
            reports.map((report) => (
              <Pressable
                key={report.id}
                onPress={() =>
                  router.push({
                    pathname: "/council-report-detail",
                    params: { id: report.id },
                  })
                }
                style={styles.residentReportCard}
              >
                <View style={styles.residentReportCopy}>
                  <Text style={styles.residentReportName} numberOfLines={1}>
                    {report.title}
                  </Text>
                  <Text style={styles.residentReportArea} numberOfLines={1}>
                    {report.neighborhood} · {report.status.replace("_", " ")}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.councilTextSecondary}
                />
              </Pressable>
            ))
          ) : (
            <Text style={styles.reportEmpty}>
              No resident reports to review.
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={TOTAL_ITEMS} label="Total Pending" />
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

          <View style={styles.listMetaRow}>
            <Text style={styles.listMetaText}>
              Showing {filteredItems.length} of {TOTAL_ITEMS} items
            </Text>
            <Pressable style={styles.sortButton}>
              <Text style={styles.sortText}>Sort: Newest</Text>
              <Ionicons
                name="chevron-down"
                size={12}
                color={Colors.councilTextSecondary}
              />
            </Pressable>
          </View>
        </View>

        {/* List */}
        <View style={styles.list}>
          {filteredItems.map((item) => (
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
          ))}
        </View>

        {/* Load more */}
        <View style={styles.loadMoreWrap}>
          <Pressable style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>
              Load More Items (1 of {TOTAL_PAGES} pages)
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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
  reportError: { color: Colors.error, fontSize: 12 },
  reportEmpty: { color: Colors.councilTextSecondary, fontSize: 12 },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabSection: {
    gap: 12,
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
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sortText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.councilTextSecondary,
  },
  list: {
    gap: 10,
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
