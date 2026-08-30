import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/Colors";

type PickupCardProps = {
  day: string;
  timeWindow: string;
  wasteType: string;
  onViewDetails?: () => void;
};

export function PickupCard({
  day,
  timeWindow,
  wasteType,
  onViewDetails,
}: PickupCardProps) {
  return (
    <LinearGradient
      colors={[Colors.pickupGradientStart, Colors.pickupGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.decorativeCircle} pointerEvents="none" />

      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>NEXT SCHEDULED{"\n"}PICKUP</Text>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.time}>{timeWindow}</Text>
        </View>

        <View style={styles.badge}>
          <Ionicons name="sync-outline" size={14} color="#fff" />
          <Text style={styles.badgeText}>{wasteType}</Text>
        </View>
      </View>

      <Pressable style={styles.detailsButton} onPress={onViewDetails}>
        <Text style={styles.detailsButtonText}>View Details</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    overflow: "hidden",
    shadowColor: "#121417",
    shadowOpacity: 0.08,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  decorativeCircle: {
    position: "absolute",
    bottom: -32,
    right: -32,
    width: 128,
    height: 128,
    borderRadius: 9999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.8)",
    lineHeight: 18,
    marginBottom: 4,
  },
  day: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 24,
  },
  time: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.pickupBadgeBg,
    borderWidth: 1,
    borderColor: Colors.pickupBadgeBorder,
    borderRadius: 9999,
    paddingHorizontal: 13,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 14,
    color: "#fff",
  },
  detailsButton: {
    marginTop: 16,
    backgroundColor: Colors.homeBackground,
    borderRadius: 9999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.pickupGradientEnd,
  },
});
