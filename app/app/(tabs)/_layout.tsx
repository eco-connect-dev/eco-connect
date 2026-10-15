import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";

import { Colors } from "@/constants/Colors";
import { AppRole, readUserRole } from "@/lib/userRole";
import { supabase } from "@/lib/supabase";

const NAV_EXTRA_PADDING = 12;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let active = true;
    const loadRole = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (active) setRole(null);
        return;
      }
      try {
        const nextRole = await readUserRole(data.session.user.id);
        if (active) setRole(nextRole);
      } catch {
        if (active) setRole("user");
      }
    };
    void loadRole();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => void loadRole(), 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: Colors.navActiveText,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            height: 64 + insets.bottom + NAV_EXTRA_PADDING,
            paddingTop: 12,
            paddingBottom: insets.bottom + NAV_EXTRA_PADDING - 4,
            backgroundColor: Colors.homeBackground,
            borderTopWidth: 0,
            shadowColor: "#121417",
            shadowOpacity: 0.04,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: -1 },
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="request"
          options={{
            title: "Request",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "add-circle" : "add-circle-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: "Community",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="track"
          options={{
            title: "Track",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "map" : "map-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: role === "council" || role === "admin" || role === "driver" ? null : undefined,
            title: "Profile",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="council-dashboard"
          options={
            role === "council"
              ? {
                  title: "Council Dashboard",
                  tabBarIcon: ({ focused, color }) => (
                    <Ionicons
                      name={focused ? "grid" : "grid-outline"}
                      size={22}
                      color={color}
                    />
                  ),
                }
              : { href: null }
          }
        />
        <Tabs.Screen
          name="admin-dashboard"
          options={
            role === "admin"
              ? {
                  title: "Admin Dashboard",
                  tabBarIcon: ({ focused, color }) => (
                    <Ionicons
                      name={focused ? "grid" : "grid-outline"}
                      size={22}
                      color={color}
                    />
                  ),
                }
              : { href: null }
          }
        />
        <Tabs.Screen
          name="driver-dashboard"
          options={
            role === "driver"
              ? {
                  title: "Driver Dashboard",
                  tabBarIcon: ({ focused, color }) => (
                    <Ionicons
                      name={focused ? "navigate" : "navigate-outline"}
                      size={22}
                      color={color}
                    />
                  ),
                }
              : { href: null }
          }
        />
        <Tabs.Screen name="more" options={{ href: null }} />
      </Tabs>
  );
}
