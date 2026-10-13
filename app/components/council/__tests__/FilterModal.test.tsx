import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { EMPTY_FILTERS, FilterModal } from "@/components/council/FilterModal";
import { Colors } from "@/constants/Colors";

async function setup(overrides = {}) {
    const props = {
        visible: true,
        filters: EMPTY_FILTERS,
        onChange: jest.fn(),
        onClose: jest.fn(),
        onClear: jest.fn(),
        ...overrides,
    };
    await render(<FilterModal {...props} />);
    return props;
}

describe("FilterModal", () => {
    it("renders nothing when not visible", async () => {
        await setup({ visible: false });
        expect(screen.queryByText("Filter Requests")).toBeNull();
    });

    it("renders all filter sections and options when visible", async () => {
        await setup();
        ["Filter Requests", "Status", "Category", "Area", "Date Range"].forEach((text) =>
            expect(screen.getByText(text)).toBeTruthy(),
        );
        ["Pending", "Under Review", "Assigned", "Rejected", "Completed"].forEach((text) =>
            expect(screen.getByText(text)).toBeTruthy(),
        );
        ["General", "Recyclable", "Hazardous", "Bulk", "Illegal Dumping"].forEach((text) =>
            expect(screen.getByText(text)).toBeTruthy(),
        );
        ["All Time", "Today", "This Week", "This Month"].forEach((text) =>
            expect(screen.getByText(text)).toBeTruthy(),
        );
    });

    it("adds a status when its chip is pressed", async () => {
        const props = await setup();
        fireEvent.press(screen.getByText("Assigned"));
        expect(props.onChange).toHaveBeenCalledWith({
            ...EMPTY_FILTERS,
            statuses: ["assigned"],
        });
    });

    it("removes a status that is already selected", async () => {
        const props = await setup({
            filters: { ...EMPTY_FILTERS, statuses: ["assigned", "pending"] },
        });
        fireEvent.press(screen.getByText("Assigned"));
        expect(props.onChange).toHaveBeenCalledWith({
            ...EMPTY_FILTERS,
            statuses: ["pending"],
        });
    });

    it("adds a waste category when its chip is pressed", async () => {
        const props = await setup();
        fireEvent.press(screen.getByText("Hazardous"));
        expect(props.onChange).toHaveBeenCalledWith({
            ...EMPTY_FILTERS,
            wasteCategories: ["hazardous"],
        });
    });

    it("updates the area text", async () => {
        const props = await setup();
        fireEvent.changeText(screen.getByPlaceholderText("e.g. Ward Place, Borella"), "Pine");
        expect(props.onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, area: "Pine" });
    });

    it("selects a date range", async () => {
        const props = await setup();
        fireEvent.press(screen.getByText("This Week"));
        expect(props.onChange).toHaveBeenCalledWith({
            ...EMPTY_FILTERS,
            dateRange: "this_week",
        });
    });

    it("highlights the currently selected date range", async () => {
        await setup({ filters: { ...EMPTY_FILTERS, dateRange: "today" } });
        const style = StyleSheet.flatten(screen.getByText("Today").props.style);
        expect(style.color).toBe(Colors.surface);
    });

    it("calls onClear for 'Clear All' and onClose for 'Apply Filters'", async () => {
        const props = await setup();
        fireEvent.press(screen.getByText("Clear All"));
        expect(props.onClear).toHaveBeenCalledTimes(1);
        fireEvent.press(screen.getByText("Apply Filters"));
        expect(props.onClose).toHaveBeenCalledTimes(1);
    });
});
