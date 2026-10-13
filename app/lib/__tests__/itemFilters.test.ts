import { isWithinDateRange } from "@/lib/itemFilters";

describe("isWithinDateRange", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        // Wednesday 12 Aug 2026 (the week starts on Sunday 9 Aug)
        jest.setSystemTime(new Date("2026-08-12T10:00:00Z"));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("matches everything when the range is 'all'", () => {
        expect(isWithinDateRange("1999-01-01", "all")).toBe(true);
        expect(isWithinDateRange("2030-12-31", "all")).toBe(true);
    });

    it("'today' matches only the current day", () => {
        expect(isWithinDateRange("2026-08-12", "today")).toBe(true);
        expect(isWithinDateRange("2026-08-11", "today")).toBe(false);
    });

    it("'this_week' starts on Sunday", () => {
        expect(isWithinDateRange("2026-08-09", "this_week")).toBe(true);
        expect(isWithinDateRange("2026-08-12", "this_week")).toBe(true);
        expect(isWithinDateRange("2026-08-08", "this_week")).toBe(false);
    });

    it("'this_month' matches the same month and year only", () => {
        expect(isWithinDateRange("2026-08-01", "this_month")).toBe(true);
        expect(isWithinDateRange("2026-08-31", "this_month")).toBe(true);
        expect(isWithinDateRange("2026-07-31", "this_month")).toBe(false);
        expect(isWithinDateRange("2025-08-12", "this_month")).toBe(false);
    });
});
