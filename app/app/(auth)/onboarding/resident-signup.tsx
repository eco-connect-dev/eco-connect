import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AuthButton } from "@/components/ui/AuthButton";
import { AuthTextField } from "@/components/ui/AuthTextField";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";

export default function ResidentSignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    setSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data.session) {
      // @ts-ignore
      router.replace("/(tabs)");
      return;
    }

    setSuccessMessage(
      "Registration successful. Check your email to verify your account.",
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <View style={styles.blobTop} pointerEvents="none" />
      <View style={styles.blobBottom} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header — smaller than login since this is a secondary screen */}
        <View style={styles.headerWrap}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>Join EcoConnect</Text>
          <Text style={styles.subtitle}>
            Create a resident account to request pickups, track trucks, and stay
            in the loop with your council.
          </Text>
        </View>

        {/* Signup card */}
        <View style={styles.card}>
          <View style={styles.cardAccentBar} />

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full name</Text>
              <AuthTextField
                icon="person-outline"
                placeholder="Jane Doe"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <AuthTextField
                icon="mail-outline"
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <AuthTextField
                icon="lock-closed-outline"
                placeholder="Minimum 6 characters"
                autoCapitalize="none"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {errorMessage ? (
              <Text style={styles.error}>{errorMessage}</Text>
            ) : null}
            {successMessage ? (
              <Text style={styles.success}>{successMessage}</Text>
            ) : null}

            <AuthButton
              label="Register"
              icon="arrow-forward"
              loading={submitting}
              onPress={handleRegister}
              style={{ marginTop: 4 }}
            />
          </View>
        </View>

        <Link href="../login" style={styles.link}>
          Already have an account? Login
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  blobTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 9999,
    backgroundColor: Colors.blobGreen,
  },
  blobBottom: {
    position: "absolute",
    bottom: -100,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 9999,
    backgroundColor: Colors.blobCoral,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: "center",
  },
  headerWrap: {
    alignItems: "center",
    maxWidth: 320,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  title: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  card: {
    width: "100%",
    marginTop: 28,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#37474F",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardAccentBar: {
    height: 4,
    backgroundColor: Colors.forestGreen,
  },
  form: {
    padding: 24,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  error: {
    color: Colors.error,
    fontSize: 13,
  },
  success: {
    color: Colors.forestGreen,
    fontSize: 13,
  },
  link: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.forestGreen,
  },
});
