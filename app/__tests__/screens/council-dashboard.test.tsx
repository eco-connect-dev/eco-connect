import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import CouncilDashboardScreen from "@/app/(tabs)/council-dashboard";

jest.mock("expo-router", () => ({
    router: { push: jest.fn(), back: jest.fn() },
    useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/lib/reports", () => ({
    listCouncilReports: jest.fn().mockResolvedValue([]),
}));

const SEARCH_PLACEHOLDER = "Search by title, location or area";

const ALL_TITLES = [
    "Bulk Waste: Old Sofa",
    "Illegal Dumping",
    "E-Waste Disposal",
    "Tires Abandoned in Alley",
    "Yard Waste Overload",
    "Construction Debris",
];

function expectOnlyTitles(visibleTitles: string[]) {
    ALL_TITLES.forEach((title) => {
        if (visibleTitles.includes(title)) {
            expect(screen.getByText(title)).toBeTruthy();
        } else {
            expect(screen.queryByText(title)).toBeNull();
        }
    });
}

async function openFilters() {
    await fireEvent.press(screen.getByText("Filters"));
}

async function applyFilters() {
    await fireEvent.press(screen.getByText("Apply Filters"));
}

describe("CouncilDashboardScreen", () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await render(<CouncilDashboardScreen />);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("initial render", () => {
        it("shows the header, stats and every request", () => {
            expect(screen.getByText("Pending Items")).toBeTruthy();
            expect(screen.getByText("TOTAL PENDING")).toBeTruthy();
            expect(screen.getByText("24")).toBeTruthy();
            expect(screen.getByText("Showing 6 of 24 items")).toBeTruthy();
            expectOnlyTitles(ALL_TITLES);
        });
    });

    describe("category tabs", () => {
        it("'Pickups' shows only pickup requests", async () => {
            await fireEvent.press(screen.getByText("Pickups"));
            expectOnlyTitles(["Bulk Waste: Old Sofa", "E-Waste Disposal", "Yard Waste Overload"]);
            expect(screen.getByText("Showing 3 of 24 items")).toBeTruthy();
        });

        it("'Dumping' shows only dumping reports", async () => {
            await fireEvent.press(screen.getByText("Dumping"));
            expectOnlyTitles(["Illegal Dumping", "Tires Abandoned in Alley", "Construction Debris"]);
        });

        it("'All' restores the full list", async () => {
            await fireEvent.press(screen.getByText("Dumping"));
            await fireEvent.press(screen.getByText("All"));
            expectOnlyTitles(ALL_TITLES);
        });
    });

    describe("search", () => {
        it("matches on title", async () => {
            await fireEvent.changeText(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), "sofa");
            expectOnlyTitles(["Bulk Waste: Old Sofa"]);
        });

        it("matches on area and is case-insensitive", async () => {
            await fireEvent.changeText(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), "ELM");
            expectOnlyTitles(["Yard Waste Overload"]);
        });

        it("matches on location", async () => {
            await fireEvent.changeText(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), "industrial rd");
            expectOnlyTitles(["Illegal Dumping"]);
        });

        it("shows an empty state when nothing matches", async () => {
            await fireEvent.changeText(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), "zzz");
            expect(screen.getByText("No requests match your filters")).toBeTruthy();
            expect(screen.getByText("Showing 0 of 24 items")).toBeTruthy();
        });

        it("combines with the category tab", async () => {
            await fireEvent.press(screen.getByText("Dumping"));
            await fireEvent.changeText(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), "debris");
            expectOnlyTitles(["Construction Debris"]);
        });
    });

    describe("filter modal", () => {
        it("opens and closes", async () => {
            expect(screen.queryByText("Filter Requests")).toBeNull();
            await openFilters();
            expect(screen.getByText("Filter Requests")).toBeTruthy();
            await applyFilters();
            expect(screen.queryByText("Filter Requests")).toBeNull();
        });

        it("filters by a single status", async () => {
            await openFilters();
            await fireEvent.press(screen.getByText("Assigned"));
            await applyFilters();
            expectOnlyTitles(["E-Waste Disposal"]);
            expect(screen.getByText("Showing 1 of 24 items")).toBeTruthy();
        });

        it("filters by multiple statuses (OR)", async () => {
            await openFilters();
            await fireEvent.press(screen.getByText("Pending"));
            await applyFilters();
            expectOnlyTitles(["Bulk Waste: Old Sofa", "Tires Abandoned in Alley", "Yard Waste Overload"]);
        });

        it("filters by waste category", async () => {
            await openFilters();
            await fireEvent.press(screen.getByText("Hazardous"));
            await applyFilters();
            expectOnlyTitles(["E-Waste Disposal"]);
        });

        it("filters by area", async () => {
            await openFilters();
            await fireEvent.changeText(screen.getByPlaceholderText("e.g. Ward Place, Borella"), "river");
            await applyFilters();
            expectOnlyTitles(["Construction Debris"]);
        });

        it("filters by 'Today'", async () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2026-08-10T10:00:00Z"));
            await openFilters();
            await fireEvent.press(screen.getByText("Today"));
            await applyFilters();
            expectOnlyTitles(["E-Waste Disposal", "Tires Abandoned in Alley"]);
        });

        it("filters by 'This Week'", async () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2026-08-10T10:00:00Z"));
            await openFilters();
            await fireEvent.press(screen.getByText("This Week"));
            await applyFilters();
            expectOnlyTitles([
                "Bulk Waste: Old Sofa",
                "Illegal Dumping",
                "E-Waste Disposal",
                "Tires Abandoned in Alley",
                "Yard Waste Overload",
            ]);
        });

        it("shows the empty state when the date range excludes everything", async () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2026-09-15T10:00:00Z"));
            await openFilters();
            await fireEvent.press(screen.getByText("This Month"));
            await applyFilters();
            expect(screen.getByText("No requests match your filters")).toBeTruthy();
        });

        it("shows the number of active filters on the Filters button", async () => {
            await openFilters();
            await fireEvent.press(screen.getByText("Assigned"));
            await fireEvent.press(screen.getByText("Hazardous"));
            await applyFilters();
            expect(screen.getByText("2")).toBeTruthy();
        });

        it("'Clear All' removes every filter", async () => {
            await openFilters();
            await fireEvent.press(screen.getByText("Assigned"));
            await fireEvent.press(screen.getByText("Clear All"));
            await applyFilters();
            expectOnlyTitles(ALL_TITLES);
            expect(screen.queryByText("1")).toBeNull();
        });
    });

    describe("navigation", () => {
        it("opens the pickup detail screen for a pickup request", async () => {
            await fireEvent.press(screen.getByText("Bulk Waste: Old Sofa"));
            expect(router.push).toHaveBeenCalledWith({
                pathname: "/item-detail-pickup",
                params: { id: "1" },
            });
        });

        it("opens the report detail screen only for a dumping report", async () => {
            await fireEvent.press(screen.getByText("Illegal Dumping"));
            expect(router.push).toHaveBeenCalledTimes(1);
            expect(router.push).toHaveBeenCalledWith({
                pathname: "/item-detail-report",
                params: { id: "2" },
            });
        });

        it("opens the council profile from the Profile button", async () => {
            await fireEvent.press(screen.getByText("Profile"));
            expect(router.push).toHaveBeenCalledWith("/council-profile");
        });
    });
});
