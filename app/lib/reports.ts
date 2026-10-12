import { supabase } from "@/lib/supabase";

export const REPORT_STATUSES = [
  "submitted",
  "under_review",
  "resolved",
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export type Report = {
  id: string;
  reporter_id: string;
  title: string;
  description: string;
  address_line: string;
  neighborhood: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
};

export type ReportStatusChange = {
  id: number;
  report_id: string;
  status: ReportStatus;
  changed_at: string;
  changed_by: string | null;
};

export type NewReport = Pick<
  Report,
  "title" | "description" | "address_line" | "neighborhood"
>;

const REPORT_FIELDS =
  "id, reporter_id, title, description, address_line, neighborhood, status, created_at, updated_at";

export async function listMyReports(): Promise<Report[]> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!auth.user) throw new Error("Sign in to view your reports.");

  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_FIELDS)
    .eq("reporter_id", auth.user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Report[];
}

export async function listCouncilReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_FIELDS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Report[];
}

export async function createReport(input: NewReport): Promise<Report> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!auth.user) throw new Error("Sign in to submit a report.");

  const { data, error } = await supabase
    .from("reports")
    .insert({ ...input, reporter_id: auth.user.id })
    .select(REPORT_FIELDS)
    .single();
  if (error) throw error;
  return data as Report;
}

export async function getReportStatus(
  reportId: string,
): Promise<{ report: Report; history: ReportStatusChange[] }> {
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select(REPORT_FIELDS)
    .eq("id", reportId)
    .single();
  if (reportError) throw reportError;

  const { data: history, error: historyError } = await supabase
    .from("report_status_history")
    .select("id, report_id, status, changed_at, changed_by")
    .eq("report_id", reportId)
    .order("changed_at", { ascending: true });
  if (historyError) throw historyError;

  return {
    report: report as Report,
    history: (history ?? []) as ReportStatusChange[],
  };
}

/** Council-facing update operation. The database enforces role access and transitions. */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
): Promise<Report> {
  const { data, error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", reportId)
    .select(REPORT_FIELDS)
    .single();
  if (error) throw error;
  return data as Report;
}

export function subscribeToReportStatus(
  reportId: string,
  onChange: () => void,
) {
  return supabase
    .channel(`report-status-${reportId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "reports",
        filter: `id=eq.${reportId}`,
      },
      onChange,
    )
    .subscribe();
}

export async function removeReportStatusSubscription(
  channel: ReturnType<typeof subscribeToReportStatus>,
) {
  await supabase.removeChannel(channel);
}
