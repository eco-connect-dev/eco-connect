import { render, screen } from "@testing-library/react-native";

import CouncilProfileScreen from "@/app/council-profile";

jest.mock("@/app/(tabs)/profile", () => ({
  __esModule: true,
  default: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react") as typeof import("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native") as typeof import("react-native");
    return React.createElement(Text, null, "Shared account profile");
  },
}));

describe("CouncilProfileScreen", () => {
  it("uses the authenticated account profile instead of hard-coded council details", async () => {
    await render(<CouncilProfileScreen />);
    expect(screen.getByText("Shared account profile")).toBeTruthy();
    expect(screen.queryByText("Cllr. Kamal Perera")).toBeNull();
    expect(screen.queryByText("Colombo Councillor")).toBeNull();
  });
});
