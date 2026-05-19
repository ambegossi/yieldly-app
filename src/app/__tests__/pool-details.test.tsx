import { type Pool } from "@/domain/pool/pool";
import { render } from "@testing-library/react-native";
import React from "react";

const mockBack = jest.fn();
const mockUseLocalSearchParams = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  useRouter: () => ({ back: mockBack }),
}));

jest.mock("@/components/screen-wrapper", () => {
  const { View } = require("react-native");
  return {
    ScreenWrapper: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

const capturedProps: { pool?: Pool; onBack?: () => void } = {};
jest.mock("@/screens/pool-details", () => ({
  __esModule: true,
  default: (props: { pool: Pool; onBack: () => void }) => {
    capturedProps.pool = props.pool;
    capturedProps.onBack = props.onBack;
    return null;
  },
}));

import PoolDetailsRoute from "../pool-details";

describe("PoolDetailsRoute", () => {
  beforeEach(() => {
    capturedProps.pool = undefined;
    capturedProps.onBack = undefined;
    mockBack.mockClear();
    mockUseLocalSearchParams.mockReset();
  });

  it("reconstructs Pool from complete query params", () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: "abc-123",
      chain: "Optimism",
      project: "Aave",
      symbol: "USDT",
      apy: "5.67",
    });

    const { unmount } = render(<PoolDetailsRoute />);

    expect(capturedProps.pool).toEqual({
      id: "abc-123",
      chain: "Optimism",
      project: "Aave",
      symbol: "USDT",
      apy: 5.67,
    });

    unmount();
  });

  it("defaults missing string params to empty string and missing apy to 0", () => {
    mockUseLocalSearchParams.mockReturnValue({});

    const { unmount } = render(<PoolDetailsRoute />);

    expect(capturedProps.pool).toEqual({
      id: "",
      chain: "",
      project: "",
      symbol: "",
      apy: 0,
    });

    unmount();
  });

  it("parses apy as float (string params from expo-router are always strings)", () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: "x",
      chain: "x",
      project: "x",
      symbol: "x",
      apy: "12.345",
    });

    const { unmount } = render(<PoolDetailsRoute />);

    expect(capturedProps.pool?.apy).toBeCloseTo(12.345);

    unmount();
  });

  it("partial params: keeps present strings, defaults missing apy to 0", () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: "abc-123",
      symbol: "USDC",
    });

    const { unmount } = render(<PoolDetailsRoute />);

    expect(capturedProps.pool).toEqual({
      id: "abc-123",
      chain: "",
      project: "",
      symbol: "USDC",
      apy: 0,
    });

    unmount();
  });

  it("wires onBack to router.back()", () => {
    mockUseLocalSearchParams.mockReturnValue({});

    const { unmount } = render(<PoolDetailsRoute />);

    capturedProps.onBack?.();

    expect(mockBack).toHaveBeenCalledTimes(1);

    unmount();
  });
});
