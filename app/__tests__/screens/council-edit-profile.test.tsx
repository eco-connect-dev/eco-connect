import { fireEvent, render, screen } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import CouncilEditProfileScreen from "@/app/council-edit-profile";

jest.mock("expo-router", () => ({
    router: { push: jest.fn(), back: jest.fn() },
    useLocalSearchParams: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const PARAMS = {
    name: "Cllr. Kamal Perera",
    title: "Colombo Councillor",
    email: "kamal.perera@municipal.gov.lk",
    phone: "+94 71 1122 990",
    department: "Environmental Services",
};

describe("CouncilEditProfileScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useLocalSearchParams as jest.Mock).mockReturnValue(PARAMS);
    });

    it("pre-fills the form from the route params", async () => {
        await render(<CouncilEditProfileScreen />);
        expect(screen.getByText("Edit Profile")).toBeTruthy();
        expect(screen.getByDisplayValue(PARAMS.name)).toBeTruthy();
        expect(screen.getByDisplayValue(PARAMS.title)).toBeTruthy();
        expect(screen.getByDisplayValue(PARAMS.phone)).toBeTruthy();
        expect(screen.getByDisplayValue(PARAMS.department)).toBeTruthy();
    });

    it("shows the email as read-only", async () => {
        await render(<CouncilEditProfileScreen />);
        expect(screen.getByDisplayValue(PARAMS.email).props.editable).toBe(false);
        expect(screen.getByText("Email can't be changed here")).toBeTruthy();
    });

    it("uses the phone keypad for the phone field", async () => {
        await render(<CouncilEditProfileScreen />);
        expect(screen.getByPlaceholderText("Phone number").props.keyboardType).toBe("phone-pad");
    });

    it("lets the user edit the name", async () => {
        await render(<CouncilEditProfileScreen />);
        await fireEvent.changeText(screen.getByPlaceholderText("Full name"), "Cllr. Nimal Silva");
        expect(screen.getByDisplayValue("Cllr. Nimal Silva")).toBeTruthy();
        expect(screen.queryByDisplayValue(PARAMS.name)).toBeNull();
    });

    it("starts with empty fields when no params are passed", async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({});
        await render(<CouncilEditProfileScreen />);
        expect(screen.getByPlaceholderText("Full name").props.value).toBe("");
        expect(screen.getByPlaceholderText("Phone number").props.value).toBe("");
    });

    it("'Save Changes' goes back to the profile", async () => {
        await render(<CouncilEditProfileScreen />);
        await fireEvent.press(screen.getByText("Save Changes"));
        expect(router.back).toHaveBeenCalledTimes(1);
    });

    it("'Cancel' goes back without saving", async () => {
        await render(<CouncilEditProfileScreen />);
        await fireEvent.press(screen.getByText("Cancel"));
        expect(router.back).toHaveBeenCalledTimes(1);
    });

    it("the header back button returns to the previous screen", async () => {
        await render(<CouncilEditProfileScreen />);
        // @ts-ignore
        const backBtn = screen.root.children[0]?.children[0];
        await fireEvent.press(backBtn);
        expect(router.back).toHaveBeenCalledTimes(1);
    });

    it("'Save Changes' returns from the current route", async () => {
        await render(<CouncilEditProfileScreen />);
        await fireEvent.press(screen.getByText("Save Changes"));
        expect(router.back).toHaveBeenCalledTimes(1);
    });
});
