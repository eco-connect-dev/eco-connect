import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";

interface SummaryCardProps {
  value: number | string;
  label: string;
}

export function SummaryCard({ value, label }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.summaryCardBg,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    borderRadius: 8,
    paddingVertical: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.councilTextPrimary,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.councilTextSecondary,
  },
});
