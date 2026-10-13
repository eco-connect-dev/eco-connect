import { fireEvent, render, screen } from "@testing-library/react-native";

import { PendingItem, PendingItemCard } from "@/components/council/PendingItemCard";

const ITEM: PendingItem = {
    id: "1",
    title: "Bulk Waste: Old Sofa",
    category: "pickup",
    wasteCategory: "bulk",
    location: "1042 Maple St",
    area: "Maple Street",
    date: "Aug 12",
    dateISO: "2026-08-12",
    status: "pending",
};

describe("PendingItemCard", () => {
    it("shows the title, date, location and status", async () => {
        await render(<PendingItemCard item={ITEM} />);
        expect(screen.getByText("Bulk Waste: Old Sofa")).toBeTruthy();
        expect(screen.getByText("Aug 12")).toBeTruthy();
        expect(screen.getByText("1042 Maple St")).toBeTruthy();
        expect(screen.getByText("PENDING")).toBeTruthy();
    });

    it("calls onPress with the item", async () => {
        const onPress = jest.fn();
        await render(<PendingItemCard item={ITEM} onPress={onPress} />);
        fireEvent.press(screen.getByText("Bulk Waste: Old Sofa"));
        expect(onPress).toHaveBeenCalledWith(ITEM);
    });

    it("does not crash when pressed without an onPress handler", async () => {
        await render(<PendingItemCard item={ITEM} />);
        expect(() => fireEvent.press(screen.getByText("Bulk Waste: Old Sofa"))).not.toThrow();
    });

    it("renders dumping items with their own status", async () => {
        await render(
            <PendingItemCard
                item={{ ...ITEM, category: "dumping", status: "under_review" }}
            />,
        );
        expect(screen.getByText("UNDER REVIEW")).toBeTruthy();
    });
});
