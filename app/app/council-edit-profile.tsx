import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";

const HEADER_EXTRA_PADDING = 8;

export default function CouncilEditProfileScreen() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{
        name?: string;
        title?: string;
        email?: string;
        phone?: string;
        department?: string;
    }>();

    const [name, setName] = useState(params.name ?? "");
    const [title, setTitle] = useState(params.title ?? "");
    const [phone, setPhone] = useState(params.phone ?? "");
    const [department, setDepartment] = useState(params.department ?? "");

    const handleSave = () => {
        // TODO: persist changes to Supabase, then navigate back
        router.back();
    };

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
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Full name"
                            placeholderTextColor={Colors.councilTextMuted}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Colombo Councillor"
                            placeholderTextColor={Colors.councilTextMuted}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={params.email ?? ""}
                            editable={false}
                        />
                        <Text style={styles.hint}>Email can't be changed here</Text>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Phone number"
                            placeholderTextColor={Colors.councilTextMuted}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Department</Text>
                        <TextInput
                            style={styles.input}
                            value={department}
                            onChangeText={setDepartment}
                            placeholder="Department"
                            placeholderTextColor={Colors.councilTextMuted}
                        />
                    </View>
                </View>

                <View style={styles.actions}>
                    <Pressable style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </Pressable>
                    <Pressable style={styles.cancelButton} onPress={() => router.back()}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
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
    card: {
        width: "100%",
        backgroundColor: Colors.profileCardBg,
        borderWidth: 1,
        borderColor: Colors.councilBorder,
        borderRadius: 12,
        padding: 16,
        gap: 16,
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.councilTextSecondary,
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
    inputDisabled: {
        backgroundColor: Colors.profileIconBg,
        color: Colors.councilTextMuted,
    },
    hint: {
        fontSize: 11,
        color: Colors.councilTextMuted,
    },
    actions: {
        gap: 12,
    },
    saveButton: {
        height: 48,
        borderRadius: 8,
        backgroundColor: Colors.editProfileBg,
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.surface,
    },
    cancelButton: {
        height: 48,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: Colors.signOutBorder,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.councilTextPrimary,
    },
});
