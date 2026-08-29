import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ContactRow } from "@/components/council/ContactRow";
import { InfoRow } from "@/components/council/InfoRow";
import { SummaryCard } from "@/components/council/SummaryCard";
import { Colors } from "@/constants/Colors";

const HEADER_EXTRA_PADDING = 8;

// TODO: replace with data from Supabase (authenticated council member profile)
const PROFILE = {
    name: "Cllr. Kamal Perera",
    title: "Colombo Councillor",
    email: "kamal.perera@municipal.gov.lk",
    phone: "+94 71 1122 990",
    memberSince: "Nov 2021",
    role: "Council Member",
    department: "Environmental Services",
    resolvedCount: 98,
    pendingCount: 12,
};

export default function CouncilProfileScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + HEADER_EXTRA_PADDING }]}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.back()}
                    hitSlop={8}
                >
                    <Ionicons name="arrow-back" size={20} color={Colors.councilTextPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>My Profile</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Name / title */}
                <View style={styles.profileHeader}>
                    <Text style={styles.name}>{PROFILE.name}</Text>
                    <Text style={styles.title}>{PROFILE.title}</Text>
                </View>

                {/* Contact Details */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Contact Details</Text>
                    <ContactRow icon="mail-outline" label="Email Address" value={PROFILE.email} />
                    <View style={styles.divider} />
                    <ContactRow icon="call-outline" label="Phone Number" value={PROFILE.phone} />
                </View>

                {/* Account Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Account Info</Text>
                    <InfoRow label="Member Since" value={PROFILE.memberSince} />
                    <View style={styles.divider} />
                    <InfoRow label="Role Designation" badge={PROFILE.role} />
                    <View style={styles.divider} />
                    <InfoRow label="Department" value={PROFILE.department} />
                </View>

                {/* Activity Summary */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Activity Summary</Text>
                    <View style={styles.summaryRow}>
                        <SummaryCard value={PROFILE.resolvedCount} label="Resolved" />
                        <SummaryCard value={PROFILE.pendingCount} label="Pending" />
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Pressable
                        style={styles.editButton}
                        onPress={() =>
                            router.push({
                                pathname: "/council-edit-profile",
                                params: {
                                    name: PROFILE.name,
                                    title: PROFILE.title,
                                    email: PROFILE.email,
                                    phone: PROFILE.phone,
                                    department: PROFILE.department,
                                },
                            })
                        }
                    >
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </Pressable>
                    <Pressable style={styles.signOutButton}>
                        <Text style={styles.signOutButtonText}>Sign Out</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.profileBackground,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.councilBorder,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.councilTextPrimary,
    },
    headerSpacer: {
        width: 28,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 32,
        gap: 24,
    },
    profileHeader: {
        alignItems: "center",
        gap: 4,
        paddingVertical: 8,
    },
    name: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.councilTextPrimary,
        textAlign: "center",
    },
    title: {
        fontSize: 14,
        fontWeight: "400",
        color: Colors.councilTextSecondary,
        textAlign: "center",
    },
    card: {
        width: "100%",
        backgroundColor: Colors.profileCardBg,
        borderWidth: 1,
        borderColor: Colors.councilBorder,
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: Colors.councilTextSecondary,
        textTransform: "uppercase",
    },
    divider: {
        height: 1,
        width: "100%",
        backgroundColor: Colors.councilBorder,
    },
    summaryRow: {
        flexDirection: "row",
        gap: 8,
    },
    actions: {
        gap: 12,
        paddingTop: 8,
    },
    editButton: {
        height: 48,
        borderRadius: 8,
        backgroundColor: Colors.editProfileBg,
        alignItems: "center",
        justifyContent: "center",
    },
    editButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.surface,
    },
    signOutButton: {
        height: 48,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: Colors.signOutBorder,
        alignItems: "center",
        justifyContent: "center",
    },
    signOutButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.councilTextPrimary,
    },
});
