import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Modal, View } from "react-native";

import { StatusDropdown } from "@/components/council/StatusDropdown";
import { mockViewMeasureInWindow } from "@/test-utils/mockViewMeasure";

describe("StatusDropdown", () => {
    beforeEach(() => {
        mockViewMeasureInWindow();
    });

    it("shows the current status and keeps the menu closed", async () => {
        await render(<StatusDropdown status="pending" onChange={jest.fn()} />);
        expect(screen.getByText("PENDING")).toBeTruthy();
        expect(screen.queryByText("Assigned")).toBeNull();
    });

    it("opens a menu with only assigned, rejected and completed", async () => {
        await render(<StatusDropdown status="pending" onChange={jest.fn()} />);
        await fireEvent.press(screen.getByText("PENDING"));
        expect(screen.getByText("Assigned")).toBeTruthy();
        expect(screen.getByText("Rejected")).toBeTruthy();
        expect(screen.getByText("Completed")).toBeTruthy();
        expect(screen.queryByText("Pending")).toBeNull();
        expect(screen.queryByText("Under Review")).toBeNull();
    });

    it("calls onChange with the chosen status and closes the menu", async () => {
        const onChange = jest.fn();
        await render(<StatusDropdown status="pending" onChange={onChange} />);
        await fireEvent.press(screen.getByText("PENDING"));
        await fireEvent.press(screen.getByText("Rejected"));
        expect(onChange).toHaveBeenCalledWith("rejected");
        expect(screen.queryByText("Rejected")).toBeNull();
    });

    it("closes when the modal requests to close (Android back button)", async () => {
        await render(<StatusDropdown status="pending" onChange={jest.fn()} />);
        await fireEvent.press(screen.getByText("PENDING"));
        expect(screen.getByText("Completed")).toBeTruthy();
        const findModal = (node: any): any => {
            if (!node) return null;
            if (typeof node.props?.onRequestClose === "function") return node;
            if (Array.isArray(node.children)) {
                for (const child of node.children) {
                    const res = findModal(child);
                    if (res) return res;
                }
            }
            return null;
        };
        const modal = findModal(screen.root);
        await act(async () => {
            modal.props.onRequestClose();
        });
        expect(screen.queryByText("Completed")).toBeNull();
    });
});
