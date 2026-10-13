import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import ItemDetailReportScreen from "@/app/item-detail-report";
import { mockViewMeasureInWindow } from "@/test-utils/mockViewMeasure";

jest.mock("expo-router", () => ({
    router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("ItemDetailReportScreen", () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        mockViewMeasureInWindow();
        await render(<ItemDetailReportScreen />);
    });

    it("renders the report details", () => {
        expect(screen.getByText("Report Details")).toBeTruthy();
        expect(screen.getByText("Illegal Dumping: Construction Debris")).toBeTruthy();
        expect(screen.getByText("450 Industrial Rd, Industrial Zone")).toBeTruthy();
        expect(screen.getByText("Anonymous Resident")).toBeTruthy();
    });

    it("shows the severity badge", () => {
        expect(screen.getByText("HIGH SEVERITY")).toBeTruthy();
    });

    it("starts as UNDER REVIEW in both the hero badge and the status row", () => {
        expect(screen.getAllByText("UNDER REVIEW")).toHaveLength(2);
    });

    it("'Dispatch Cleanup Crew' sets the status to ASSIGNED", async () => {
        await fireEvent.press(screen.getByText("Dispatch Cleanup Crew"));
        expect(screen.getAllByText("ASSIGNED")).toHaveLength(2);
        expect(screen.queryByText("UNDER REVIEW")).toBeNull();
    });

    it("'Reject / Close' sets the status to REJECTED", async () => {
        await fireEvent.press(screen.getByText("Reject / Close"));
        expect(screen.getAllByText("REJECTED")).toHaveLength(2);
    });

    it("the status dropdown can change the status to Completed", async () => {
        await fireEvent.press(screen.getAllByText("UNDER REVIEW")[1]);
        await fireEvent.press(screen.getByText("Completed"));
        expect(screen.getAllByText("COMPLETED")).toHaveLength(2);
    });

    it("the back button returns to the previous screen", async () => {
        // @ts-ignore
        const backBtn = screen.root.children[0]?.children[0];
        await fireEvent.press(backBtn);
        expect(router.back).toHaveBeenCalledTimes(1);
    });
});
