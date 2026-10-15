import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";

type SlideToConfirmProps = {
  onConfirm: () => void;
  disabled?: boolean;
};

const KNOB_SIZE = 54;

export function SlideToConfirm({ onConfirm, disabled = false }: SlideToConfirmProps) {
  const offset = useMemo(() => new Animated.Value(0), []);
  const [width, setWidth] = useState(320);
  const range = Math.max(width - KNOB_SIZE - 12, 0);
  const fillWidth = offset.interpolate({
    inputRange: [0, Math.max(range, 1)],
    outputRange: [0, width],
    extrapolate: "clamp",
  });
  const responder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_event, gesture) => !disabled && gesture.dx > 3,
      onPanResponderMove: (_event, gesture) => {
        offset.setValue(Math.max(0, Math.min(gesture.dx, range)));
      },
      onPanResponderRelease: (_event, gesture) => {
        if (gesture.dx >= range * 0.82) {
          Animated.timing(offset, { toValue: range, duration: 90, useNativeDriver: false }).start(() => onConfirm());
        } else {
          Animated.spring(offset, { toValue: 0, useNativeDriver: false }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(offset, { toValue: 0, useNativeDriver: false }).start();
      },
    }),
    [disabled, offset, onConfirm, range],
  );

  return (
    <View
      accessibilityLabel="Slide to confirm collection"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onAccessibilityTap={() => { if (!disabled) onConfirm(); }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.track, disabled && styles.disabled]}
      {...responder.panHandlers}
    >
      <Animated.View pointerEvents="none" style={[styles.progressFill, { width: fillWidth }]} />
      <Text style={styles.label}>{disabled ? "Confirming collection…" : "Slide to confirm collection"}</Text>
      <Animated.View style={[styles.knob, { transform: [{ translateX: offset }] }]}>
        <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
        <Ionicons name="chevron-forward" size={28} color="#FFFFFF" style={styles.secondChevron} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignItems: "center",
    backgroundColor: "#DDE9FF",
    borderRadius: 32,
    height: 60,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  label: { color: "#485D57", fontSize: 15, fontWeight: "700", paddingHorizontal: 64 },
  progressFill: { backgroundColor: "#B9F0D2", borderRadius: 32, bottom: 0, left: 0, position: "absolute", top: 0 },
  knob: {
    alignItems: "center",
    backgroundColor: "#007B55",
    borderColor: "#FFFFFF",
    borderRadius: KNOB_SIZE / 2,
    borderWidth: 3,
    height: KNOB_SIZE,
    justifyContent: "center",
    left: 3,
    position: "absolute",
    top: 3,
    width: KNOB_SIZE,
  },
  secondChevron: { marginLeft: -19, marginTop: -28 },
  disabled: { opacity: 0.6 },
});
