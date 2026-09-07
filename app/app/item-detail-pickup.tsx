import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatusDropdown } from "@/components/council/StatusDropdown";
import { ItemStatus, StatusBadge } from "@/components/council/StatusBadge";
import { Colors } from "@/constants/Colors";

const HEADER_EXTRA_PADDING = 8;

// TODO: replace with data fetched via the item id (route param) from Supabase
const REQUEST = {
    title: "Bulk Waste Pickup: Old Sofa & Dining Set",
    category: "Bulk Waste (Household)",
    submittedDate: "Aug 12, 2026, 09:34 AM",
    requestedDate: "Aug 15, 2026 (Anytime)",
    location: "42 Maple St, Ward Place",
    mapLabel: "Colombo Ward Place Map",
    description:
        "Three-seater fabric sofa and a wooden dining table left neatly at the curb. Not blocking the sidewalk. Items are dry and prepared for municipal crew loader.",
    submittedByName: "Kasun Gamlath",
    submittedByContact: "kasungamlath20@email.com • +94 77 1132 678",
};

export default function ItemDetailPickupScreen() {
    const insets = useSafeAreaInsets();
    const [status, setStatus] = useState<ItemStatus>("pending");

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + HEADER_EXTRA_PADDING }]}>
                <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
                    <Ionicons name="arrow-back" size={16} color={Colors.councilTextPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>Request Details</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero badge + title */}
                <View style={styles.heroSection}>
                    <StatusBadge status={status} />
                    <Text style={styles.title}>{REQUEST.title}</Text>
                </View>

                <View style={styles.divider} />

                {/* Structured rows */}
                <View style={styles.rowsSection}>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Category</Text>
                        <Text style={styles.rowValueBold}>{REQUEST.category}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Current Status</Text>
                        <StatusDropdown status={status} onChange={setStatus} />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Submitted Date</Text>
                        <Text style={styles.rowValue}>{REQUEST.submittedDate}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Requested Date</Text>
                        <Text style={styles.rowValueBold}>{REQUEST.requestedDate}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Location */}
                <View style={styles.locationSection}>
                    <Text style={styles.sectionLabel}>Pickup Location</Text>
                    <Text style={styles.locationAddress}>{REQUEST.location}</Text>
                    <View style={styles.mapPlaceholder}>
                        <View style={styles.mapLabelPill}>
                            <Ionicons name="location" size={14} color={Colors.councilTextPrimary} />
                            <Text style={styles.mapLabelText}>{REQUEST.mapLabel}</Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionLabel}>Item Description</Text>
                    <Text style={styles.descriptionText}>{REQUEST.description}</Text>
                </View>

                {/* Submitted by */}
                <View style={styles.submitterCard}>
                    <Text style={styles.submitterLabel}>SUBMITTED BY</Text>
                    <Text style={styles.submitterName}>{REQUEST.submittedByName}</Text>
                    <Text style={styles.submitterContact}>{REQUEST.submittedByContact}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Pressable style={styles.primaryButton} onPress={() => setStatus("assigned")}>
                        <Text style={styles.primaryButtonText}>Assign to Municipal Crew</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={() => setStatus("rejected")}>
                        <Text style={styles.secondaryButtonText}>Reject / Close</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.councilBorder,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backButton: {
        width: 28,
        height: 28,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.councilBorder,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.councilHeaderText,
    },
    headerSpacer: {
        width: 28,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
        gap: 20,
    },
    heroSection: {
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: Colors.councilTextPrimary,
    },
    divider: {
        height: 1,
        width: "100%",
        backgroundColor: Colors.councilBorder,
    },
    rowsSection: {
        gap: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rowLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.councilTextSecondary,
    },
    rowValue: {
        fontSize: 14,
        color: Colors.councilTextPrimary,
    },
    rowValueBold: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.councilTextPrimary,
    },
    locationSection: {
        gap: 8,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.councilTextSecondary,
    },
    locationAddress: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.councilTextPrimary,
    },
    mapPlaceholder: {
        height: 120,
        borderRadius: 6,
        backgroundColor: Colors.detailMapBg,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    mapLabelPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: Colors.detailMapOverlayBg,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    mapLabelText: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.councilTextPrimary,
    },
    descriptionSection: {
        gap: 6,
    },
    descriptionText: {
        fontSize: 13,
        lineHeight: 20,
        color: Colors.councilTextPrimary,
    },
    submitterCard: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.councilBorder,
        borderRadius: 6,
        padding: 12,
        gap: 4,
    },
    submitterLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.councilTextSecondary,
        textTransform: "uppercase",
    },
    submitterName: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.councilTextPrimary,
    },
    submitterContact: {
        fontSize: 12,
        color: Colors.councilTextSecondary,
    },
    actions: {
        gap: 8,
    },
    primaryButton: {
        backgroundColor: Colors.btnPrimaryGradientEnd,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.surface,
    },
    secondaryButton: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.councilBorder,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.councilTextPrimary,
    },
});
