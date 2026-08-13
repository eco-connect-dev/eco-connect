import { supabase } from "@/lib/supabase";
import type {
    CouncilFeedParams,
    CouncilFeedResponse,
    CouncilItem,
} from "@/types/council";

const DEFAULT_PAGE_SIZE = 10;

/**
 * Fetches a unified, paginated feed of pending pickup requests and
 * dumping reports for council/admin users.
 *
 * Backend contract (Supabase Edge Function or RPC named "council_pending_feed"):
 * - Restricted to authenticated users with role "council" or "admin".
 * - Returns pickup requests (US3.2) and dumping reports (US2.1) merged
 *   into a single array, each tagged with a `type` field.
 * - Supports `page` and `pageSize` for pagination.
 *
 * Until the backend function is wired up, this throws so the UI layer
 * can fall back to local mock data during development.
 */
export async function fetchCouncilFeed(
    params: CouncilFeedParams = {}
): Promise<CouncilFeedResponse> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

    const { data, error } = await supabase.functions.invoke("council-pending-feed", {
        body: { page, pageSize },
    });

    if (error) {
        throw new Error(error.message ?? "Failed to load council feed");
    }

    return data as CouncilFeedResponse;
}

/**
 * Client-side helper used while the API endpoint above is not ready yet.
 * Slices a full in-memory list the same way the API is expected to paginate.
 */
export function paginateCouncilItems(
    allItems: CouncilItem[],
    page: number,
    pageSize: number = DEFAULT_PAGE_SIZE
): CouncilFeedResponse {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = allItems.slice(start, end);

    return {
        items,
        page,
        pageSize,
        hasMore: end < allItems.length,
        total: allItems.length,
    };
}
