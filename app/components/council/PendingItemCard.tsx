import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { ItemStatus, StatusBadge } from "./StatusBadge";

export type PendingItemCategory = "pickup" | "dumping";

export interface PendingItem {
  id: string;
  title: string;
  category: PendingItemCategory;
  location: string;
  date: string;
  status: ItemStatus;
}

interface PendingItemCardProps {
  item: PendingItem;
  onPress?: (item: PendingItem) => void;
}

const CATEGORY_ICON: Record<
  PendingItemCategory,
  keyof typeof Ionicons.glyphMap
> = {
  pickup: "car-outline",
  dumping: "warning-outline",
};

export function PendingItemCard({ item, onPress }: PendingItemCardProps) {
  return (
    <Pressable style={styles.card} onPress={() => onPress?.(item)}>
      <View style={styles.iconCircle}>
        <Ionicons
          name={CATEGORY_ICON[item.category]}
          size={18}
          color={Colors.councilTextSecondary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={12}
              color={Colors.councilTextSecondary}
            />
            <Text style={styles.location} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    borderRadius: 8,
    padding: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: Colors.councilIconCircleBg,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.councilTextPrimary,
  },
  date: {
    fontSize: 11,
    color: Colors.councilTextMuted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  location: {
    fontSize: 11,
    color: Colors.councilTextSecondary,
    maxWidth: 130,
  },
});
