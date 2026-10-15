import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import ItemDetailPickupScreen from "@/app/item-detail-pickup";
import { getCouncilRequest, updateCouncilRequestStatus } from "@/lib/tracking";
import { mockViewMeasureInWindow } from "@/test-utils/mockViewMeasure";

const mockGetCouncilRequest = getCouncilRequest as jest.Mock;
const mockUpdateStatus = updateCouncilRequestStatus as jest.Mock;

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock("@/lib/tracking", () => ({ getCouncilRequest: jest.fn(), updateCouncilRequestStatus: jest.fn() }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

const pickup = {
  id: "pickup-1", source: "pickup_requests", reporter_id: "resident-1", category: "Recyclable",
  status: "pending", submitted_at: "2026-10-12T08:30:00Z", location: "42 Ward Place, Colombo",
  notes: "Cardboard boxes", image_url: null,
};

describe("ItemDetailPickupScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockViewMeasureInWindow();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "pickup-1" });
    mockGetCouncilRequest.mockResolvedValue(pickup);
    mockUpdateStatus.mockResolvedValue({ ...pickup, status: "assigned" });
  });

  it("loads the selected pickup request from the database service", async () => {
    await render(<ItemDetailPickupScreen />);

    expect(await screen.findByText("Recyclable pickup")).toBeTruthy();
    expect(screen.getAllByText("42 Ward Place, Colombo")).toHaveLength(2);
    expect(screen.getByText("Cardboard boxes")).toBeTruthy();
    expect(screen.getAllByText("PENDING")).toHaveLength(2);
    expect(mockGetCouncilRequest).toHaveBeenCalledWith("pickup_requests", "pickup-1");
  });

  it("persists a changed status then returns to the council dashboard", async () => {
    await render(<ItemDetailPickupScreen />);
    await screen.findByText("Recyclable pickup");
    await fireEvent.press(screen.getAllByText("PENDING")[1]);
    await fireEvent.press(screen.getByText("Assigned"));
    await fireEvent.press(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith("pickup_requests", "pickup-1", "assigned");
      expect(router.replace).toHaveBeenCalledWith("/(tabs)/council-dashboard");
    });
  });

  it("maps resolved database status to the resolved badge", async () => {
    mockGetCouncilRequest.mockResolvedValue({ ...pickup, status: "resolved" });
    await render(<ItemDetailPickupScreen />);

    expect(await screen.findAllByText("RESOLVED")).toHaveLength(2);
  });

  it("returns to the dashboard when cancelled", async () => {
    await render(<ItemDetailPickupScreen />);
    await screen.findByText("Recyclable pickup");
    await fireEvent.press(screen.getByText("Cancel"));

    expect(router.replace).toHaveBeenCalledWith("/(tabs)/council-dashboard");
  });
});
