import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { WasteCategory } from "./PendingItemCard";
import { ItemStatus } from "./StatusBadge";
import { FilterChip } from "./FilterChip";

export type DateRangeFilter = "all" | "today" | "this_week" | "this_month";

export interface FilterState {
    statuses: ItemStatus[];
    wasteCategories: WasteCategory[];
    area: string;
    dateRange: DateRangeFilter;
}

export const EMPTY_FILTERS: FilterState = {
    statuses: [],
    wasteCategories: [],
    area: "",
    dateRange: "all",
};

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "under_review", label: "Under Review" },
    { value: "assigned", label: "Assigned" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
];

const CATEGORY_OPTIONS: { value: WasteCategory; label: string }[] = [
    { value: "general", label: "General" },
    { value: "recyclable", label: "Recyclable" },
    { value: "hazardous", label: "Hazardous" },
    { value: "bulk", label: "Bulk" },
    { value: "illegal_dumping", label: "Illegal Dumping" },
];

const DATE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
];

interface FilterModalProps {
    visible: boolean;
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    onClose: () => void;
    onClear: () => void;
}

export function FilterModal({ visible, filters, onChange, onClose, onClear }: FilterModalProps) {
    const toggleStatus = (status: ItemStatus) => {
        const exists = filters.statuses.includes(status);
        onChange({
            ...filters,
            statuses: exists
                ? filters.statuses.filter((s) => s !== status)
                : [...filters.statuses, status],
        });
    };

    const toggleCategory = (category: WasteCategory) => {
        const exists = filters.wasteCategories.includes(category);
        onChange({
            ...filters,
            wasteCategories: exists
                ? filters.wasteCategories.filter((c) => c !== category)
                : [...filters.wasteCategories, category],
        });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.headerRow}>
                        <Text style={styles.headerTitle}>Filter Requests</Text>
                        <Pressable onPress={onClose} hitSlop={8}>
                            <Ionicons name="close" size={20} color={Colors.councilTextPrimary} />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Status</Text>
                            <View style={styles.chipRow}>
                                {STATUS_OPTIONS.map((option) => (
                                    <FilterChip
                                        key={option.value}
                                        label={option.label}
                                        active={filters.statuses.includes(option.value)}
                                        onPress={() => toggleStatus(option.value)}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Category</Text>
                            <View style={styles.chipRow}>
                                {CATEGORY_OPTIONS.map((option) => (
                                    <FilterChip
                                        key={option.value}
                                        label={option.label}
                                        active={filters.wasteCategories.includes(option.value)}
                                        onPress={() => toggleCategory(option.value)}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Area</Text>
                            <TextInput
                                style={styles.input}
                                value={filters.area}
                                onChangeText={(text) => onChange({ ...filters, area: text })}
                                placeholder="e.g. Ward Place, Borella"
                                placeholderTextColor={Colors.councilTextMuted}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Date Range</Text>
                            <View style={styles.chipRow}>
                                {DATE_OPTIONS.map((option) => (
                                    <FilterChip
                                        key={option.value}
                                        label={option.label}
                                        active={filters.dateRange === option.value}
                                        onPress={() => onChange({ ...filters, dateRange: option.value })}
                                    />
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Pressable style={styles.clearButton} onPress={onClear}>
                            <Text style={styles.clearButtonText}>Clear All</Text>
                        </Pressable>
                        <Pressable style={styles.applyButton} onPress={onClose}>
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: "85%",
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.councilBorder,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.councilTextPrimary,
    },
    scrollContent: {
        paddingVertical: 16,
        gap: 20,
    },
    section: {
        gap: 10,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: Colors.councilTextSecondary,
        textTransform: "uppercase",
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: Colors.councilBorder,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        color: Colors.councilTextPrimary,
        backgroundColor: Colors.surface,
    },
    footer: {
        flexDirection: "row",
        gap: 12,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.councilBorder,
    },
    clearButton: {
        flex: 1,
        height: 46,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.councilBorder,
        alignItems: "center",
        justifyContent: "center",
    },
    clearButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.councilTextPrimary,
    },
    applyButton: {
        flex: 2,
        height: 46,
        borderRadius: 8,
        backgroundColor: Colors.editProfileBg,
        alignItems: "center",
        justifyContent: "center",
    },
    applyButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.surface,
    },
});
