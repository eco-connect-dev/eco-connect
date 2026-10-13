import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import ItemDetailPickupScreen from "@/app/item-detail-pickup";
import { getFirstPressable, mockViewMeasureInWindow } from "@/test-utils/mockViewMeasure";

jest.mock("expo-router", () => ({
    router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("ItemDetailPickupScreen", () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        mockViewMeasureInWindow();
        await render(<ItemDetailPickupScreen />);
    });

    it("renders the request details", () => {
        expect(screen.getByText("Request Details")).toBeTruthy();
        expect(screen.getByText("Bulk Waste Pickup: Old Sofa & Dining Set")).toBeTruthy();
        expect(screen.getByText("42 Maple St, Ward Place")).toBeTruthy();
        expect(screen.getByText("Kasun Gamlath")).toBeTruthy();
    });

    it("starts as PENDING in both the hero badge and the status row", () => {
        expect(screen.getAllByText("PENDING")).toHaveLength(2);
    });

    it("'Assign to Municipal Crew' sets the status to ASSIGNED", async () => {
        await fireEvent.press(screen.getByText("Assign to Municipal Crew"));
        expect(screen.getAllByText("ASSIGNED")).toHaveLength(2);
        expect(screen.queryByText("PENDING")).toBeNull();
    });

    it("'Reject / Close' sets the status to REJECTED", async () => {
        await fireEvent.press(screen.getByText("Reject / Close"));
        expect(screen.getAllByText("REJECTED")).toHaveLength(2);
        expect(screen.queryByText("PENDING")).toBeNull();
    });

    it("the last action wins when assigning and then rejecting", async () => {
        await fireEvent.press(screen.getByText("Assign to Municipal Crew"));
        await fireEvent.press(screen.getByText("Reject / Close"));
        expect(screen.getAllByText("REJECTED")).toHaveLength(2);
        expect(screen.queryByText("ASSIGNED")).toBeNull();
    });

    it("the status dropdown can change the status to Completed", async () => {
        // index 0 is the hero badge, index 1 is the dropdown trigger
        await fireEvent.press(screen.getAllByText("PENDING")[1]);
        await fireEvent.press(screen.getByText("Completed"));
        expect(screen.getAllByText("COMPLETED")).toHaveLength(2);
        expect(screen.queryByText("PENDING")).toBeNull();
    });

    it("the back button returns to the previous screen", async () => {
        // @ts-ignore
        const backBtn = screen.root.children[0]?.children[0];
        await fireEvent.press(backBtn);
        expect(router.back).toHaveBeenCalledTimes(1);
    });
});
