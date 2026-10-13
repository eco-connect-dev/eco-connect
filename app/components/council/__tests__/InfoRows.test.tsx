import { render, screen } from "@testing-library/react-native";

import { ContactRow } from "@/components/council/ContactRow";
import { InfoRow } from "@/components/council/InfoRow";
import { SummaryCard } from "@/components/council/SummaryCard";

describe("ContactRow", () => {
    it("renders the label and value", async () => {
        await render(<ContactRow icon="mail-outline" label="Email Address" value="a@b.lk" />);
        expect(screen.getByText("Email Address")).toBeTruthy();
        expect(screen.getByText("a@b.lk")).toBeTruthy();
    });
});

describe("InfoRow", () => {
    it("renders a plain value", async () => {
        await render(<InfoRow label="Department" value="Environmental Services" />);
        expect(screen.getByText("Department")).toBeTruthy();
        expect(screen.getByText("Environmental Services")).toBeTruthy();
    });

    it("renders an upper-cased badge instead of the value when a badge is given", async () => {
        await render(<InfoRow label="Role Designation" badge="Council Member" value="ignored" />);
        expect(screen.getByText("COUNCIL MEMBER")).toBeTruthy();
        expect(screen.queryByText("ignored")).toBeNull();
    });
});

describe("SummaryCard", () => {
    it("renders the value and label", async () => {
        await render(<SummaryCard value={98} label="Resolved" />);
        expect(screen.getByText("98")).toBeTruthy();
        expect(screen.getByText("Resolved")).toBeTruthy();
    });
});
