import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/Colors";

type Priority = "high" | "medium";

type ComplaintCardProps = {
  priority: Priority;
  title: string;
  location: string;
  timeAgo: string;
  reporterName: string;
  onAssign?: () => void;
};

const PRIORITY_STYLES: Record<
  Priority,
  { badgeBg: string; badgeText: string; accent: string; icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  high: {
    badgeBg: Colors.adminPriorityHighBg,
    badgeText: Colors.adminPriorityHighText,
    accent: Colors.adminPriorityHighAccent,
    icon: "alert",
    label: "High",
  },
  medium: {
    badgeBg: Colors.adminPriorityMediumBg,
    badgeText: Colors.adminPriorityMediumText,
    accent: Colors.adminPriorityMediumAccent,
    icon: "warning",
    label: "Medium",
  },
};

export function ComplaintCard({
  priority,
  title,
  location,
  timeAgo,
  reporterName,
  onAssign,
}: ComplaintCardProps) {
  const priorityStyle = PRIORITY_STYLES[priority];

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: priorityStyle.accent }]} />

      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View style={[styles.badge, { backgroundColor: priorityStyle.badgeBg }]}>
            <Ionicons name={priorityStyle.icon} size={11} color={priorityStyle.badgeText} />
            <Text style={[styles.badgeText, { color: priorityStyle.badgeText }]}>
              {priorityStyle.label}
            </Text>
          </View>

          <Text style={styles.title}>{title}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={Colors.cardTextSecondary} />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>

        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={14} color={Colors.surface} />
        </View>

        <Text style={styles.reporter} numberOfLines={1}>
          Reported by {reporterName}
        </Text>

        <Pressable onPress={onAssign} style={styles.assignButtonWrapper}>
          <LinearGradient
            colors={[Colors.adminAssignGradientStart, Colors.adminAssignGradientEnd]}
            style={styles.assignButton}
          >
            <Text style={styles.assignText}>Assign</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 20,
    paddingLeft: 26,
    gap: 16,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    shadowColor: "#121417",
    shadowOpacity: 0.04,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
    overflow: "hidden",
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  topLeft: {
    gap: 4,
    flexShrink: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.26,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.17,
    color: Colors.cardTextPrimary,
    paddingTop: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 15,
    color: Colors.cardTextSecondary,
  },
  timeAgo: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.26,
    color: Colors.cardTextSecondary,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: Colors.pickupGradientEnd,
    alignItems: "center",
    justifyContent: "center",
  },
  reporter: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.26,
    color: Colors.cardTextPrimary,
  },
  assignButtonWrapper: {
    borderRadius: 9999,
  },
  assignButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  assignText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.26,
    color: Colors.surface,
  },
});