import { render, screen } from "@testing-library/react-native";
import { Header as HomeHeader } from "../header";

describe("HomeHeader", () => {
  it("should render title", () => {
    render(<HomeHeader />);

    expect(screen.getByText("Find the Best Stablecoin Yields")).toBeTruthy();
  });

  it("should render subtitle", () => {
    render(<HomeHeader />);

    expect(
      screen.getByText(
        "Compare lending rates across DeFi protocols and maximize your returns",
      ),
    ).toBeTruthy();
  });
});
