import { render, screen } from "@testing-library/react-native";

import { StatCard } from "@/components/council/StatCard";

describe("StatCard", () => {
    it("renders the value and an upper-cased label", async () => {
        await render(<StatCard value={24} label="Total Pending" />);
        expect(screen.getByText("24")).toBeTruthy();
        expect(screen.getByText("TOTAL PENDING")).toBeTruthy();
    });

    it("accepts string values", async () => {
        await render(<StatCard value="--" label="Pickups" />);
        expect(screen.getByText("--")).toBeTruthy();
    });
});
