import { supabase } from "@/lib/supabase";

export type UserProfile = {
  id: string;
  full_name: string;
  phone: string;
  address_line: string;
  neighborhood: string;
  created_at: string;
  updated_at: string;
};

export type ProfileInput = Pick<
  UserProfile,
  "full_name" | "phone" | "address_line" | "neighborhood"
>;

const PROFILE_COLUMNS =
  "id, full_name, phone, address_line, neighborhood, created_at, updated_at";

export async function readProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as UserProfile | null;
}

export async function createProfile(userId: string, profile: ProfileInput) {
  const { data, error } = await supabase
    .from("users")
    .insert({ id: userId, ...profile })
    .select(PROFILE_COLUMNS)
    .single();
  if (error) throw error;
  return data as UserProfile;
}

export async function updateProfile(userId: string, profile: ProfileInput) {
  const { data, error } = await supabase
    .from("users")
    .update({ ...profile, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select(PROFILE_COLUMNS)
    .single();
  if (error) throw error;
  return data as UserProfile;
}
