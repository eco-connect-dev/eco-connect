import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

import { Colors } from "@/constants/Colors";

type AuthTextFieldProps = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
};

export function AuthTextField({
  icon,
  style,
  ...inputProps
}: AuthTextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Ionicons
        name={icon}
        size={18}
        color={Colors.textMuted}
        style={styles.icon}
      />
      <TextInput
        placeholderTextColor={Colors.textMuted}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
});
