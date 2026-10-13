import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import RequestScreen from "@/app/(tabs)/request";
import { supabase } from "@/lib/supabase";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockGetUser = supabase.auth.getUser as jest.Mock;
const mockInsert = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("expo-image", () => ({ Image: () => null }));

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn(() => ({ insert: mockInsert })),
  },
}));

describe("RequestScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    mockInsert.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the pickup request form with its default location and waste type", async () => {
    const { getByText, getByPlaceholderText } = await render(<RequestScreen />);

    expect(getByText("Resident Request")).toBeTruthy();
    expect(getByText("Pickup Location")).toBeTruthy();
    expect(getByText("31/2, Seevali Mawatha, Malabe")).toBeTruthy();
    expect(getByText("Select Waste Type")).toBeTruthy();
    expect(getByText("General")).toBeTruthy();
    expect(getByText("Recyclable")).toBeTruthy();
    expect(getByText("Hazardous")).toBeTruthy();
    expect(getByPlaceholderText("E.g., Gate code is 1234. Items are by the side door.")).toBeTruthy();
    expect(getByText("Submit Request")).toBeTruthy();
  });

  it("submits the selected waste type, trimmed notes, and pickup location", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "resident-123" } }, error: null });
    const { getByLabelText, getByPlaceholderText, getByText } = await render(
      <RequestScreen />,
    );

    await fireEvent.press(getByText("Recyclable"));
    await fireEvent.changeText(
      getByPlaceholderText("E.g., Gate code is 1234. Items are by the side door."),
      "  Leave bags by the side gate.  ",
    );
    await fireEvent.press(getByLabelText("Edit pickup location"));
    await fireEvent.changeText(
      getByPlaceholderText("Enter a custom address"),
      "  10 Green Road, Malabe  ",
    );
    await fireEvent.press(getByText("Use this location"));
    await fireEvent.press(getByText("Submit Request"));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("pickup_requests");
      expect(mockInsert).toHaveBeenCalledWith({
        resident_id: "resident-123",
        category: "Recyclable",
        status: "pending",
        location: "10 Green Road, Malabe",
        notes: "Leave bags by the side gate.",
      });
      expect(Alert.alert).toHaveBeenCalledWith(
        "Request submitted",
        "Recyclable pickup requested for 10 Green Road, Malabe.",
        expect.arrayContaining([
          expect.objectContaining({ text: "Track request" }),
        ]),
      );
    });

    const alertActions = (Alert.alert as jest.Mock).mock.calls[0][2];
    alertActions[1].onPress();
    expect(mockPush).toHaveBeenCalledWith("/(tabs)/track");
  });

  it("redirects to login when there is no signed-in resident", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { getByText } = await render(<RequestScreen />);

    await fireEvent.press(getByText("Submit Request"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  it("shows a submission error returned by Supabase", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "resident-123" } }, error: null });
    mockInsert.mockResolvedValue({ error: new Error("Request could not be saved") });
    const { getByText, findByText } = await render(<RequestScreen />);

    await fireEvent.press(getByText("Submit Request"));

    expect(await findByText("Request could not be saved")).toBeTruthy();
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
