import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import ItemDetailReportScreen from "@/app/item-detail-report";
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
jest.mock("expo-image", () => ({ Image: () => null }));

const report = {
  id: "dump-1", source: "dumping_reports", reporter_id: "resident-1", category: "Illegal dumping",
  status: "in_review", submitted_at: "2026-10-12T08:30:00Z", location: "450 Industrial Road, Colombo",
  notes: "Construction debris near the road", image_url: "https://example.test/dump.jpg",
};

describe("ItemDetailReportScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockViewMeasureInWindow();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "dump-1" });
    mockGetCouncilRequest.mockResolvedValue(report);
    mockUpdateStatus.mockResolvedValue({ ...report, status: "assigned" });
  });

  it("loads the selected dumping report and its photo evidence", async () => {
    await render(<ItemDetailReportScreen />);

    expect(await screen.findAllByText("Illegal dumping")).toHaveLength(2);
    expect(screen.getAllByText("450 Industrial Road, Colombo")).toHaveLength(2);
    expect(screen.getByText("Construction debris near the road")).toBeTruthy();
    expect(screen.getAllByText("UNDER REVIEW")).toHaveLength(2);
    expect(mockGetCouncilRequest).toHaveBeenCalledWith("dumping_reports", "dump-1");
  });

  it("saves the selected assigned status then returns to the council dashboard", async () => {
    await render(<ItemDetailReportScreen />);
    await screen.findAllByText("Illegal dumping");
    await fireEvent.press(screen.getAllByText("UNDER REVIEW")[1]);
    await fireEvent.press(screen.getByText("Assigned"));
    await fireEvent.press(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith("dumping_reports", "dump-1", "assigned");
      expect(router.replace).toHaveBeenCalledWith("/(tabs)/council-dashboard");
    });
  });

  it("saves the resolved status using the app's resolved label", async () => {
    await render(<ItemDetailReportScreen />);
    await screen.findAllByText("Illegal dumping");
    await fireEvent.press(screen.getAllByText("UNDER REVIEW")[1]);
    await fireEvent.press(screen.getByText("Resolved"));
    await fireEvent.press(screen.getByText("Save Changes"));

    await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalledWith("dumping_reports", "dump-1", "completed"));
  });

  it("returns to the dashboard when cancelled", async () => {
    await render(<ItemDetailReportScreen />);
    await screen.findAllByText("Illegal dumping");
    await fireEvent.press(screen.getByText("Cancel"));

    expect(router.replace).toHaveBeenCalledWith("/(tabs)/council-dashboard");
  });
});
