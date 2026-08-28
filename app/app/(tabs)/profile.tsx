import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";

const HEADER_EXTRA_PADDING = 8;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [signingOut, setSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleBack = () => {
    if (router.canGoBack()) return router.back();
    router.replace("/(tabs)/home");
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setErrorMessage("");
    const { error } = await supabase.auth.signOut();
    setSigningOut(false);
    if (error) return setErrorMessage(error.message);
    router.replace("/");
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + HEADER_EXTRA_PADDING }]}>
        <View style={styles.headerRow}>
          <Pressable accessibilityLabel="Go back" hitSlop={8} onPress={handleBack} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={22} color={Colors.cardTextPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Pressable accessibilityLabel="Notifications" hitSlop={8} style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={18} color={Colors.cardTextPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.identityCard}>
          <View style={styles.avatarBorder}>
            <Image
              accessibilityLabel="Sarath Perera"
              contentFit="cover"
              source="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=320&q=90"
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>Sarath Perera</Text>
          <View style={styles.rolePill}><Text style={styles.roleText}>RESIDENT</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>CONTACT DETAILS</Text>
          <ContactRow icon="mail-outline" label="Email Address" value="sarath.perera@gmail.com" />
          <View style={styles.divider} />
          <ContactRow icon="call-outline" label="Phone Number" value="+94 71 4467 990" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>ACCOUNT INFO</Text>
          <InfoRow label="Member Since" value="Jan 2023" />
          <View style={styles.divider} />
          <InfoRow label="Location" value="16, Flower Lane, Borella" location />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>ACTIVITY SUMMARY</Text>
          <View style={styles.activityRow}>
            <ActivityStat count="23" label="Reported Issues" style={styles.issueStat} />
            <ActivityStat count="12" label="Pickup Requests" style={styles.pickupStat} />
          </View>
        </View>

        <Pressable accessibilityRole="button" style={styles.editButton}>
          <LinearGradient colors={["#5BB866", "#176D25"]} end={{ x: 1, y: 0.5 }} start={{ x: 0, y: 0.5 }} style={styles.editGradient}>
            <Text style={styles.editText}>Edit Profile</Text>
          </LinearGradient>
        </Pressable>

        <Pressable accessibilityRole="button" disabled={signingOut} onPress={handleSignOut} style={[styles.signOutButton, signingOut && styles.buttonDisabled]}>
          {signingOut ? <ActivityIndicator color={Colors.cardTextPrimary} /> : <Text style={styles.signOutText}>Sign Out</Text>}
        </Pressable>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </ScrollView>
    </View>
  );
}

function ContactRow({ icon, label, value }: { icon: "mail-outline" | "call-outline"; label: string; value: string }) {
  return <View style={styles.contactRow}><View style={styles.iconBox}><Ionicons name={icon} size={15} color={Colors.forestGreen} /></View><View style={styles.contactCopy}><Text style={styles.fieldLabel}>{label}</Text><Text style={styles.fieldValue}>{value}</Text></View></View>;
}

function InfoRow({ label, value, location = false }: { label: string; value: string; location?: boolean }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={[styles.infoValue, location && styles.locationValue]}>{value}</Text></View>;
}

function ActivityStat({ count, label, style }: { count: string; label: string; style: object }) {
  return <View style={[styles.activityStat, style]}><Text style={styles.statCount}>{count}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.homeBackground },
  header: { backgroundColor: Colors.homeBackground, borderBottomColor: "#E7E7EC", borderBottomWidth: StyleSheet.hairlineWidth },
  headerRow: { alignItems: "center", flexDirection: "row", height: 41, justifyContent: "space-between", paddingHorizontal: 20 },
  headerButton: { alignItems: "center", backgroundColor: Colors.surface, borderColor: "#ECEBEC", borderRadius: 8, borderWidth: 1, height: 34, justifyContent: "center", width: 34 },
  headerTitle: { color: Colors.cardTextPrimary, fontSize: 22, fontWeight: "700", letterSpacing: -0.5 },
  content: { gap: 21, padding: 20, paddingBottom: 20 },
  identityCard: { alignItems: "center", backgroundColor: Colors.surface, borderColor: "#F0EFF0", borderRadius: 16, borderWidth: 1, minHeight: 185, paddingBottom: 18, paddingTop: 19 },
  avatarBorder: { borderColor: "#075819", borderRadius: 43, borderWidth: 2, height: 85, overflow: "hidden", width: 85 },
  avatar: { height: "100%", width: "100%" },
  name: { color: Colors.cardTextPrimary, fontSize: 21, fontWeight: "700", letterSpacing: -0.5, marginTop: 14 },
  rolePill: { backgroundColor: "#F0F0F4", borderRadius: 13, marginTop: 5, paddingHorizontal: 11, paddingVertical: 4 },
  roleText: { color: "#075819", fontSize: 12, fontWeight: "700" },
  card: { backgroundColor: Colors.surface, borderColor: "#F0EFF0", borderRadius: 16, borderWidth: 1, padding: 16 },
  cardHeading: { color: Colors.cardTextSecondary, fontSize: 11, fontWeight: "700", marginBottom: 12 },
  contactRow: { alignItems: "center", flexDirection: "row" },
  iconBox: { alignItems: "center", backgroundColor: "#F0F0F4", borderColor: "#DEDEE4", borderRadius: 8, borderWidth: 1, height: 32, justifyContent: "center", width: 32 },
  contactCopy: { flex: 1, marginLeft: 12 },
  fieldLabel: { color: Colors.cardTextSecondary, fontSize: 11, fontWeight: "500", marginBottom: 2 },
  fieldValue: { color: Colors.cardTextPrimary, fontSize: 14, fontWeight: "700", letterSpacing: -0.25 },
  divider: { backgroundColor: "#EAE9EA", height: 1, marginVertical: 12 },
  infoRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  infoLabel: { color: Colors.cardTextSecondary, fontSize: 14, fontWeight: "500" },
  infoValue: { color: Colors.cardTextPrimary, fontSize: 14, fontWeight: "700", textAlign: "right" },
  locationValue: { fontSize: 13, maxWidth: "62%" },
  activityRow: { flexDirection: "row", gap: 10 },
  activityStat: { alignItems: "center", borderRadius: 12, borderWidth: 1, flex: 1, paddingVertical: 13 },
  issueStat: { backgroundColor: "#F0F0F4", borderColor: "#DEDEE4" },
  pickupStat: { backgroundColor: "#EAFBF3", borderColor: "#D2EFE2" },
  statCount: { color: "#075819", fontSize: 26, fontWeight: "700", lineHeight: 29 },
  statLabel: { color: Colors.cardTextSecondary, fontSize: 11, fontWeight: "600", marginTop: 5 },
  editButton: { borderRadius: 12, overflow: "hidden" },
  editGradient: { alignItems: "center", justifyContent: "center", minHeight: 46 },
  editText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  signOutButton: { alignItems: "center", backgroundColor: Colors.surface, borderColor: "#ECEBEC", borderRadius: 12, borderWidth: 1, justifyContent: "center", minHeight: 45 },
  signOutText: { color: Colors.cardTextPrimary, fontSize: 15, fontWeight: "700" },
  buttonDisabled: { opacity: 0.7 },
  error: { color: Colors.error, fontSize: 14, textAlign: "center" },
});
