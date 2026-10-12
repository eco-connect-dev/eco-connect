import { fireEvent, render, waitFor } from "@testing-library/react-native";

import TrackScreen from "@/app/(tabs)/track";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
  useFocusEffect: (callback: () => void) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react") as typeof import("react");
    React.useEffect(callback, [callback]);
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("expo-image", () => ({
  Image: () => null,
}));

jest.mock("@/lib/tracking", () => ({
  COLOMBO_TRACKING_REQUESTS: [
    {
      id: "demo-colombo-pickup-001",
      source: "pickup_requests",
      reporter_id: "demo-resident",
      category: "Recycling",
      status: "assigned",
      submitted_at: "2026-10-12T08:30:00+05:30",
      location: "42 Ward Place, Colombo 07, Sri Lanka",
      notes: "Recycling bags and flattened cardboard boxes.",
    },
  ],
  getRequestTitle: (request: { category: string; source: string }) =>
    request.source === "pickup_requests"
      ? `${request.category} pickup`
      : request.category,
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

describe("TrackScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Colombo live tracking UI with inline demo data", async () => {
    const { findByText, getByText } = await render(<TrackScreen />);

    expect(await findByText("Resident Tracking")).toBeTruthy();
    expect(getByText("Colombo, Sri Lanka")).toBeTruthy();
    expect(getByText("Crew is on the way")).toBeTruthy();
    expect(getByText("Crew assigned")).toBeTruthy();
    expect(getByText("42 Ward Place, Colombo 07, Sri Lanka")).toBeTruthy();
    expect(getByText("View request details")).toBeTruthy();
  });

  it("opens the selected demo request details", async () => {
    const { findByText } = await render(<TrackScreen />);

    await fireEvent.press(await findByText("View request details"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/tracking-detail",
        params: {
          id: "demo-colombo-pickup-001",
          source: "pickup_requests",
        },
      });
    });
  });

  it("shows the request category in the tracking sheet", async () => {
    const { findByText, getByText } = await render(<TrackScreen />);

    expect(await findByText("Recycling pickup")).toBeTruthy();
    expect(getByText("Waste pickup request")).toBeTruthy();
  });
});
