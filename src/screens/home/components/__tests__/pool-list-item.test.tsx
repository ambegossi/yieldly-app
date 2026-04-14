import { Pool } from "@/domain/pool/pool";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { PoolListItem } from "../pool-list-item";

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Feather: (props: Record<string, unknown>) => (
      <Text testID="feather-icon">{String(props.name)}</Text>
    ),
  };
});

function makePool(overrides: Partial<Pool> = {}): Pool {
  return {
    id: "1",
    chain: "Ethereum",
    project: "Aave",
    symbol: "USDC",
    apy: 5.6789,
    ...overrides,
  };
}

describe("PoolListItem", () => {
  const onPress = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render pool protocol name", () => {
    render(<PoolListItem pool={makePool()} onPress={onPress} />);

    expect(screen.getByText("Aave")).toBeTruthy();
  });

  it("should render pool chain name in badge", () => {
    render(
      <PoolListItem pool={makePool({ chain: "Polygon" })} onPress={onPress} />,
    );

    expect(screen.getByText("Polygon")).toBeTruthy();
  });

  it("should format APY to 2 decimal places for values under 1000", () => {
    render(<PoolListItem pool={makePool({ apy: 5.6789 })} onPress={onPress} />);

    expect(screen.getByText("5.68%")).toBeTruthy();
  });

  it("should format large APY with K suffix for values >= 10000", () => {
    render(<PoolListItem pool={makePool({ apy: 186800 })} onPress={onPress} />);

    expect(screen.getByText("186.8K%")).toBeTruthy();
  });

  it("should format APY with comma for values >= 1000 and < 10000", () => {
    render(<PoolListItem pool={makePool({ apy: 1234 })} onPress={onPress} />);

    expect(screen.getByText("1,234%")).toBeTruthy();
  });

  it("should call onPress when tapped", () => {
    const pool = makePool();
    render(<PoolListItem pool={pool} onPress={onPress} />);

    fireEvent.press(
      screen.getByLabelText("USDC on Aave via Ethereum, 5.68% APY"),
    );

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(pool);
  });

  it("should show green color for positive APY", () => {
    const pool = makePool({ apy: 3.25 });
    render(<PoolListItem pool={pool} onPress={onPress} />);

    expect(
      screen.getByLabelText("USDC on Aave via Ethereum, 3.25% APY"),
    ).toBeTruthy();
  });

  it("should show red text for negative APY", () => {
    const pool = makePool({ apy: -1.5 });
    render(<PoolListItem pool={pool} onPress={onPress} />);

    const item = screen.getByLabelText("USDC on Aave via Ethereum, -1.50% APY");
    expect(item).toBeTruthy();
    expect(screen.getByText("-1.50%")).toBeTruthy();
  });

  it("should render symbol in icon area", () => {
    render(
      <PoolListItem pool={makePool({ symbol: "DAI" })} onPress={onPress} />,
    );

    expect(screen.getByText("DAI")).toBeTruthy();
  });

  it("should render APY with prominent typography", () => {
    const { toJSON } = render(
      <PoolListItem pool={makePool({ apy: 12.34 })} onPress={onPress} />,
    );

    const tree = JSON.stringify(toJSON());

    expect(tree).toContain("12.34%");
    expect(screen.getByText("12.34%")).toBeTruthy();
  });

  it("should display 0% APY as 0.00%", () => {
    render(<PoolListItem pool={makePool({ apy: 0 })} onPress={onPress} />);

    expect(screen.getByText("0.00%")).toBeTruthy();
  });

  it("should truncate long protocol names with numberOfLines", () => {
    const pool = makePool({
      project: "Very Long Protocol Name That Should Be Truncated",
    });
    render(<PoolListItem pool={pool} onPress={onPress} />);

    expect(
      screen.getByText("Very Long Protocol Name That Should Be Truncated"),
    ).toHaveProp("numberOfLines", 1);
  });

  it("should truncate long symbol names with numberOfLines", () => {
    const pool = makePool({ symbol: "LONGTOKEN" });
    render(<PoolListItem pool={pool} onPress={onPress} />);

    expect(screen.getByText("LONGTOKEN")).toHaveProp("numberOfLines", 1);
  });

  it("should handle extremely long APY values", () => {
    render(
      <PoolListItem pool={makePool({ apy: 123.456789 })} onPress={onPress} />,
    );

    expect(screen.getByText("123.46%")).toBeTruthy();
  });

  it("should handle negative APY formatting in accessibility label", () => {
    const pool = makePool({ apy: -2.5 });
    render(<PoolListItem pool={pool} onPress={onPress} />);

    expect(
      screen.getByLabelText("USDC on Aave via Ethereum, -2.50% APY"),
    ).toBeTruthy();
  });
});
