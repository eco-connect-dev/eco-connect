import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen
        name="onboarding/resident-signup"
        options={{ title: "Register" }}
      />
      <Stack.Screen
        name="onboarding/staff-login"
        options={{ title: "Staff login" }}
      />
      <Stack.Screen name="onboarding/verify" options={{ title: "Verify" }} />
    </Stack>
  );
}