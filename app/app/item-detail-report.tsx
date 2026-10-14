import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatusDropdown } from "@/components/council/StatusDropdown";
import { ItemStatus, StatusBadge } from "@/components/council/StatusBadge";
import { Colors } from "@/constants/Colors";
import { getCouncilRequest, TrackedRequest, updateCouncilRequestStatus } from "@/lib/tracking";

const HEADER_EXTRA_PADDING = 8;

export default function ItemDetailReportScreen() {
    const insets = useSafeAreaInsets();
    const [status, setStatus] = useState<ItemStatus>("under_review");
    const [savedStatus, setSavedStatus] = useState<ItemStatus>("under_review");
    const [report, setReport] = useState<TrackedRequest | null>(null);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const { id } = useLocalSearchParams<{ id: string }>();

    useEffect(() => {
        if (!id) return;
        let active = true;
        void getCouncilRequest("dumping_reports", id)
            .then((item) => {
                if (!active) return;
                setReport(item);
                const loadedStatus = item.status === "in_review" ? "under_review" : item.status === "resolved" ? "completed" : item.status;
                setStatus(loadedStatus);
                setSavedStatus(loadedStatus);
            })
            .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Couldn't load this dumping report."); });
        return () => { active = false; };
    }, [id]);

    const saveStatus = async () => {
        if (!id || !report || saving || status === savedStatus) return;
        setSaving(true);
        setError("");
        try {
            const updated = await updateCouncilRequestStatus("dumping_reports", id, status);
            setReport(updated);
            setSavedStatus(status);
            router.replace("/(tabs)/council-dashboard");
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : "Couldn't update the report status.");
        } finally {
            setSaving(false);
        }
    };

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
                    </View>
                    <Text style={styles.title}>{report?.category ?? "Loading dumping report…"}</Text>
                </View>

                <View style={styles.divider} />

                {/* Structured rows */}
                <View style={styles.rowsSection}>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Category</Text>
                        <Text style={styles.rowValueBold}>{report?.category ?? "Loading…"}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Current Status</Text>
                        <StatusDropdown status={status} onChange={setStatus} />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Reported Date</Text>
                        <Text style={styles.rowValue}>{report ? new Date(report.submitted_at).toLocaleString() : "Loading…"}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Photo Evidence</Text>
                        <Text style={styles.rowValueBold}>No photo details available</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Location */}
                <View style={styles.locationSection}>
                    <Text style={styles.sectionLabel}>Reported Location</Text>
                    <Text style={styles.locationAddress}>{report?.location ?? "Loading location…"}</Text>
                    <View style={styles.mapPlaceholder}>
                        <View style={styles.mapLabelPill}>
                            <Ionicons name="location" size={14} color={Colors.councilTextPrimary} />
                            <Text style={styles.mapLabelText}>{report?.location ?? "Reported location"}</Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionLabel}>Report Description</Text>
                    <Text style={styles.descriptionText}>{report?.notes || "No additional notes provided."}</Text>
                </View>
                {report?.image_url ? <Image contentFit="cover" source={{ uri: report.image_url }} style={styles.reportImage} /> : null}

                {/* Reported by */}
                {error ? <Text style={styles.submitterContact}>{error}</Text> : null}

                {/* Actions */}
                <View style={styles.actions}>
                    <Pressable style={[styles.primaryButton, (!report || saving || status === savedStatus) && styles.disabledButton]} disabled={!report || saving || status === savedStatus} onPress={() => void saveStatus()}>
                        <Text style={styles.primaryButtonText}>{saving ? "Saving…" : "Save Changes"}</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} disabled={saving} onPress={() => router.replace("/(tabs)/council-dashboard")}>
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
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
    reportImage: { width: "100%", height: 240, borderRadius: 8 },
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
    disabledButton: {
        opacity: 0.5,
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
