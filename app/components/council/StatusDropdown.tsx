import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
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

type Anchor = { top: number; right: number };

interface StatusDropdownProps {
    status: ItemStatus;
    onChange: (status: ItemStatus) => void;
}

export function StatusDropdown({ status, onChange }: StatusDropdownProps) {
    const triggerRef = useRef<View>(null);
    const { width: windowWidth } = useWindowDimensions();
    const [open, setOpen] = useState(false);
    const [anchor, setAnchor] = useState<Anchor>({ top: 0, right: 0 });

    const handleOpen = () => {
        triggerRef.current?.measureInWindow((x, y, width, height) => {
            setAnchor({
                top: y + height + 6,
                right: windowWidth - (x + width),
            });
            setOpen(true);
        });
    };

    return (
        <View>
            <View ref={triggerRef} collapsable={false}>
                <Pressable style={styles.trigger} onPress={handleOpen} hitSlop={6}>
                    <StatusBadge status={status} />
                    <Ionicons
                        name={open ? "chevron-up" : "chevron-down"}
                        size={12}
                        color={Colors.councilTextSecondary}
                    />
                </Pressable>
            </View>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setOpen(false)}
            >
                <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
                    <View style={[styles.menu, { top: anchor.top, right: anchor.right }]}>
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
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    backdrop: {
        flex: 1,
    },
    menu: {
        position: "absolute",
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.councilBorder,
        borderRadius: 8,
        paddingVertical: 4,
        minWidth: 140,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    menuItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
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
