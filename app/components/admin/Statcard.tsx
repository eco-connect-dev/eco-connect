import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/Colors";

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBgColor: string;
  iconColor: string;
  overlayColor: string;
  label: string;
  value: string;
  trendIcon: keyof typeof Ionicons.glyphMap;
  trendColor: string;
  trendText: string;
};

export function StatCard({
  icon,
  iconBgColor,
  iconColor,
  overlayColor,
  label,
  value,
  trendIcon,
  trendColor,
  trendText,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.overlay, { backgroundColor: overlayColor }]} />

      <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>

      <View style={styles.trendRow}>
        <Ionicons name={trendIcon} size={13} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {trendText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    minWidth: 220,
    padding: 20,
    gap: 12,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    shadowColor: "#121417",
    shadowOpacity: 0.04,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    top: -16,
    right: -16,
    width: 96,
    height: 96,
    borderRadius: 9999,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.26,
    color: Colors.cardTextSecondary,
  },
  value: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -1.36,
    color: Colors.cardTextPrimary,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.26,
  },
});
