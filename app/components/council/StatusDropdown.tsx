import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { ItemStatus, StatusBadge } from "./StatusBadge";

const SELECTABLE_STATUSES: ItemStatus[] = ["assigned", "rejected", "completed"];

const STATUS_LABEL: Record<ItemStatus, string> = {
    pending: "Pending",
    under_review: "Under Review",
    assigned: "Assigned",
    rejected: "Rejected",
    completed: "Completed",
};

interface StatusDropdownProps {
    status: ItemStatus;
    onChange: (status: ItemStatus) => void;
}

export function StatusDropdown({ status, onChange }: StatusDropdownProps) {
    const [open, setOpen] = useState(false);

    return (
        <View style={styles.wrapper}>
            <Pressable
                style={styles.trigger}
                onPress={() => setOpen((prev) => !prev)}
                hitSlop={6}
            >
                <StatusBadge status={status} />
                <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={12}
                    color={Colors.councilTextSecondary}
                />
            </Pressable>

            {open && (
                <View style={styles.menu}>
                    {SELECTABLE_STATUSES.map((option) => (
                        <Pressable
                            key={option}
                            style={[styles.menuItem, option === status && styles.menuItemActive]}
                            onPress={() => {
                                onChange(option);
                                setOpen(false);
                            }}
                        >
                            <Text
                                style={[
                                    styles.menuItemText,
                                    option === status && styles.menuItemTextActive,
                                ]}
                            >
                                {STATUS_LABEL[option]}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "relative",
    },
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    menu: {
        position: "absolute",
        top: 28,
        right: 0,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.councilBorder,
        borderRadius: 8,
        paddingVertical: 4,
        minWidth: 140,
        zIndex: 10,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    menuItem: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    menuItemActive: {
        backgroundColor: Colors.profileIconBg,
    },
    menuItemText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.councilTextPrimary,
    },
    menuItemTextActive: {
        color: Colors.editProfileBg,
    },
});
