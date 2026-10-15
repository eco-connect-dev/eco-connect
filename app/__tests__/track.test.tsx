import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import TrackScreen from "@/app/(tabs)/track";
import { listMyRequests } from "@/lib/tracking";

const mockListMyRequests = listMyRequests as jest.Mock;

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useFocusEffect: (callback: () => void | (() => void)) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react") as typeof import("react");
    React.useEffect(callback, [callback]);
  },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock("expo-image", () => ({ Image: () => null }));
jest.mock("expo-location", () => ({ geocodeAsync: jest.fn().mockResolvedValue([{ latitude: 6.9, longitude: 79.8 }]) }));
jest.mock("@/components/MapSelector", () => ({ __esModule: true, default: () => null }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("@/lib/tracking", () => ({
  listMyRequests: jest.fn(),
  subscribeToCurrentResidentRequests: jest.fn().mockResolvedValue({ unsubscribe: jest.fn() }),
  subscribeToMyRequests: jest.fn(),
  removeRequestsSubscription: jest.fn().mockResolvedValue(undefined),
  getRequestTitle: (request: { category: string; source: string }) =>
    request.source === "pickup_requests" ? `${request.category} pickup` : request.category,
}));

const myRequests = [
  {
    id: "pickup-1", source: "pickup_requests", reporter_id: "resident-1", category: "Recycling",
    status: "assigned", submitted_at: "2026-10-12T08:30:00+05:30",
    location: "42 Ward Place, Colombo 07, Sri Lanka", notes: "Cardboard boxes", image_url: null,
  },
  {
    id: "dump-1", source: "dumping_reports", reporter_id: "resident-1", category: "Illegal dumping",
    status: "in_review", submitted_at: "2026-10-10T14:15:00+05:30",
    location: "Marine Drive, Colombo, Sri Lanka", notes: "Waste near the walkway", image_url: null,
  },
  {
    id: "pickup-resolved", source: "pickup_requests", reporter_id: "resident-1", category: "Bulk waste",
    status: "resolved", submitted_at: "2026-10-06T09:00:00+05:30",
    location: "Rajagiriya Junction, Sri Lanka", notes: null, image_url: null,
  },
];

describe("TrackScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListMyRequests.mockResolvedValue(myRequests);
  });

  it("loads the logged-in user's active submissions and status details", async () => {
    await render(<TrackScreen />);

    expect(await screen.findByText("Resident Tracking")).toBeTruthy();
    expect(screen.getByText("My submissions")).toBeTruthy();
    expect(screen.getByText("Crew is on the way")).toBeTruthy();
    expect(screen.getByText("Crew assigned")).toBeTruthy();
    expect(screen.getByText("42 Ward Place, Colombo 07, Sri Lanka")).toBeTruthy();
    expect(screen.getByText("Illegal dumping report")).toBeTruthy();
    expect(screen.queryByText("Bulk waste pickup")).toBeNull();
    expect(mockListMyRequests).toHaveBeenCalledTimes(1);
  });

  it("separates dumping reports from pickup requests", async () => {
    await render(<TrackScreen />);
    await screen.findByText("My submissions");

    await fireEvent.press(screen.getByText("Dump reports (1)"));
    expect(screen.getByText("Illegal dumping report")).toBeTruthy();
    expect(screen.queryByText("Waste pickup request")).toBeNull();

    await fireEvent.press(screen.getByText("Pickup (1)"));
    expect(screen.getByText("Waste pickup request")).toBeTruthy();
    expect(screen.queryByText("Illegal dumping report")).toBeNull();
  });

  it("shows the empty state when every submission is resolved", async () => {
    mockListMyRequests.mockResolvedValue([myRequests[2]]);
    await render(<TrackScreen />);

    expect(await screen.findByText("No active submissions")).toBeTruthy();
    expect(screen.getByText("Completed requests and reports are hidden from Track.")).toBeTruthy();
    expect(screen.queryByText("Bulk waste pickup")).toBeNull();
  });

  it("shows an empty state when the user has no submissions", async () => {
    mockListMyRequests.mockResolvedValue([]);
    await render(<TrackScreen />);

    expect(await screen.findByText("Nothing to track yet")).toBeTruthy();
    expect(screen.getByText(/Your pickup requests and reports will appear here/)).toBeTruthy();
  });

  it("displays loading errors and offers a retry", async () => {
    mockListMyRequests.mockRejectedValueOnce(new Error("Could not connect"));
    await render(<TrackScreen />);

    expect(await screen.findByText("Could not connect")).toBeTruthy();
    await fireEvent.press(screen.getByText("Try again"));
    await waitFor(() => expect(mockListMyRequests).toHaveBeenCalledTimes(2));
  });
});
