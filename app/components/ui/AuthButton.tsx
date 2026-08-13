import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Pressable,
    PressableProps,
    StyleSheet,
    Text,
} from "react-native";

import { Colors } from "@/constants/Colors";

type AuthButtonProps = PressableProps & {
    label: string;
    variant?: "primary" | "secondary";
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: "left" | "right";
    loading?: boolean;
    tintColor?: string; // overrides secondary label/icon color
};

export function AuthButton({
                               label,
                               variant = "primary",
                               icon,
                               iconPosition = "right",
                               loading,
                               tintColor,
                               disabled,
                               style,
                               ...pressableProps
                           }: AuthButtonProps) {
    const isPrimary = variant === "primary";
    const textColor = isPrimary ? "#fff" : tintColor ?? Colors.textSecondary;

    return (
        <Pressable
            disabled={disabled || loading}
            style={({ pressed }) => [
                isPrimary ? styles.primary : styles.secondary,
                (disabled || loading) && styles.disabled,
                pressed && styles.pressed,
                style as any,
            ]}
            {...pressableProps}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <>
                    {icon && iconPosition === "left" && (
                        <Ionicons name={icon} size={16} color={textColor} style={styles.iconLeft} />
                    )}
                    <Text style={[styles.label, { color: textColor }]}>{label}</Text>
                    {icon && iconPosition === "right" && (
                        <Ionicons name={icon} size={16} color={textColor} style={styles.iconRight} />
                    )}
                </>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    primary: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.forestGreen,
        borderRadius: 9999,
        paddingVertical: 14,
        shadowColor: Colors.forestGreen,
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    secondary: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.background,
        borderRadius: 8,
        paddingVertical: 12,
    },
    disabled: { opacity: 0.6 },
    pressed: { opacity: 0.85 },
    label: {
        fontSize: 15,
        fontWeight: "600",
    },
    iconLeft: { marginRight: 8 },
    iconRight: { marginLeft: 8 },
});