import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/Colors";
import type { CouncilItem, CouncilItemStatus, CouncilItemType } from "@/types/council";

function formatDate(value: string) {
    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getTypeMeta(type: CouncilItemType) {
    if (type === "pickup_request") {
        return {
            label: "Pickup Request",
            icon: "trash-outline" as const,
        };
    }

    return {
        label: "Dumping Report",
        icon: "alert-circle-outline" as const,
    };
}

function getStatusStyle(status: CouncilItemStatus) {
    if (status === "pending") {
        return { bg: Colors.statusPendingBg, fg: Colors.statusPendingText, label: "Pending" };
    }
    if (status === "in_review") {
        return { bg: Colors.statusReviewBg, fg: Colors.statusReviewText, label: "In Review" };
    }
    return { bg: Colors.statusAssignedBg, fg: Colors.statusAssignedText, label: "Assigned" };
}

type Props = {
    item: CouncilItem;
    onPress?: (item: CouncilItem) => void;
};

export function CouncilItemCard({ item, onPress }: Readonly<Props>) {
    const meta = getTypeMeta(item.type);
    const statusStyle = getStatusStyle(item.status);

    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => onPress?.(item)}
        >
            <View style={styles.headerRow}>
                <View style={styles.typeTag}>
                    <Ionicons name={meta.icon} size={15} color={Colors.textSecondary} />
                    <Text style={styles.typeTagText}>{meta.label}</Text>
                </View>

                <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.fg }]}>{statusStyle.label}</Text>
                </View>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.metaLine}>
                {item.category} • {formatDate(item.submittedAt)}
            </Text>

            <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={15} color={Colors.textSecondary} />
                <Text style={styles.locationText}>{item.location}</Text>
            </View>

            {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.divider,
        padding: 14,
        gap: 8,
    },
    cardPressed: {
        opacity: 0.9,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    typeTag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: Colors.chipBackground,
        borderWidth: 1,
        borderColor: Colors.chipBorder,
        flexShrink: 1,
    },
    typeTagText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.textSecondary,
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
    },
    title: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    metaLine: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 6,
    },
    locationText: {
        flex: 1,
        fontSize: 13,
        color: Colors.textPrimary,
    },
    notes: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontStyle: "italic",
    },
});
