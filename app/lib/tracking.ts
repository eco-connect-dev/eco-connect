import { supabase } from "@/lib/supabase";

export type TrackingSource = "dumping_reports" | "pickup_requests";
export type RequestStatus = "pending" | "in_review" | "assigned" | "resolved";

export type TrackedRequest = {
  id: string;
  source: TrackingSource;
  reporter_id: string;
  category: string;
  status: RequestStatus;
  submitted_at: string;
  location: string;
  notes: string | null;
};

export type NewDumpingReport = {
  category: string;
  location: string;
  notes: string;
};

type RawRequest = Omit<TrackedRequest, "source" | "reporter_id"> & {
  reporter_id?: string;
  resident_id?: string;
};

export async function listMyRequests(): Promise<TrackedRequest[]> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!auth.user) throw new Error("Sign in to track your requests.");

  const [dumpingResult, pickupResult] = await Promise.all([
    supabase
      .from("dumping_reports")
      .select(
        "id, reporter_id, category, status, submitted_at, location, notes",
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
        : "id, reporter_id, category, status, submitted_at, location, notes",
    )
    .eq("id", id)
    .eq(ownerField, auth.user.id)
    .single();

  if (error) throw error;
  const row = data as RawRequest;
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
