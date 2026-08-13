export type CouncilItemType = "pickup_request" | "dumping_report";

export type CouncilItemStatus = "pending" | "in_review" | "assigned";

export type CouncilItem = {
    id: string;
    type: CouncilItemType;
    title: string;
    category: string;
    status: CouncilItemStatus;
    submittedAt: string; // ISO date string
    location: string;
    notes?: string;
};

export type CouncilFeedResponse = {
    items: CouncilItem[];
    page: number;
    pageSize: number;
    hasMore: boolean;
    total: number;
};

export type CouncilFeedParams = {
    page?: number;
    pageSize?: number;
};
