import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";

interface ContactRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

export function ContactRow({ icon, label, value }: ContactRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={18} color={Colors.councilTextSecondary} />
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  iconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: Colors.profileIconBg,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.councilTextMuted,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.councilTextPrimary,
  },
});
