import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";

interface StatCardProps {
  value: number | string;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.councilTextPrimary,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.councilTextSecondary,
  },
});
