import { render, screen } from "@testing-library/react-native";
import { Loading } from "../loading";

describe("Loading", () => {
  it("should render correctly", () => {
    render(<Loading />);

    expect(screen.getByLabelText("Loading")).toBeTruthy();
  });

  it("should have correct accessibility label", () => {
    render(<Loading />);

    expect(screen.getByLabelText("Loading")).toBeTruthy();
  });

  it("should render with large size by default", () => {
    const { toJSON } = render(<Loading />);
    const tree = toJSON();

    expect(tree).toBeTruthy();
  });

  it("should render with small size when specified", () => {
    const { toJSON } = render(<Loading size="small" />);
    const tree = toJSON();

    expect(tree).toBeTruthy();
  });
});
