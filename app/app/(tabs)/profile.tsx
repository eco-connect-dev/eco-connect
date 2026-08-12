import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const [signingOut, setSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignOut = async () => {
    setSigningOut(true);
    setErrorMessage("");
    const { error } = await supabase.auth.signOut();
    setSigningOut(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.text}>Manage your account session.</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Pressable
        disabled={signingOut}
        onPress={handleSignOut}
        style={[styles.button, signingOut && styles.buttonDisabled]}
      >
        {signingOut ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign out</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1b2a1d",
  },
  text: {
    fontSize: 15,
    color: "#566258",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#0d631b",
    borderRadius: 8,
    minWidth: 140,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
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
    marginBottom: 12,
  },
});