import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View, type ColorValue } from "react-native";

import { Colors } from "@/constants/Colors";

type TabIconProps = {
    focused: boolean;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: ColorValue;
};

export function TabIcon({ focused, icon, label, color }: TabIconProps) {
    return (
        <View style={[styles.pill, focused && styles.pillActive]}>
            <Ionicons name={icon} size={focused ? 18 : 20} color={color} />
            <Text style={[styles.label, { color }, focused && styles.labelActive]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
    },
    pillActive: {
        backgroundColor: Colors.navActivePill,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.26,
    },
    labelActive: {
        color: Colors.navActiveText,
    },
});