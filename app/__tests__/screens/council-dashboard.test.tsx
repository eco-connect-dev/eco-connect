import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import CouncilDashboardScreen from "@/app/(tabs)/council-dashboard";
import { listCouncilRequests } from "@/lib/tracking";
import { getCommunityPosts } from "@/lib/community";

const mockListRequests = listCouncilRequests as jest.Mock;
const mockGetCommunityPosts = getCommunityPosts as jest.Mock;

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useFocusEffect: (callback: () => void | (() => void)) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react") as typeof import("react");
    React.useEffect(callback, [callback]);
  },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("@/lib/tracking", () => ({ listCouncilRequests: jest.fn() }));
jest.mock("@/lib/community", () => ({
  getCommunityPosts: jest.fn(),
  getPostTimeLabel: () => "Today",
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("expo-image", () => ({ Image: () => null }));

const requests = [
  { id: "pickup-1", source: "pickup_requests", reporter_id: "resident-1", category: "Bulk Waste", status: "pending", submitted_at: "2026-08-10T09:00:00Z", location: "1042 Maple St", notes: null },
  { id: "dump-1", source: "dumping_reports", reporter_id: "resident-2", category: "Illegal Dumping", status: "pending", submitted_at: "2026-08-10T08:00:00Z", location: "Industrial Rd", notes: null },
  { id: "pickup-2", source: "pickup_requests", reporter_id: "resident-3", category: "E-Waste Disposal", status: "assigned", submitted_at: "2026-08-10T07:00:00Z", location: "Elm Street", notes: null },
  { id: "dump-2", source: "dumping_reports", reporter_id: "resident-4", category: "Tires Abandoned in Alley", status: "rejected", submitted_at: "2026-08-09T09:00:00Z", location: "Pine Lane", notes: null },
  { id: "pickup-3", source: "pickup_requests", reporter_id: "resident-5", category: "Yard Waste Overload", status: "pending", submitted_at: "2026-08-09T08:00:00Z", location: "Elm Park", notes: null },
  { id: "dump-3", source: "dumping_reports", reporter_id: "resident-6", category: "Construction Debris", status: "in_review", submitted_at: "2026-08-08T08:00:00Z", location: "River Road", notes: null },
];
const posts = [{ id: "post-1", author_id: "resident-1", author_name: "Amaya Silva", description: "Clean-up this weekend", location: "Borella", image_url: null, created_at: "2026-08-10T10:00:00Z" }];

describe("CouncilDashboardScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListRequests.mockResolvedValue(requests);
    mockGetCommunityPosts.mockResolvedValue(posts);
  });

  it("loads current requests and community posts from their data services", async () => {
    await render(<CouncilDashboardScreen />);

    expect(await screen.findByText("Pickup Requests and Dumping Reports")).toBeTruthy();
    expect(screen.getByText("Showing 6 of 6 items")).toBeTruthy();
    expect(screen.getByText("E-Waste Disposal pickup")).toBeTruthy();
    expect(screen.getByText("Illegal Dumping")).toBeTruthy();
    expect(screen.getByText("Community Posts")).toBeTruthy();
    expect(screen.getByText("Amaya Silva · Borella")).toBeTruthy();
    expect(mockListRequests).toHaveBeenCalledTimes(1);
    expect(mockGetCommunityPosts).toHaveBeenCalledTimes(1);
  });

  it("filters pickup requests and dumping reports by tab", async () => {
    await render(<CouncilDashboardScreen />);
    await screen.findByText("Pickup Requests and Dumping Reports");

    await fireEvent.press(screen.getByText("Pickups"));
    expect(screen.getByText("Showing 3 of 6 items")).toBeTruthy();
    expect(screen.getByText("Bulk Waste pickup")).toBeTruthy();
    expect(screen.queryByText("Illegal Dumping")).toBeNull();

    await fireEvent.press(screen.getByText("Dumping"));
    expect(screen.getByText("Showing 3 of 6 items")).toBeTruthy();
    expect(screen.getByText("Illegal Dumping")).toBeTruthy();
    expect(screen.queryByText("Bulk Waste pickup")).toBeNull();
  });

  it("searches request title and location", async () => {
    await render(<CouncilDashboardScreen />);
    await screen.findByText("Pickup Requests and Dumping Reports");
    const search = screen.getByPlaceholderText("Search by title, location or area");

    await fireEvent.changeText(search, "industrial");
    expect(screen.getByText("Illegal Dumping")).toBeTruthy();
    expect(screen.queryByText("Bulk Waste pickup")).toBeNull();
    expect(screen.getByText("Showing 1 of 6 items")).toBeTruthy();
  });

  it("shows an empty result when search has no matches", async () => {
    await render(<CouncilDashboardScreen />);
    await screen.findByText("Pickup Requests and Dumping Reports");
    await fireEvent.changeText(screen.getByPlaceholderText("Search by title, location or area"), "no such item");

    expect(screen.getByText("No requests match your filters")).toBeTruthy();
    expect(screen.getByText("Showing 0 of 6 items")).toBeTruthy();
  });

  it("filters by request status", async () => {
    await render(<CouncilDashboardScreen />);
    await screen.findByText("Pickup Requests and Dumping Reports");
    await fireEvent.press(screen.getByText("Filters"));
    await fireEvent.press(screen.getByText("Assigned"));
    await fireEvent.press(screen.getByText("Apply Filters"));

    expect(screen.getByText("Showing 1 of 6 items")).toBeTruthy();
    expect(screen.getByText("E-Waste Disposal pickup")).toBeTruthy();
    expect(screen.queryByText("Illegal Dumping")).toBeNull();
  });

  it("opens the correct detail route for a pickup request and a dumping report", async () => {
    await render(<CouncilDashboardScreen />);
    await screen.findByText("Pickup Requests and Dumping Reports");

    await fireEvent.press(screen.getByText("Bulk Waste pickup"));
    expect(router.push).toHaveBeenCalledWith({ pathname: "/item-detail-pickup", params: { id: "pickup-1" } });

    await fireEvent.press(screen.getByText("Illegal Dumping"));
    expect(router.push).toHaveBeenLastCalledWith({ pathname: "/item-detail-report", params: { id: "dump-1" } });
  });

  it("opens community post details", async () => {
    await render(<CouncilDashboardScreen />);
    await screen.findByText("Amaya Silva · Borella");
    await fireEvent.press(screen.getByLabelText("Open post by Amaya Silva"));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith({
      pathname: "/council-community-post-detail",
      params: { id: "post-1" },
    }));
  });

  it("shows request fetch errors", async () => {
    mockListRequests.mockRejectedValueOnce(new Error("Request list unavailable"));
    await render(<CouncilDashboardScreen />);
    expect(await screen.findByText("Request list unavailable")).toBeTruthy();
  });
});
