import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CouncilItemCard } from "@/components/council/CouncilItemCard";
import { Colors } from "@/constants/Colors";
import { paginateCouncilItems } from "@/lib/council";
import type { CouncilItem } from "@/types/council";

const PAGE_SIZE = 10;

//temporary mock dataset used until the Supabase-backed "council-pending-feed" function is available (see lib/council.ts).
const MOCK_ITEMS: CouncilItem[] = [
    {
        id: "p-1001",
        type: "pickup_request",
        title: "Bulk waste pickup request",
        category: "Bulk / General",
        status: "pending",
        submittedAt: "2026-08-13T09:15:00Z",
        location: "123 Greenview Lane, Eco District",
        notes: "2 bags and old chair",
    },
    {
        id: "d-2001",
        type: "dumping_report",
        title: "Illegal dumping near canal",
        category: "Illegal dumping",
        status: "pending",
        submittedAt: "2026-08-13T08:40:00Z",
        location: "Canal Road, Ward 04",
        notes: "Mattresses and plastic waste",
    },
    {
        id: "p-1002",
        type: "pickup_request",
        title: "Recycling pickup request",
        category: "Recyclable",
        status: "pending",
        submittedAt: "2026-08-12T15:25:00Z",
        location: "78 Palm Street",
        notes: "Cardboard and bottles",
    },
    {
        id: "d-2002",
        type: "dumping_report",
        title: "Dumped waste beside vacant lot",
        category: "Illegal dumping",
        status: "in_review",
        submittedAt: "2026-08-12T11:05:00Z",
        location: "Lot 19, Oak Avenue",
        notes: "Mixed waste, no containers",
    },
    {
        id: "p-1003",
        type: "pickup_request",
        title: "Garden waste pickup",
        category: "Organic",
        status: "pending",
        submittedAt: "2026-08-11T17:50:00Z",
        location: "12 Pine Lane",
        notes: "Leaves and branches",
    },
    {
        id: "d-2003",
        type: "dumping_report",
        title: "Roadside dumping near school",
        category: "Illegal dumping",
        status: "assigned",
        submittedAt: "2026-08-11T07:20:00Z",
        location: "School Road, Zone C",
        notes: "Small bags and bottles",
    },
    {
        id: "p-1004",
        type: "pickup_request",
        title: "Hazardous waste pickup",
        category: "Hazardous",
        status: "pending",
        submittedAt: "2026-08-10T13:30:00Z",
        location: "44 Cedar Boulevard",
        notes: "Old paint cans",
    },
    {
        id: "d-2004",
        type: "dumping_report",
        title: "Construction debris report",
        category: "Illegal dumping",
        status: "pending",
        submittedAt: "2026-08-10T10:00:00Z",
        location: "Behind Market Complex",
        notes: "Bricks and concrete waste",
    },
];

// Extracted separator component to satisfy SonarQube
function CouncilItemSeparator() {
    return <View style={styles.itemSeparator} />;
}

function CouncilView() {
    const [items, setItems] = useState<CouncilItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadPage = useCallback(async (pageNumber: number, replace = false) => {
        // swap this block for `await fetchCouncilFeed({ page: pageNumber, pageSize: PAGE_SIZE })`
        // once the Supabase function is deployed.
        const result = paginateCouncilItems(MOCK_ITEMS, pageNumber, PAGE_SIZE);

        setItems((prev) => (replace ? result.items : [...prev, ...result.items]));
        setHasMore(result.hasMore);
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            await loadPage(1, true);
            setLoading(false);
        })();
    }, [loadPage]);

    const pendingCount = useMemo(
        () => items.filter((item) => item.status === "pending").length,
        [items],
    );
    const requestCount = useMemo(
        () => items.filter((item) => item.type === "pickup_request").length,
        [items],
    );
    const reportCount = useMemo(
        () => items.filter((item) => item.type === "dumping_report").length,
        [items],
    );

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        await loadPage(1, true);
        setRefreshing(false);
    };

    const onEndReached = async () => {
        if (!hasMore || loading || refreshing) return;
        const nextPage = page + 1;
        setPage(nextPage);
        await loadPage(nextPage);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.screen}>
                <View style={styles.loaderWrap}>
                    <ActivityIndicator size="large" color={Colors.forestGreen} />
                    <Text style={styles.loaderText}>Loading council view...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.screen}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <CouncilItemCard item={item} />}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={CouncilItemSeparator}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.forestGreen}
                    />
                }
                onEndReached={onEndReached}
                onEndReachedThreshold={0.4}
                ListHeaderComponent={
                    <View style={styles.headerWrap}>
                        <View style={styles.topRow}>
                            <View>
                                <Text style={styles.screenTitle}>Council View</Text>
                                <Text style={styles.screenSubtitle}>
                                    Pending pickup requests and dumping reports
                                </Text>
                            </View>

                            <View style={styles.accessBadge}>
                                <Ionicons
                                    name="shield-checkmark-outline"
                                    size={13}
                                    color={Colors.textSecondary}
                                />
                                <Text style={styles.accessBadgeText}>Council</Text>
                            </View>
                        </View>

                        <View style={styles.summaryRow}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryValue}>{pendingCount}</Text>
                                <Text style={styles.summaryLabel}>Pending</Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryValue}>{requestCount}</Text>
                                <Text style={styles.summaryLabel}>Pickup</Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryValue}>{reportCount}</Text>
                                <Text style={styles.summaryLabel}>Reports</Text>
                            </View>
                        </View>

                        <View style={styles.sectionHeading}>
                            <Text style={styles.sectionTitle}>All pending items</Text>
                            <Text style={styles.sectionHint}>Scroll for more</Text>
                        </View>
                    </View>
                }
                ListFooterComponent={
                    <View style={styles.footerWrap}>
                        {hasMore ? (
                            <ActivityIndicator color={Colors.forestGreen} />
                        ) : (
                            <Text style={styles.footerText}>No more items to load</Text>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
}

export default CouncilView;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loaderWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    loaderText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    listContent: {
        padding: 16,
        paddingBottom: 28,
    },
    itemSeparator: {
        height: 10,
    },
    headerWrap: {
        gap: 14,
        marginBottom: 10,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: Colors.textPrimary,
    },
    screenSubtitle: {
        marginTop: 4,
        fontSize: 13,
        color: Colors.textSecondary,
    },
    accessBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: Colors.chipBackground,
        borderWidth: 1,
        borderColor: Colors.chipBorder,
    },
    accessBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.textSecondary,
    },
    summaryRow: {
        flexDirection: "row",
        gap: 10,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: "800",
        color: Colors.textPrimary,
    },
    summaryLabel: {
        marginTop: 2,
        fontSize: 11,
        color: Colors.textSecondary,
    },
    sectionHeading: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    sectionHint: {
        fontSize: 12,
        color: Colors.textMuted,
    },
    footerWrap: {
        paddingVertical: 18,
        alignItems: "center",
    },
    footerText: {
        color: Colors.textMuted,
        fontSize: 13,
    },
});
