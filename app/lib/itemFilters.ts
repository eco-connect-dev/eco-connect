import { DateRangeFilter } from "@/components/council/FilterModal";

export function isWithinDateRange(dateISO: string, range: DateRangeFilter): boolean {
    if (range === "all") return true;

    const itemDate = new Date(dateISO);
    const now = new Date();

    if (range === "today") {
        return itemDate.toDateString() === now.toDateString();
    }

    if (range === "this_week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return itemDate >= startOfWeek;
    }

    if (range === "this_month") {
        return (
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear()
        );
    }

    return true;
}
