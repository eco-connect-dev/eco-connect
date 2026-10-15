import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { ItemStatus, StatusBadge } from "@/components/council/StatusBadge";
import { Colors } from "@/constants/Colors";

const CASES: [ItemStatus, string][] = [
    ["pending", "PENDING"],
    ["under_review", "UNDER REVIEW"],
    ["assigned", "ASSIGNED"],
    ["rejected", "REJECTED"],
    ["completed", "RESOLVED"],
];

describe("StatusBadge", () => {
    it.each(CASES)("renders %s as %s", async (status, label) => {
        await render(<StatusBadge status={status} />);
        expect(screen.getByText(label)).toBeTruthy();
    });

    it("uses the rejected text colour for rejected items", async () => {
        await render(<StatusBadge status="rejected" />);
        const style = StyleSheet.flatten(screen.getByText("REJECTED").props.style);
        expect(style.color).toBe(Colors.statusRejectedText);
    });

    it("uses the assigned text colour for assigned items", async () => {
        await render(<StatusBadge status="assigned" />);
        const style = StyleSheet.flatten(screen.getByText("ASSIGNED").props.style);
        expect(style.color).toBe(Colors.statusAssignedText);
    });
});
