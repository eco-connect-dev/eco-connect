import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/Colors";

type NoticeCardProps = {
    icon: keyof typeof Ionicons.glyphMap;
    iconBgColor: string;
    iconColor: string;
    title: string;
    preview: string;
    timeAgo: string;
};

export function NoticeCard({
    icon,
    iconBgColor,
    iconColor,
    title,
    preview,
    timeAgo,
}: NoticeCardProps) {
    return (
        <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
                <Ionicons name={icon} size={18} color={iconColor} />
            </View>

            <View style={styles.textBlock}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.preview} numberOfLines={2}>
                    {preview}
                </Text>
                <Text style={styles.timeAgo}>{timeAgo}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        gap: 16,
        backgroundColor: Colors.homeBackground,
        borderWidth: 1,
        borderColor: "rgba(18,20,23,0.05)",
        borderRadius: 16,
        padding: 17,
        width: "100%",
        shadowColor: "#121417",
        shadowOpacity: 0.04,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 10 },
        elevation: 1,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 9999,
        alignItems: "center",
        justifyContent: "center",
    },
    textBlock: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        color: Colors.cardTextPrimary,
        lineHeight: 24,
    },
    preview: {
        fontSize: 16,
        color: Colors.cardTextSecondary,
        lineHeight: 24,
        marginTop: 4,
    },
    timeAgo: {
        fontSize: 11,
        color: Colors.cardTextMuted,
        marginTop: 8,
    },
});