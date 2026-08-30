import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Colors } from "@/constants/Colors";

const NAV_EXTRA_PADDING = 12;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

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
    </Tabs>
  );
}
