import { fireEvent, render, screen } from "@testing-library/react-native";

import DriverDashboardScreen from "@/app/(tabs)/driver-dashboard";
import { listAssignedDriverTasks } from "@/lib/tracking";

const mockListAssigned = listAssignedDriverTasks as jest.Mock;
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
  useFocusEffect: (callback: () => void | (() => void)) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react") as typeof import("react");
    React.useEffect(callback, [callback]);
  },
}));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock("expo-image", () => ({ Image: () => null }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("expo-location", () => ({ geocodeAsync: jest.fn(async () => [{ latitude: 6.9, longitude: 79.8 }]) }));
jest.mock("@/components/MapSelector", () => ({ __esModule: true, default: () => null }));
jest.mock("@/lib/tracking", () => ({
  listAssignedDriverTasks: jest.fn(),
  subscribeToDriverTasks: jest.fn(() => ({})),
  removeDriverTasksSubscription: jest.fn(),
}));

const assignedTasks = [
  { id: "pickup-assigned-1", source: "pickup_requests", reporter_id: "resident-1", category: "Recyclable", status: "assigned", submitted_at: "2026-10-14T08:30:00Z", location: "12 Lake Road, Colombo", notes: "Cardboard by the gate", image_url: null },
  { id: "dump-assigned-1", source: "dumping_reports", reporter_id: "resident-2", category: "Illegal dumping", status: "assigned", submitted_at: "2026-10-14T09:00:00Z", location: "Market Street, Colombo", notes: null, image_url: null },
];

describe("DriverDashboardScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListAssigned.mockResolvedValue(assignedTasks);
  });

  it("shows assigned stops and the route map overview", async () => {
    await render(<DriverDashboardScreen />);
    expect(await screen.findByText("Route Progress")).toBeTruthy();
    expect(screen.getByText("Assigned Route")).toBeTruthy();
    expect(screen.getByText("Stops on Route")).toBeTruthy();
    expect(screen.getByText("12 Lake Road, Colombo")).toBeTruthy();
    expect(screen.getByText("Market Street, Colombo")).toBeTruthy();
    expect(mockListAssigned).toHaveBeenCalledTimes(1);
  });

  it("opens stop verification for a selected assigned request", async () => {
    await render(<DriverDashboardScreen />);
    const stop = await screen.findByText("12 Lake Road, Colombo");
    fireEvent.press(stop.parent?.parent as never);
    expect(mockPush).toHaveBeenCalledWith({ pathname: "/driver-task-detail", params: { id: "pickup-assigned-1", source: "pickup_requests" } });
  });

  it("shows an empty route when there are no assigned requests", async () => {
    mockListAssigned.mockResolvedValueOnce([]);
    await render(<DriverDashboardScreen />);
    expect((await screen.findAllByText("No assigned stops")).length).toBe(2);
    expect(screen.getByText("New stops will appear here when council dispatches them.")).toBeTruthy();
  });
});
