import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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

    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Login with your Supabase account.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="you@example.com"
          style={styles.input}
          value={email}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Pressable
          disabled={submitting}
          onPress={handleLogin}
          style={[styles.button, submitting && styles.buttonDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>

        <Link href="./onboarding/resident-signup" style={styles.link}>
          Create an account
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f8f6",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1b2a1d",
  },
  subtitle: {
    fontSize: 14,
    color: "#5f6e61",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e3f30",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d5ded6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 8,
    backgroundColor: "#0d631b",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#b00020",
    marginTop: 4,
  },
  link: {
    marginTop: 6,
    color: "#0d631b",
    fontWeight: "600",
  },
});
