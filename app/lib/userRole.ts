import { supabase } from "@/lib/supabase";

export type AppRole = "user" | "council" | "admin";

export function dashboardForRole(role: AppRole) {
  switch (role) {
    case "council":
      return "/(tabs)/council-dashboard" as const;
    case "admin":
      return "/(tabs)/admin-dashboard" as const;
    default:
      return "/(tabs)/home" as const;
  }
}

export async function readUserRole(userId: string): Promise<AppRole> {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data?.role === "council" || data?.role === "admin") return data.role;
  return "user";
}
