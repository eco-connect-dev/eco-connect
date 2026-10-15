import { dashboardForRole, readUserRole } from "@/lib/userRole";
import { supabase } from "@/lib/supabase";

const mockMaybeSingle = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: (...args: unknown[]) => mockMaybeSingle(...args),
    })),
  },
}));

describe("role-based dashboard routing", () => {
  it.each([
    ["user", "/(tabs)/home"],
    ["council", "/(tabs)/council-dashboard"],
    ["admin", "/(tabs)/admin-dashboard"],
    ["driver", "/(tabs)/driver-dashboard"],
  ] as const)("routes %s to its dashboard", (role, destination) => {
    expect(dashboardForRole(role)).toBe(destination);
  });

  it("reads the driver role from the user's database row", async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: { role: "driver" }, error: null });

    await expect(readUserRole("driver-user-id")).resolves.toBe("driver");
    expect(supabase.from).toHaveBeenCalledWith("users");
  });

  it("falls back to the resident role when no recognized elevated role is stored", async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: { role: "unknown" }, error: null });
    await expect(readUserRole("resident-id")).resolves.toBe("user");
  });
});
