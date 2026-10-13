import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import CouncilProfileScreen from "@/app/council-profile";
import { getFirstPressable } from "@/test-utils/mockViewMeasure";

jest.mock("expo-router", () => ({
    router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("CouncilProfileScreen", () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await render(<CouncilProfileScreen />);
    });

    it("renders the profile header", () => {
        expect(screen.getByText("My Profile")).toBeTruthy();
        expect(screen.getByText("Cllr. Kamal Perera")).toBeTruthy();
        expect(screen.getByText("Colombo Councillor")).toBeTruthy();
    });

    it("renders contact details", () => {
        expect(screen.getByText("kamal.perera@municipal.gov.lk")).toBeTruthy();
        expect(screen.getByText("+94 71 1122 990")).toBeTruthy();
    });

    it("renders account info and the role badge", () => {
        expect(screen.getByText("Nov 2021")).toBeTruthy();
        expect(screen.getByText("COUNCIL MEMBER")).toBeTruthy();
        expect(screen.getByText("Environmental Services")).toBeTruthy();
    });

    it("renders the activity summary", () => {
        expect(screen.getByText("98")).toBeTruthy();
        expect(screen.getByText("12")).toBeTruthy();
    });

    it("'Edit Profile' opens the edit screen with the current values", async () => {
        await fireEvent.press(screen.getByText("Edit Profile"));
        expect(router.push).toHaveBeenCalledWith({
            pathname: "/council-edit-profile",
            params: {
                name: "Cllr. Kamal Perera",
                title: "Colombo Councillor",
                email: "kamal.perera@municipal.gov.lk",
                phone: "+94 71 1122 990",
                department: "Environmental Services",
            },
        });
    });

    it("the back button returns to the previous screen", async () => {
        // @ts-ignore
        const backBtn = screen.root.children[0]?.children[0];
        await fireEvent.press(backBtn);
        expect(router.back).toHaveBeenCalledTimes(1);
    });

    it.todo("'Sign Out' ends the session and returns to the login screen");
});
