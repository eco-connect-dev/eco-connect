import { supabase } from "@/lib/supabase";
import { ItemStatus } from "@/components/council/StatusBadge";

export type TrackingSource = "dumping_reports" | "pickup_requests";
export type RequestStatus = "pending" | "in_review" | "assigned" | "resolved" | "rejected";

export type TrackedRequest = {
  id: string;
  source: TrackingSource;
  reporter_id: string;
  category: string;
  status: RequestStatus;
  submitted_at: string;
  location: string;
  notes: string | null;
  image_url?: string | null;
};

export type NewDumpingReport = {
  category: string;
  location: string;
  notes: string;
  image_url?: string | null;
};

// Temporary API-shaped data for the resident tracking prototype.
export const COLOMBO_TRACKING_REQUESTS: TrackedRequest[] = [
  {
    id: "demo-colombo-pickup-001",
    source: "pickup_requests",
    reporter_id: "demo-resident",
    category: "Recycling",
    status: "assigned",
    submitted_at: "2026-10-12T08:30:00+05:30",
    location: "42 Ward Place, Colombo 07, Sri Lanka",
    notes: "Recycling bags and flattened cardboard boxes.",
  },
  {
    id: "demo-colombo-report-002",
    source: "dumping_reports",
    reporter_id: "demo-resident",
    category: "Illegal dumping",
    status: "in_review",
    submitted_at: "2026-10-10T14:15:00+05:30",
    location: "Marine Drive, Bambalapitiya, Colombo, Sri Lanka",
    notes: "Mixed waste reported near the public walkway.",
  },
  {
    id: "demo-colombo-pickup-003",
    source: "pickup_requests",
    reporter_id: "demo-resident",
    category: "Bulk waste",
    status: "resolved",
    submitted_at: "2026-10-06T09:00:00+05:30",
    location: "Rajagiriya Junction, Sri Lanka",
    notes: "Old furniture collection completed.",
  },
];

type RawRequest = Omit<TrackedRequest, "source" | "reporter_id"> & {
  reporter_id?: string;
  resident_id?: string;
};

/** Council view of all pickup requests and dumping reports allowed by RLS. */
export async function listCouncilRequests(): Promise<TrackedRequest[]> {
  const [dumpingResult, pickupResult] = await Promise.all([
    supabase
      .from("dumping_reports")
      .select("id, reporter_id, category, status, submitted_at, location, notes, image_url")
      .order("submitted_at", { ascending: false }),
    supabase
      .from("pickup_requests")
      .select("id, resident_id, category, status, submitted_at, location, notes")
      .order("submitted_at", { ascending: false }),
  ]);

  if (dumpingResult.error) throw dumpingResult.error;
  if (pickupResult.error) throw pickupResult.error;

  const dumping = ((dumpingResult.data ?? []) as RawRequest[]).map((row) => ({
    ...row,
    source: "dumping_reports" as const,
    reporter_id: row.reporter_id ?? "",
  }));
  const pickups = ((pickupResult.data ?? []) as RawRequest[]).map((row) => ({
    ...row,
    source: "pickup_requests" as const,
    reporter_id: row.resident_id ?? "",
  }));

  return [...dumping, ...pickups].sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
  );
}

export async function getCouncilRequest(
  source: TrackingSource,
  id: string,
): Promise<TrackedRequest> {
  const isPickup = source === "pickup_requests";
  const { data, error } = await supabase
    .from(source)
    .select(
      isPickup
        ? "id, resident_id, category, status, submitted_at, location, notes"
        : "id, reporter_id, category, status, submitted_at, location, notes, image_url",
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  const row = data as unknown as RawRequest;
  return {
    ...row,
    source,
    reporter_id: isPickup ? (row.resident_id ?? "") : (row.reporter_id ?? ""),
  };
}

export async function updateCouncilRequestStatus(
  source: TrackingSource,
  id: string,
  status: ItemStatus,
): Promise<TrackedRequest> {
  const databaseStatus: RequestStatus =
    status === "under_review" ? "in_review" : status === "completed" ? "resolved" : status as RequestStatus;
  const { data, error } = await supabase
    .from(source)
    .update({ status: databaseStatus })
    .eq("id", id)
    .select(
      source === "pickup_requests"
        ? "id, resident_id, category, status, submitted_at, location, notes"
        : "id, reporter_id, category, status, submitted_at, location, notes, image_url",
    )
    .single();

  if (error) throw error;
  const row = data as unknown as RawRequest;
  return {
    ...row,
    source,
    reporter_id: source === "pickup_requests" ? (row.resident_id ?? "") : (row.reporter_id ?? ""),
  };
}

export async function listMyRequests(): Promise<TrackedRequest[]> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!auth.user) throw new Error("Sign in to track your requests.");

  const [dumpingResult, pickupResult] = await Promise.all([
    supabase
      .from("dumping_reports")
      .select(
        "id, reporter_id, category, status, submitted_at, location, notes, image_url",
      )
      .eq("reporter_id", auth.user.id)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("pickup_requests")
      .select(
        "id, resident_id, category, status, submitted_at, location, notes",
      )
      .eq("resident_id", auth.user.id)
      .order("submitted_at", { ascending: false }),
  ]);

  if (dumpingResult.error) throw dumpingResult.error;
  if (pickupResult.error) throw pickupResult.error;

  const dumping = ((dumpingResult.data ?? []) as RawRequest[]).map((row) => ({
    ...row,
    source: "dumping_reports" as const,
    reporter_id: row.reporter_id ?? "",
  }));
  const pickups = ((pickupResult.data ?? []) as RawRequest[]).map((row) => ({
    ...row,
    source: "pickup_requests" as const,
    reporter_id: row.resident_id ?? "",
  }));

  return [...dumping, ...pickups].sort(
    (a, b) =>
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
  );
}

export async function submitDumpingReport(input: NewDumpingReport) {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!auth.user) throw new Error("Sign in to submit a report.");

  const { data, error } = await supabase
    .from("dumping_reports")
    .insert({
      reporter_id: auth.user.id,
      category: input.category.trim(),
      location: input.location.trim(),
      notes: input.notes.trim() || null,
      image_url: input.image_url ?? null,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) {
    const context = [error.code, error.message, error.details, error.hint]
      .filter(Boolean)
      .join(" — ");
    throw new Error(context || "Supabase denied the report submission.");
  }
  return data as { id: string };
}

export async function getMyTrackedRequest(
  source: TrackingSource,
  id: string,
): Promise<TrackedRequest> {
  const demoRequest = COLOMBO_TRACKING_REQUESTS.find(
    (request) => request.id === id && request.source === source,
  );
  if (demoRequest) return demoRequest;

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!auth.user) throw new Error("Sign in to view this request.");

  const isPickup = source === "pickup_requests";
  const ownerField = isPickup ? "resident_id" : "reporter_id";
  const { data, error } = await supabase
    .from(source)
    .select(
      isPickup
        ? "id, resident_id, category, status, submitted_at, location, notes"
        : "id, reporter_id, category, status, submitted_at, location, notes, image_url",
    )
    .eq("id", id)
    .eq(ownerField, auth.user.id)
    .single();

  if (error) throw error;
  const row = data as unknown as RawRequest;
  return {
    ...row,
    source,
    reporter_id: isPickup ? (row.resident_id ?? "") : (row.reporter_id ?? ""),
  };
}

export function subscribeToMyRequests(userId: string, onChange: () => void) {
  return supabase
    .channel(`resident-requests-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "dumping_reports",
        filter: `reporter_id=eq.${userId}`,
      },
      onChange,
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "pickup_requests",
        filter: `resident_id=eq.${userId}`,
      },
      onChange,
    )
    .subscribe();
}

export async function subscribeToCurrentResidentRequests(onChange: () => void) {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Sign in to track your requests.");
  return subscribeToMyRequests(data.user.id, onChange);
}

export async function removeRequestsSubscription(
  channel: ReturnType<typeof subscribeToMyRequests>,
) {
  await supabase.removeChannel(channel);
}

export function getRequestTitle(request: TrackedRequest) {
  return request.source === "pickup_requests"
    ? `${request.category} pickup`
    : request.category;
}
