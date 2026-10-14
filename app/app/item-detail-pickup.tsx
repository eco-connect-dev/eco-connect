import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatusDropdown } from "@/components/council/StatusDropdown";
import { ItemStatus, StatusBadge } from "@/components/council/StatusBadge";
import { Colors } from "@/constants/Colors";
import { getCouncilRequest, TrackedRequest, updateCouncilRequestStatus } from "@/lib/tracking";

const HEADER_EXTRA_PADDING = 8;

export default function ItemDetailPickupScreen() {
    const insets = useSafeAreaInsets();
    const [status, setStatus] = useState<ItemStatus>("pending");
    const [request, setRequest] = useState<TrackedRequest | null>(null);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const { id } = useLocalSearchParams<{ id: string }>();

    useEffect(() => {
        if (!id) return;
        let active = true;
        void getCouncilRequest("pickup_requests", id)
            .then((item) => {
                if (!active) return;
                setRequest(item);
                setStatus(item.status === "in_review" ? "under_review" : item.status === "resolved" ? "completed" : item.status);
            })
            .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Couldn't load this pickup request."));
        return () => { active = false; };
    }, [id]);

    const saveStatus = async (nextStatus: ItemStatus, returnToDashboard = false) => {
        if (!id || saving) return;
        setSaving(true);
        setError("");
        try {
            const updated = await updateCouncilRequestStatus("pickup_requests", id, nextStatus);
            setRequest(updated);
            setStatus(nextStatus);
            if (returnToDashboard) router.replace("/(tabs)/council-dashboard");
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : "Couldn't update the request status.");
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
                <Text style={styles.headerTitle}>Request Details</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero badge + title */}
                <View style={styles.heroSection}>
                    <StatusBadge status={status} />
                    <Text style={styles.title}>{request ? `${request.category} pickup` : "Pickup Request"}</Text>
                </View>

                <View style={styles.divider} />

                {/* Structured rows */}
                <View style={styles.rowsSection}>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Category</Text>
                        <Text style={styles.rowValueBold}>{request?.category ?? "Loading…"}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Current Status</Text>
                        <StatusDropdown status={status} onChange={saveStatus} />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Submitted Date</Text>
                        <Text style={styles.rowValue}>{request ? new Date(request.submitted_at).toLocaleString() : "Loading…"}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Requested Date</Text>
                        <Text style={styles.rowValueBold}>Pickup requested</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Location */}
                <View style={styles.locationSection}>
                    <Text style={styles.sectionLabel}>Pickup Location</Text>
                    <Text style={styles.locationAddress}>{request?.location ?? "Loading location…"}</Text>
                    <View style={styles.mapPlaceholder}>
                        <View style={styles.mapLabelPill}>
                            <Ionicons name="location" size={14} color={Colors.councilTextPrimary} />
                            <Text style={styles.mapLabelText}>{request?.location ?? "Pickup location"}</Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionLabel}>Item Description</Text>
                    <Text style={styles.descriptionText}>{request?.notes || "No additional notes provided."}</Text>
                </View>

                {error ? <Text style={styles.submitterContact}>{error}</Text> : null}

                {/* Actions */}
                <View style={styles.actions}>
                    <Pressable style={styles.primaryButton} disabled={saving} onPress={() => void saveStatus("assigned", true)}>
                        <Text style={styles.primaryButtonText}>{saving ? "Saving…" : "Assign to Municipal Crew"}</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} disabled={saving} onPress={() => void saveStatus("rejected", true)}>
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
