import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { createProfile, readProfile, updateProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";

type ProfileForm = {
  full_name: string;
  phone: string;
  address_line: string;
  neighborhood: string;
};

const EMPTY_FORM: ProfileForm = {
  full_name: "",
  phone: "",
  address_line: "",
  neighborhood: "",
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [originalForm, setOriginalForm] = useState(EMPTY_FORM);
  const [hasProfile, setHasProfile] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!data.user) {
          router.replace("/(auth)/login");
          return;
        }

        const profile = await readProfile(data.user.id);
        if (!mounted) return;

        const initialForm = profile
          ? {
              full_name: profile.full_name,
              phone: profile.phone,
              address_line: profile.address_line,
              neighborhood: profile.neighborhood,
            }
          : {
              ...EMPTY_FORM,
              full_name: String(data.user.user_metadata?.full_name ?? ""),
            };

        setUserId(data.user.id);
        setEmail(data.user.email ?? "");
        setForm(initialForm);
        setOriginalForm(initialForm);
        setHasProfile(Boolean(profile));
        setEditing(!profile);
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load your profile.",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  function setField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function saveProfile() {
    const profile = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      address_line: form.address_line.trim(),
      neighborhood: form.neighborhood.trim(),
    };

    if (!Object.values(profile).every(Boolean)) {
      setErrorMessage("Please complete all required fields.");
      return;
    }
    if (
      !/^[+()\d\s.-]{7,20}$/.test(profile.phone) ||
      profile.phone.replace(/\D/g, "").length < 7
    ) {
      setErrorMessage("Enter a valid phone number.");
      return;
    }
    if (
      profile.address_line.length < 5 ||
      !/[\p{L}\d]/u.test(profile.address_line)
    ) {
      setErrorMessage("Enter a valid street address.");
      return;
    }
    if (
      profile.neighborhood.length < 2 ||
      !/[\p{L}]/u.test(profile.neighborhood)
    ) {
      setErrorMessage("Enter a valid neighborhood or area.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (hasProfile) await updateProfile(userId, profile);
      else await createProfile(userId, profile);
      setForm(profile);
      setOriginalForm(profile);
      setHasProfile(true);
      setEditing(false);
      setSuccessMessage("Your profile has been saved.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't save your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    setSigningOut(true);
    setErrorMessage("");
    const { error } = await supabase.auth.signOut();
    setSigningOut(false);
    if (error) setErrorMessage(error.message);
    else router.replace("/");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/(tabs)/home")
          }
          style={styles.iconButton}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={Colors.cardTextSecondary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>My Profile</Text>
        {hasProfile && !editing ? (
          <Pressable
            accessibilityLabel="Edit profile"
            onPress={() => {
              setErrorMessage("");
              setSuccessMessage("");
              setEditing(true);
            }}
            style={styles.iconButton}
          >
            <Ionicons
              name="pencil-outline"
              size={18}
              color={Colors.cardTextSecondary}
            />
          </Pressable>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.forestGreen} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={30} color={Colors.forestGreen} />
            </View>
            <Text style={styles.title}>
              {hasProfile ? "Your details" : "Create your profile"}
            </Text>
            <Text style={styles.subtitle}>
              Your address helps connect reports and pickups to the right
              neighborhood.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
            <ProfileField
              label="Full name"
              icon="person-outline"
              value={form.full_name}
              editable={editing}
              placeholder="Your full name"
              onChangeText={(value) => setField("full_name", value)}
            />
            <ProfileField
              label="Email address"
              icon="mail-outline"
              value={email}
              editable={false}
            />
            <ProfileField
              label="Phone number"
              icon="call-outline"
              value={form.phone}
              editable={editing}
              placeholder="e.g. +94 77 123 4567"
              keyboardType="phone-pad"
              onChangeText={(value) => setField("phone", value)}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>SERVICE LOCATION</Text>
            <ProfileField
              label="Street address"
              icon="location-outline"
              value={form.address_line}
              editable={editing}
              placeholder="House number and street"
              onChangeText={(value) => setField("address_line", value)}
            />
            <ProfileField
              label="Neighborhood / area"
              icon="map-outline"
              value={form.neighborhood}
              editable={editing}
              placeholder="e.g. Borella"
              onChangeText={(value) => setField("neighborhood", value)}
            />
            <Text style={styles.helper}>
              Neighborhood is saved separately for reporting and pickup queries.
            </Text>
          </View>

          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {errorMessage}
            </Text>
          ) : null}
          {successMessage ? (
            <Text accessibilityRole="alert" style={styles.success}>
              {successMessage}
            </Text>
          ) : null}

          {editing ? (
            <>
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={() => void saveProfile()}
                style={[styles.primaryButton, saving && styles.disabled]}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryText}>
                    {hasProfile ? "Save changes" : "Save profile"}
                  </Text>
                )}
              </Pressable>
              {hasProfile ? (
                <Pressable
                  onPress={() => {
                    setForm(originalForm);
                    setEditing(false);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              ) : null}
            </>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={signingOut}
            onPress={() => void signOut()}
            style={styles.signOutButton}
          >
            {signingOut ? (
              <ActivityIndicator color={Colors.cardTextSecondary} />
            ) : (
              <Text style={styles.signOutText}>Sign Out</Text>
            )}
          </Pressable>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

function ProfileField({
  label,
  icon,
  value,
  editable,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  icon:
    | "person-outline"
    | "mail-outline"
    | "call-outline"
    | "location-outline"
    | "map-outline";
  value: string;
  editable: boolean;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  keyboardType?: "phone-pad";
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon} size={17} color={Colors.forestGreen} />
      </View>
      <View style={styles.fieldBody}>
        <Text style={styles.label}>{label}</Text>
        {editable ? (
          <TextInput
            autoCapitalize={icon === "mail-outline" ? "none" : "words"}
            autoCorrect={false}
            keyboardType={keyboardType}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9A9BA0"
            style={styles.input}
            value={value}
          />
        ) : (
          <Text style={styles.value}>{value || "—"}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.homeBackground },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    color: Colors.cardTextSecondary,
    fontSize: 22,
    fontWeight: "700",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "#ECEBEC",
  },
  loader: { flex: 1, justifyContent: "center" },
  content: { padding: 20, paddingBottom: 30, gap: 16 },
  intro: { alignItems: "center", paddingVertical: 10 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EAFBF3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontSize: 21, fontWeight: "700", color: Colors.cardTextSecondary },
  subtitle: {
    marginTop: 5,
    maxWidth: 310,
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: "#F0EFF0",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    color: Colors.cardTextSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 9,
  },
  field: {
    minHeight: 63,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EAE9EA",
    paddingVertical: 9,
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F0F0F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  fieldBody: { flex: 1 },
  label: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 3,
  },
  value: { color: Colors.cardTextSecondary, fontSize: 14, fontWeight: "700" },
  input: {
    color: Colors.cardTextSecondary,
    fontSize: 14,
    fontWeight: "600",
    padding: 0,
    minHeight: 22,
  },
  helper: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: Colors.forestGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  disabled: { opacity: 0.7 },
  cancelButton: {
    minHeight: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: { color: Colors.textSecondary, fontWeight: "600" },
  signOutButton: {
    minHeight: 45,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "#ECEBEC",
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: {
    color: Colors.cardTextSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
  error: { color: Colors.error, fontSize: 13, textAlign: "center" },
  success: {
    color: Colors.forestGreen,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
});
