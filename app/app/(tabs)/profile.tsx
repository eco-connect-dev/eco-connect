import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";

const HEADER_EXTRA_PADDING = 8;

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  memberSince: string;
  role: string;
  reportedIssues: number;
  pickupRequests: number;
  avatarUrl: string;
};

const USER_PROFILES: UserProfile[] = [
  {
    id: "resident-001",
    name: "Sarath Perera",
    email: "sarath.perera@gmail.com",
    phone: "+94 71 4467 990",
    location: "16, Flower Lane, Borella",
    memberSince: "Jan 2023",
    role: "RESIDENT",
    reportedIssues: 23,
    pickupRequests: 12,
    avatarUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=320&q=90",
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [signingOut, setSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState<UserProfile[]>(USER_PROFILES);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(USER_PROFILES[0]);
  const user = users[0];

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

  const handleEditProfile = () => {
    if (isEditing) {
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === draft.id ? draft : currentUser,
        ),
      );
      setIsEditing(false);
      return;
    }

    setDraft(user);
    setIsEditing(true);
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + HEADER_EXTRA_PADDING },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={handleBack}
            style={styles.headerButton}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={Colors.cardTextSecondary}
            />
          </Pressable>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Pressable
            accessibilityLabel={isEditing ? "Save profile" : "Edit profile"}
            hitSlop={8}
            onPress={handleEditProfile}
            style={styles.headerButton}
          >
            <Ionicons
              name={isEditing ? "checkmark" : "pencil-outline"}
              size={18}
              color={Colors.cardTextSecondary}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identityCard}>
          <View style={styles.avatarBorder}>
            <Image
              accessibilityLabel={user.name}
              contentFit="cover"
              source={user.avatarUrl}
              style={styles.avatar}
            />
          </View>
          {isEditing ? (
            <TextInput
              autoCapitalize="words"
              onChangeText={(name) =>
                setDraft((current) => ({ ...current, name }))
              }
              style={[styles.name, styles.nameInput]}
              value={draft.name}
            />
          ) : (
            <Text style={styles.name}>{user.name}</Text>
          )}
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>CONTACT DETAILS</Text>
          <ContactRow
            editable={isEditing}
            icon="mail-outline"
            keyboardType="email-address"
            label="Email Address"
            onChangeText={(email) =>
              setDraft((current) => ({ ...current, email }))
            }
            value={isEditing ? draft.email : user.email}
          />
          <View style={styles.divider} />
          <ContactRow
            editable={isEditing}
            icon="call-outline"
            label="Phone Number"
            keyboardType="phone-pad"
            onChangeText={(phone) =>
              setDraft((current) => ({ ...current, phone }))
            }
            value={isEditing ? draft.phone : user.phone}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>ACCOUNT INFO</Text>
          <InfoRow label="Member Since" value={user.memberSince} />
          <View style={styles.divider} />
          <InfoRow
            editable={isEditing}
            label="Location"
            location
            onChangeText={(location) =>
              setDraft((current) => ({ ...current, location }))
            }
            value={isEditing ? draft.location : user.location}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>ACTIVITY SUMMARY</Text>
          <View style={styles.activityRow}>
            <ActivityStat
              count={String(user.reportedIssues)}
              label="Reported Issues"
              style={styles.issueStat}
            />
            <ActivityStat
              count={String(user.pickupRequests)}
              label="Pickup Requests"
              style={styles.pickupStat}
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={signingOut}
          onPress={handleSignOut}
          style={[styles.signOutButton, signingOut && styles.buttonDisabled]}
        >
          {signingOut ? (
            <ActivityIndicator color={Colors.cardTextSecondary} />
          ) : (
            <Text style={styles.signOutText}>Sign Out</Text>
          )}
        </Pressable>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </ScrollView>
    </View>
  );
}

function ContactRow({
  editable,
  icon,
  keyboardType,
  label,
  onChangeText,
  value,
}: {
  editable: boolean;
  icon: "mail-outline" | "call-outline";
  keyboardType?: "email-address" | "phone-pad";
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.contactRow}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={15} color={Colors.forestGreen} />
      </View>
      <View style={styles.contactCopy}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {editable ? (
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={keyboardType}
            onChangeText={onChangeText}
            style={[styles.fieldValue, styles.inlineInput]}
            value={value}
          />
        ) : (
          <Text style={styles.fieldValue}>{value}</Text>
        )}
      </View>
    </View>
  );
}

function InfoRow({
  editable = false,
  label,
  location = false,
  onChangeText,
  value,
}: {
  editable?: boolean;
  label: string;
  location?: boolean;
  onChangeText?: (value: string) => void;
  value: string;
}) {
  const valueStyle = [styles.infoValue, location && styles.locationValue];
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editable ? (
        <TextInput
          autoCapitalize="words"
          onChangeText={onChangeText}
          style={[...valueStyle, styles.infoInput]}
          value={value}
        />
      ) : (
        <Text style={valueStyle}>{value}</Text>
      )}
    </View>
  );
}

function ActivityStat({
  count,
  label,
  style,
}: {
  count: string;
  label: string;
  style: object;
}) {
  return (
    <View style={[styles.activityStat, style]}>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.homeBackground },
  header: {
    backgroundColor: Colors.homeBackground,
    borderBottomColor: "#E7E7EC",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 41,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerButton: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: "#ECEBEC",
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  headerTitle: {
    color: Colors.cardTextSecondary,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  content: { gap: 21, padding: 20, paddingBottom: 20 },
  identityCard: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: "#F0EFF0",
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 185,
    paddingBottom: 18,
    paddingTop: 19,
  },
  avatarBorder: {
    borderColor: "#075819",
    borderRadius: 43,
    borderWidth: 2,
    height: 85,
    overflow: "hidden",
    width: 85,
  },
  avatar: { height: "100%", width: "100%" },
  name: {
    color: Colors.cardTextSecondary,
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginTop: 14,
  },
  nameInput: { minWidth: 180, padding: 0, textAlign: "center" },
  rolePill: {
    backgroundColor: "#F0F0F4",
    borderRadius: 13,
    marginTop: 5,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  roleText: { color: "#075819", fontSize: 12, fontWeight: "700" },
  card: {
    backgroundColor: Colors.surface,
    borderColor: "#F0EFF0",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardHeading: {
    color: Colors.cardTextSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 12,
  },
  contactRow: { alignItems: "center", flexDirection: "row" },
  iconBox: {
    alignItems: "center",
    backgroundColor: "#F0F0F4",
    borderColor: "#DEDEE4",
    borderRadius: 8,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  contactCopy: { flex: 1, marginLeft: 12 },
  fieldLabel: {
    color: Colors.cardTextSecondary,
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 2,
  },
  fieldValue: {
    color: Colors.cardTextSecondary,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.25,
  },
  inlineInput: { padding: 0 },
  divider: { backgroundColor: "#EAE9EA", height: 1, marginVertical: 12 },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    color: Colors.cardTextSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    color: Colors.cardTextSecondary,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },
  infoInput: { minWidth: 170, padding: 0 },
  locationValue: { fontSize: 13, maxWidth: "62%" },
  activityRow: { flexDirection: "row", gap: 10 },
  activityStat: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 13,
  },
  issueStat: { backgroundColor: "#F0F0F4", borderColor: "#DEDEE4" },
  pickupStat: { backgroundColor: "#EAFBF3", borderColor: "#D2EFE2" },
  statCount: {
    color: "#075819",
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 29,
  },
  statLabel: {
    color: Colors.cardTextSecondary,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 5,
  },
  signOutButton: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: "#ECEBEC",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 45,
  },
  signOutText: {
    color: Colors.cardTextSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
  buttonDisabled: { opacity: 0.7 },
  error: { color: Colors.error, fontSize: 14, textAlign: "center" },
});
