import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { TabSwitcher } from "@/components/council/TabSwitcher";

const TABS = ["All", "Pickups", "Dumping"];

describe("TabSwitcher", () => {
    it("renders every tab", async () => {
        await render(<TabSwitcher tabs={TABS} activeTab="All" onChange={jest.fn()} />);
        TABS.forEach((tab) => expect(screen.getByText(tab)).toBeTruthy());
    });

    it("calls onChange with the pressed tab", async () => {
        const onChange = jest.fn();
        await render(<TabSwitcher tabs={TABS} activeTab="All" onChange={onChange} />);
        fireEvent.press(screen.getByText("Pickups"));
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith("Pickups");
    });

    it("styles the active tab differently from inactive ones", async () => {
        await render(<TabSwitcher tabs={TABS} activeTab="Dumping" onChange={jest.fn()} />);
        const active = StyleSheet.flatten(screen.getByText("Dumping").props.style);
        const inactive = StyleSheet.flatten(screen.getByText("All").props.style);
        expect(active.fontWeight).toBe("700");
        expect(inactive.fontWeight).toBe("500");
    });
});
