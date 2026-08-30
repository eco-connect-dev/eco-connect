import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/Colors";

type QuickActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconBgColor: string;
  iconColor: string;
  onPress?: () => void;
};

export function QuickActionCard({
  icon,
  label,
  iconBgColor,
  iconColor,
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.homeBackground,
    borderWidth: 1,
    borderColor: "rgba(18,20,23,0.05)",
    borderRadius: 16,
    paddingVertical: 21,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#121417",
    shadowOpacity: 0.04,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    color: Colors.cardTextPrimary,
    textAlign: "center",
  },
});
