import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";

interface TabSwitcherProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function TabSwitcher({ tabs, activeTab, onChange }: TabSwitcherProps) {
  return (
    <View style={styles.track}>
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <Pressable
            key={tab}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: Colors.councilTabInactiveBg,
    borderRadius: 8,
    padding: 4,
    width: "100%",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.councilBorder,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.councilTextSecondary,
  },
  tabTextActive: {
    fontWeight: "700",
    color: Colors.councilTextPrimary,
  },
});
