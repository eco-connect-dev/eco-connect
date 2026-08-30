import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";

interface InfoRowProps {
    label: string;
    value?: string;
    badge?: string;
}

export function InfoRow({ label, value, badge }: InfoRowProps) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            {badge ? (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge.toUpperCase()}</Text>
                </View>
            ) : (
                <Text style={styles.value}>{value}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
    },
    label: {
        fontSize: 13,
        fontWeight: "400",
        color: Colors.councilTextSecondary,
    },
    value: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.councilTextPrimary,
    },
    badge: {
        backgroundColor: Colors.roleBadgeBg,
        borderWidth: 1,
        borderColor: Colors.roleBadgeBorder,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.councilTextPrimary,
    },
});
