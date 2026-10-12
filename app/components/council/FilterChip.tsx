import { Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/Colors";

interface FilterChipProps {
    label: string;
    active: boolean;
    onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
    return (
        <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    chip: {
        borderWidth: 1,
        borderColor: Colors.councilBorder,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.surface,
    },
    chipActive: {
        backgroundColor: Colors.editProfileBg,
        borderColor: Colors.editProfileBg,
    },
    chipText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.councilTextSecondary,
    },
    chipTextActive: {
        color: Colors.surface,
    },
});
