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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      style={styles.screen}
    >
      {/* Decorative background blobs, mirrors Figma */}
      <View style={styles.blobTop} pointerEvents="none" />
      <View style={styles.blobBottom} pointerEvents="none" />
      <Image
        accessible={false}
        pointerEvents="none"
        source={require("@/assets/images/login-illustration.png")}
        style={styles.pageWatermark}
        contentFit="cover"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & header */}
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>EcoConnect</Text>
          <Text style={styles.tagline}>Cleaner City, Together</Text>
        </View>

        {/* Login card */}
        <View style={styles.card}>
          <View style={styles.cardAccentBar} />

          <View style={styles.form}>
            <AuthTextField
              icon="mail-outline"
              placeholder="Email or Phone Number"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <AuthTextField
              icon="lock-closed-outline"
              placeholder="Password"
              autoCapitalize="none"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {errorMessage ? (
              <Text style={styles.error}>{errorMessage}</Text>
            ) : null}

            <AuthButton
              label="Login"
              icon="arrow-forward"
              loading={submitting}
              onPress={handleLogin}
            />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.altActions}>
            <Link href="./onboarding/resident-signup" asChild>
              <AuthButton
                label="Join as Resident"
                icon="people-outline"
                iconPosition="left"
                variant="secondary"
                tintColor={Colors.forestGreen}
              />
            </Link>
          </View>
        </View>
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
  pageWatermark: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  logoWrap: {
    alignItems: "center",
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 20,
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: Colors.textPrimary,
  },
  tagline: {
    marginTop: 4,
    fontSize: 18,
    color: Colors.textSecondary,
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 440,
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.94)",
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
    gap: 12,
  },
  error: {
    color: Colors.error,
    fontSize: 13,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    color: Colors.textSecondary,
  },
  altActions: {
    padding: 24,
    paddingTop: 16,
  },
});
