import { Redirect } from "expo-router";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";
import { AppRole, dashboardForRole, readUserRole } from "@/lib/userRole";

export default function IndexScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [roleError, setRoleError] = useState(false);
  const [roleAttempt, setRoleAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }

      if (error) {
        setSession(null);
      } else {
        setSession(data.session);
      }

      setLoading(false);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (mounted) {
          setSession(nextSession);
        }
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setRole(null);
    setRoleError(false);
    if (!session) return;

    readUserRole(session.user.id)
      .then((nextRole) => {
        if (mounted) setRole(nextRole);
      })
      .catch(() => {
        if (mounted) setRoleError(true);
      });

    return () => {
      mounted = false;
    };
  }, [session, roleAttempt]);

  if (loading || (session && role === null && !roleError)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (session) {
    if (roleError) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            Could not load your account role. Check your connection and confirm
            the user account roles migration has been applied in Supabase.
          </Text>
          <Pressable onPress={() => setRoleAttempt((attempt) => attempt + 1)}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    if (role) return <Redirect href={dashboardForRole(role)} />;
  }

  return <Redirect href="./login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#333",
    marginHorizontal: 28,
    marginBottom: 16,
    textAlign: "center",
  },
  retryText: {
    color: "#176B45",
    fontWeight: "700",
  },
});
