import { fireEvent, render, waitFor } from "@testing-library/react-native";

import RequestScreen from "@/app/(tabs)/request";
import { supabase } from "@/lib/supabase";

const mockReplace = jest.fn();
const mockGetUser = supabase.auth.getUser as jest.Mock;
const mockInsert = jest.fn();

jest.mock("expo-router", () => ({ router: { replace: (...args: unknown[]) => mockReplace(...args) } }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock("expo-image", () => ({ Image: () => null }));
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  reverseGeocodeAsync: jest.fn().mockResolvedValue([{ formattedAddress: "12 Lake Road, Colombo" }]),
}));
jest.mock("@/components/MapSelector", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/LocationPickerModal", () => ({
  DEFAULT_MAP_COORDINATE: { latitude: 6.9271, longitude: 79.8612 },
  LocationPickerModal: ({ visible, onSelect }: { visible: boolean; onSelect: (value: object) => void }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react") as typeof import("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text } = require("react-native") as typeof import("react-native");
    return visible ? React.createElement(
      Pressable,
      {
        accessibilityRole: "button",
        accessibilityLabel: "Use test address",
        onPress: () => onSelect({ latitude: 6.9, longitude: 79.8, address: "12 Lake Road, Colombo" }),
      },
      React.createElement(Text, null, "Use test address"),
    ) : null;
  },
}));
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn(() => ({ insert: mockInsert })),
  },
}));

describe("RequestScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "resident-123" } }, error: null });
    mockInsert.mockResolvedValue({ error: null });
  });

  it("renders the current map-first pickup request form", async () => {
    const { getByText, getByPlaceholderText, getByLabelText } = await render(<RequestScreen />);

    expect(getByText("Resident Request")).toBeTruthy();
    expect(getByText("Pickup Location")).toBeTruthy();
    expect(getByText("Tap the map to select a pickup address")).toBeTruthy();
    expect(getByText("Select Waste Type")).toBeTruthy();
    expect(getByText("General")).toBeTruthy();
    expect(getByText("Recyclable")).toBeTruthy();
    expect(getByText("Hazardous")).toBeTruthy();
    expect(getByLabelText("Upload a photo")).toBeTruthy();
    expect(getByPlaceholderText("E.g., Gate code is 1234. Items are by the side door.")).toBeTruthy();
    expect(getByText("Submit Request")).toBeTruthy();
  });

  it("saves the selected category, map address and trimmed notes then redirects home", async () => {
    const { getByLabelText, getByPlaceholderText, getByText } = await render(<RequestScreen />);

    await fireEvent.press(getByLabelText("Edit pickup location"));
    await fireEvent.press(getByLabelText("Use test address"));
    await fireEvent.press(getByText("Recyclable"));
    await fireEvent.changeText(
      getByPlaceholderText("E.g., Gate code is 1234. Items are by the side door."),
      "  Leave bags by the side gate.  ",
    );
    await fireEvent.press(getByText("Submit Request"));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("pickup_requests");
      expect(mockInsert).toHaveBeenCalledWith({
        resident_id: "resident-123",
        category: "Recyclable",
        status: "pending",
        location: "12 Lake Road, Colombo",
        notes: "Leave bags by the side gate.",
        image_url: null,
      });
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
      expect(getByPlaceholderText("E.g., Gate code is 1234. Items are by the side door.").props.value).toBe("");
      expect(getByText("General")).toBeTruthy();
    });
  });

  it("requires a pickup address before submitting", async () => {
    const { getByText, findByText } = await render(<RequestScreen />);
    await fireEvent.press(getByText("Submit Request"));

    expect(await findByText("Choose a pickup address from the map before submitting.")).toBeTruthy();
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("redirects to login when there is no signed-in user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { getByLabelText, getByText } = await render(<RequestScreen />);
    await fireEvent.press(getByLabelText("Edit pickup location"));
    await fireEvent.press(getByLabelText("Use test address"));
    await fireEvent.press(getByText("Submit Request"));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(auth)/login"));
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("shows a database submission error", async () => {
    mockInsert.mockResolvedValue({ error: new Error("Request could not be saved") });
    const { getByLabelText, getByText, findByText } = await render(<RequestScreen />);
    await fireEvent.press(getByLabelText("Edit pickup location"));
    await fireEvent.press(getByLabelText("Use test address"));
    await fireEvent.press(getByText("Submit Request"));

    expect(await findByText(/Request could not be saved/)).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
