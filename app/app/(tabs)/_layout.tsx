import { router, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/Colors";

const NAV_EXTRA_PADDING = 12;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [dashboardMenuVisible, setDashboardMenuVisible] = useState(false);

  return (
    <>
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
        <Tabs.Screen name="admin-dashboard" options={{ href: null }} />
        <Tabs.Screen name="council-dashboard" options={{ href: null }} />
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarButton: () => (
              <Pressable
                accessibilityLabel="More dashboard options"
                accessibilityRole="button"
                onPress={() => setDashboardMenuVisible(true)}
                style={styles.moreButton}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={22}
                  color={Colors.textSecondary}
                />
                <Text style={styles.moreLabel}>More</Text>
              </Pressable>
            ),
          }}
        />
      </Tabs>

      <Modal
        animationType="fade"
        onRequestClose={() => setDashboardMenuVisible(false)}
        transparent
        visible={dashboardMenuVisible}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Close dashboard options"
            onPress={() => setDashboardMenuVisible(false)}
            style={styles.modalBackdrop}
          />
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Choose a dashboard</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setDashboardMenuVisible(false);
                router.push("/(tabs)/admin-dashboard");
              }}
              style={styles.menuOption}
            >
              <Text style={styles.menuOptionText}>Admin Dashboard</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setDashboardMenuVisible(false);
                router.push("/(tabs)/council-dashboard");
              }}
              style={styles.menuOption}
            >
              <Text style={styles.menuOptionText}>Council Dashboard</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  moreButton: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    gap: 3,
  },
  moreLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  menu: {
    backgroundColor: Colors.homeBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 8,
    padding: 20,
    paddingBottom: 32,
  },
  menuTitle: {
    color: Colors.cardTextPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  menuOption: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuOptionText: {
    color: Colors.cardTextPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
});
