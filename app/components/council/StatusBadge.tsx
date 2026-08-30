import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";

export type ItemStatus = "pending" | "under_review" | "assigned";

const STATUS_CONFIG: Record<
  ItemStatus,
  { label: string; bg: string; border: string; text: string }
> = {
  pending: {
    label: "Pending",
    bg: Colors.statusPendingBg,
    border: Colors.statusPendingBorder,
    text: Colors.statusPendingText,
  },
  under_review: {
    label: "Under Review",
    bg: Colors.statusReviewBg,
    border: Colors.statusReviewBorder,
    text: Colors.statusReviewText,
  },
  assigned: {
    label: "Assigned",
    bg: Colors.statusAssignedBg,
    border: Colors.statusAssignedBorder,
    text: Colors.statusAssignedText,
  },
};

interface StatusBadgeProps {
  status: ItemStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <Text style={[styles.label, { color: config.text }]}>
        {config.label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
  },
});
