import { fireEvent, render, waitFor } from "@testing-library/react-native";

import ProfileScreen from "@/app/(tabs)/profile";
import { supabase } from "@/lib/supabase";
import { createProfile, readProfile, updateProfile } from "@/lib/profile";

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn();
const mockGetUser = supabase.auth.getUser as jest.Mock;
const mockSignOut = supabase.auth.signOut as jest.Mock;
const mockReadProfile = readProfile as jest.Mock;
const mockCreateProfile = createProfile as jest.Mock;
const mockUpdateProfile = updateProfile as jest.Mock;

jest.mock("expo-router", () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    canGoBack: () => mockCanGoBack(),
    replace: (...args: unknown[]) => mockReplace(...args),
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

jest.mock("@/lib/profile", () => ({
  createProfile: jest.fn(),
  readProfile: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

const existingProfile = {
  id: "resident-123",
  full_name: "Nimal Perera",
  phone: "+94 77 123 4567",
  address_line: "12 Lake Road",
  neighborhood: "Borella",
  created_at: "2026-10-01T00:00:00.000Z",
  updated_at: "2026-10-01T00:00:00.000Z",
};

describe("ProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanGoBack.mockReturnValue(false);
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "resident-123",
          email: "nimal@example.com",
          user_metadata: { full_name: "Nimal Perera" },
        },
      },
      error: null,
    });
    mockReadProfile.mockResolvedValue(existingProfile);
    mockSignOut.mockResolvedValue({ error: null });
  });

  it("loads and displays the resident profile", async () => {
    const { findByText, getByText } = await render(<ProfileScreen />);

    expect(await findByText("Your details")).toBeTruthy();
    expect(getByText("Nimal Perera")).toBeTruthy();
    expect(getByText("nimal@example.com")).toBeTruthy();
    expect(getByText("+94 77 123 4567")).toBeTruthy();
    expect(getByText("12 Lake Road")).toBeTruthy();
    expect(getByText("Borella")).toBeTruthy();
  });

  it("validates required fields before creating a new profile", async () => {
    mockReadProfile.mockResolvedValue(null);
    const { findByText, getByText } = await render(<ProfileScreen />);

    expect(await findByText("Create your profile")).toBeTruthy();
    await fireEvent.press(getByText("Save profile"));

    expect(getByText("Please complete all required fields.")).toBeTruthy();
    expect(mockCreateProfile).not.toHaveBeenCalled();
  });

  it("creates a profile with trimmed values and exits edit mode", async () => {
    mockReadProfile.mockResolvedValue(null);
    mockCreateProfile.mockImplementation(
      async (_userId: string, profile: typeof existingProfile) => ({
        ...existingProfile,
        ...profile,
      }),
    );
    const { findByText, getByPlaceholderText, getByText } = await render(
      <ProfileScreen />,
    );

    await findByText("Create your profile");
    await fireEvent.changeText(getByPlaceholderText("Your full name"), "  Nimal Perera  ");
    await fireEvent.changeText(
      getByPlaceholderText("e.g. +94 77 123 4567"),
      " +94 77 123 4567 ",
    );
    await fireEvent.changeText(
      getByPlaceholderText("House number and street"),
      " 12 Lake Road ",
    );
    await fireEvent.changeText(getByPlaceholderText("e.g. Borella"), " Borella ");
    await fireEvent.press(getByText("Save profile"));

    await waitFor(() => {
      expect(mockCreateProfile).toHaveBeenCalledWith("resident-123", {
        full_name: "Nimal Perera",
        phone: "+94 77 123 4567",
        address_line: "12 Lake Road",
        neighborhood: "Borella",
      });
      expect(getByText("Your profile has been saved.")).toBeTruthy();
      expect(getByText("Edit")).toBeTruthy();
    });
  });

  it("updates an existing profile and can cancel unsaved edits", async () => {
    mockUpdateProfile.mockResolvedValue(existingProfile);
    const { findByText, getByText } = await render(<ProfileScreen />);

    await findByText("Your details");
    await fireEvent.press(getByText("Edit"));
    await fireEvent.press(getByText("Cancel"));
    expect(getByText("Edit")).toBeTruthy();

    await fireEvent.press(getByText("Edit"));
    await fireEvent.press(getByText("Save changes"));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith("resident-123", {
        full_name: "Nimal Perera",
        phone: "+94 77 123 4567",
        address_line: "12 Lake Road",
        neighborhood: "Borella",
      });
      expect(getByText("Your profile has been saved.")).toBeTruthy();
    });
  });

  it("redirects to login when there is no authenticated user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    await render(<ProfileScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
    });
    expect(mockReadProfile).not.toHaveBeenCalled();
  });

  it("signs out and returns to the app entry screen", async () => {
    const { findByText, getByText } = await render(<ProfileScreen />);

    await findByText("Your details");
    await fireEvent.press(getByText("Sign Out"));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });
});
