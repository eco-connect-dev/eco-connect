import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { FilterChip } from "@/components/council/FilterChip";
import { Colors } from "@/constants/Colors";

describe("FilterChip", () => {
    it("renders its label and handles presses", async () => {
        const onPress = jest.fn();
        await render(<FilterChip label="Pending" active={false} onPress={onPress} />);
        fireEvent.press(screen.getByText("Pending"));
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("uses light text when active", async () => {
        await render(<FilterChip label="Pending" active onPress={jest.fn()} />);
        const style = StyleSheet.flatten(screen.getByText("Pending").props.style);
        expect(style.color).toBe(Colors.surface);
    });

    it("uses secondary text when inactive", async () => {
        await render(<FilterChip label="Pending" active={false} onPress={jest.fn()} />);
        const style = StyleSheet.flatten(screen.getByText("Pending").props.style);
        expect(style.color).toBe(Colors.councilTextSecondary);
    });
});
