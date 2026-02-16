import { render, screen } from "@testing-library/react-native";
import { Header } from "../header";

jest.mock("expo-image", () => ({
  Image: "Image",
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("Header", () => {
  it("should render Yieldly name", () => {
    render(<Header />);

    expect(screen.getByText("Yieldly")).toBeTruthy();
  });

  it("should render logo with accessibility label", () => {
    render(<Header />);

    expect(screen.getByLabelText("Yieldly logo")).toBeTruthy();
  });

  it("should render correctly", () => {
    const { toJSON } = render(<Header />);

    expect(toJSON()).toBeTruthy();
  });
});
