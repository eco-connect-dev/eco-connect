import { fireEvent, render, waitFor } from "@testing-library/react-native";

import LoginScreen from "@/app/(auth)/login";
import { supabase } from "@/lib/supabase";

const mockReplace = jest.fn();
const mockSignInWithPassword = supabase.auth.signInWithPassword as jest.Mock;

jest.mock("expo-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

jest.mock("expo-image", () => ({
  Image: () => null,
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the resident login UI", async () => {
    const { getByText, getByPlaceholderText } = await render(<LoginScreen />);

    expect(getByText("EcoConnect")).toBeTruthy();
    expect(getByText("Cleaner City, Together")).toBeTruthy();
    expect(getByPlaceholderText("Email or Phone Number")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByText("Login")).toBeTruthy();
    expect(getByText("Join as Resident")).toBeTruthy();
    expect(() => getByText("Staff Login")).toThrow();
  });

  it("shows a validation error without calling Supabase", async () => {
    const { getByText } = await render(<LoginScreen />);

    await fireEvent.press(getByText("Login"));

    expect(getByText("Email and password are required.")).toBeTruthy();
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("normalizes credentials and redirects after a successful login", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });
    const { getByText, getByPlaceholderText } = await render(<LoginScreen />);

    await fireEvent.changeText(
      getByPlaceholderText("Email or Phone Number"),
      "  RESIDENT@EXAMPLE.COM ",
    );
    await fireEvent.changeText(getByPlaceholderText("Password"), "secret");
    await fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "resident@example.com",
        password: "secret",
      });
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("shows the authentication error returned by Supabase", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: "Invalid login credentials" },
    });
    const { getByText, getByPlaceholderText, findByText } = await render(
      <LoginScreen />,
    );

    await fireEvent.changeText(
      getByPlaceholderText("Email or Phone Number"),
      "resident@example.com",
    );
    await fireEvent.changeText(getByPlaceholderText("Password"), "wrong");
    await fireEvent.press(getByText("Login"));

    expect(await findByText("Invalid login credentials")).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
