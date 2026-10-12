import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatusDropdown } from "@/components/council/StatusDropdown";
import { ItemStatus, StatusBadge } from "@/components/council/StatusBadge";
import { Colors } from "@/constants/Colors";

const HEADER_EXTRA_PADDING = 8;

type Severity = "low" | "medium" | "high";

const SEVERITY_LABEL: Record<Severity, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
};

const SEVERITY_COLOR: Record<Severity, string> = {
    low: Colors.statusPendingText,
    medium: Colors.statusReviewText,
    high: Colors.statusRejectedText,
};

// TODO: replace with data fetched via the item id (route param) from Supabase
const REPORT = {
    title: "Illegal Dumping: Construction Debris",
    wasteCategory: "Illegal Dumping",
    severity: "high" as Severity,
    reportedDate: "Aug 11, 2026, 03:12 PM",
    location: "450 Industrial Rd, Industrial Zone",
    mapLabel: "Industrial Zone Map",
    description:
        "Large pile of construction debris and broken tiles dumped at the roadside, partially blocking the drainage canal. Reported by multiple nearby residents over the past two days.",
    reportedByName: "Anonymous Resident",
    reportedByContact: "Submitted via app • No contact shared",
    photoCount: 3,
};

export default function ItemDetailReportScreen() {
    const insets = useSafeAreaInsets();
    const [status, setStatus] = useState<ItemStatus>("under_review");

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + HEADER_EXTRA_PADDING }]}>
                <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
                    <Ionicons name="arrow-back" size={16} color={Colors.councilTextPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>Report Details</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero badge + title */}
                <View style={styles.heroSection}>
                    <View style={styles.heroBadgeRow}>
                        <StatusBadge status={status} />
                        <View
                            style={[
                                styles.severityBadge,
                                { borderColor: SEVERITY_COLOR[REPORT.severity] },
                            ]}
                        >
                            <Text style={[styles.severityText, { color: SEVERITY_COLOR[REPORT.severity] }]}>
                                {SEVERITY_LABEL[REPORT.severity].toUpperCase()} SEVERITY
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.title}>{REPORT.title}</Text>
                </View>

                <View style={styles.divider} />

                {/* Structured rows */}
                <View style={styles.rowsSection}>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Category</Text>
                        <Text style={styles.rowValueBold}>{REPORT.wasteCategory}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Current Status</Text>
                        <StatusDropdown status={status} onChange={setStatus} />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Reported Date</Text>
                        <Text style={styles.rowValue}>{REPORT.reportedDate}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Photo Evidence</Text>
                        <Text style={styles.rowValueBold}>{REPORT.photoCount} photo(s) attached</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Location */}
                <View style={styles.locationSection}>
                    <Text style={styles.sectionLabel}>Reported Location</Text>
                    <Text style={styles.locationAddress}>{REPORT.location}</Text>
                    <View style={styles.mapPlaceholder}>
                        <View style={styles.mapLabelPill}>
                            <Ionicons name="location" size={14} color={Colors.councilTextPrimary} />
                            <Text style={styles.mapLabelText}>{REPORT.mapLabel}</Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionLabel}>Report Description</Text>
                    <Text style={styles.descriptionText}>{REPORT.description}</Text>
                </View>

                {/* Reported by */}
                <View style={styles.submitterCard}>
                    <Text style={styles.submitterLabel}>REPORTED BY</Text>
                    <Text style={styles.submitterName}>{REPORT.reportedByName}</Text>
                    <Text style={styles.submitterContact}>{REPORT.reportedByContact}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Pressable style={styles.primaryButton} onPress={() => setStatus("assigned")}>
                        <Text style={styles.primaryButtonText}>Dispatch Cleanup Crew</Text>
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
    heroBadgeRow: {
        flexDirection: "row",
        gap: 8,
    },
    severityBadge: {
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    severityText: {
        fontSize: 11,
        fontWeight: "700",
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
