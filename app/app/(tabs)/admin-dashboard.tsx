import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ComplaintCard } from "@/components/admin/Complaintcard";
import { StatCard } from "@/components/admin/Statcard";
import { Colors } from "@/constants/Colors";

const HEADER_EXTRA_PADDING = 8;

type Complaint = {
  id: string;
  priority: "high" | "medium";
  title: string;
  location: string;
  timeAgo: string;
  reporterName: string;
};

const COMPLAINTS: Complaint[] = [
  {
    id: "1",
    priority: "high",
    title: "Missed Pickup - Organic",
    location: "123 Maple Street",
    timeAgo: "2h ago",
    reporterName: "Sarah J.",
  },
  {
    id: "2",
    priority: "medium",
    title: "Damaged Recycling Bin",
    location: "456 Oak Avenue",
    timeAgo: "4h ago",
    reporterName: "Mike T.",
  },
];

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();

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
          <Text style={styles.headerTitle}>Admin Dash</Text>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="person" size={12} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.todayRow}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={Colors.cardTextSecondary}
              />
              <Text style={styles.todayText}>Today</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            <StatCard
              icon="warning-outline"
              iconBgColor={Colors.adminStatIconBgComplaints}
              iconColor={Colors.adminStatIconColorComplaints}
              overlayColor={Colors.adminStatOverlayComplaints}
              label="Open Complaints"
              value="14"
              trendIcon="trending-up-outline"
              trendColor={Colors.adminTrendNegative}
              trendText="+2 since yesterday"
            />
            <StatCard
              icon="car-outline"
              iconBgColor={Colors.adminStatIconBgRoutes}
              iconColor={Colors.adminStatIconColorRoutes}
              overlayColor={Colors.adminStatOverlayRoutes}
              label="Active Routes"
              value="8"
              trendIcon="checkmark-circle-outline"
              trendColor={Colors.adminTrendPositive}
              trendText="All on schedule"
            />
            <StatCard
              icon="leaf-outline"
              iconBgColor={Colors.adminStatIconBgTons}
              iconColor={Colors.adminStatIconColorTons}
              overlayColor={Colors.adminStatOverlayTons}
              label="Total Tons"
              value="42.5"
              trendIcon="trending-up-outline"
              trendColor={Colors.adminTrendPositive}
              trendText="+12% this week"
            />
          </ScrollView>
        </View>

        {/* Action Required */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Action Required</Text>
            <Pressable>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          <View style={styles.queueList}>
            {COMPLAINTS.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                priority={complaint.priority}
                title={complaint.title}
                location={complaint.location}
                timeAgo={complaint.timeAgo}
                reporterName={complaint.reporterName}
                onAssign={() => router.push("/")}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 32 }]}
        onPress={() => router.push("/")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </Pressable>
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
    backgroundColor: Colors.adminHeaderIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingTop: 16,
    gap: 28,
  },
  section: {
    gap: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.44,
    color: Colors.cardTextPrimary,
  },
  todayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  todayText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.26,
    color: Colors.cardTextSecondary,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.26,
    color: Colors.pickupGradientEnd,
  },
  queueList: {
    gap: 16,
    paddingHorizontal: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: Colors.adminFabBg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
});
