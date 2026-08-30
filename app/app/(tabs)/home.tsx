import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoticeCard } from "@/components/resident/NoticeCard";
import { PickupCard } from "@/components/resident/PickupCard";
import { QuickActionCard } from "@/components/resident/QuickActionCard";
import { Colors } from "@/constants/Colors";

const HEADER_EXTRA_PADDING = 8;

export default function ResidentHomeScreen() {
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
          day="Tomorrow"
          timeWindow="8:00 AM – 12:00 PM"
          wasteType="Recycling"
          onViewDetails={() => router.push("/")}
        />

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
              label="Report Issue"
              iconBgColor={Colors.quickActionCoralBg}
              iconColor={Colors.coral}
              onPress={() => router.push("/(tabs)/request")}
            />
          </View>
        </View>

        {/* Community Notices */}
        <View style={[styles.section, styles.noticesSection]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Community Notices</Text>
            <Pressable>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          <View style={styles.noticesList}>
            <NoticeCard
              icon="calendar-outline"
              iconBgColor={Colors.noticeIconGreenBg}
              iconColor={Colors.forestGreen}
              title="Holiday Schedule Changes"
              preview="Due to the upcoming national holiday, Friday pickups will be…"
              timeAgo="2 days ago"
            />
            <NoticeCard
              icon="leaf-outline"
              iconBgColor={Colors.noticeIconCoralBg}
              iconColor={Colors.coral}
              title="New Composting Guidelines"
              preview="We are now accepting a wider variety of organic waste in the…"
              timeAgo="5 days ago"
            />
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
});
