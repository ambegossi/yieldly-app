import { render, screen } from "@testing-library/react-native";
import React from "react";
import { PoolInfoCard } from "../pool-info-card";

jest.mock("@/hooks/use-device-layout", () => ({
  useDeviceLayout: jest.fn().mockReturnValue({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    width: 375,
    height: 812,
  }),
}));

describe("PoolInfoCard", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Current APY label text", () => {
    const { unmount } = render(
      <PoolInfoCard apy={5.67} project="Aave" chain="Optimism" />,
    );

    expect(screen.getByText("Current APY")).toBeTruthy();

    unmount();
  });

  it("renders the formatted APY value", () => {
    const { unmount } = render(
      <PoolInfoCard apy={5.67} project="Aave" chain="Optimism" />,
    );

    expect(screen.getByText("5.67%")).toBeTruthy();

    unmount();
  });

  it("renders the project name", () => {
    const { unmount } = render(
      <PoolInfoCard apy={5.67} project="Aave" chain="Optimism" />,
    );

    expect(screen.getByText("Aave")).toBeTruthy();

    unmount();
  });

  it("renders the chain name in badge", () => {
    const { unmount } = render(
      <PoolInfoCard apy={5.67} project="Aave" chain="Optimism" />,
    );

    expect(screen.getByText("Optimism")).toBeTruthy();

    unmount();
  });

  it("has the correct APY accessibility label", () => {
    const { unmount } = render(
      <PoolInfoCard apy={5.67} project="Aave" chain="Optimism" />,
    );

    expect(screen.getByLabelText("Current APY: 5.67%")).toBeTruthy();

    unmount();
  });

  it("renders zero APY correctly", () => {
    const { unmount } = render(
      <PoolInfoCard apy={0} project="Aave" chain="Ethereum" />,
    );

    expect(screen.getByText("0.00%")).toBeTruthy();

    unmount();
  });

  it("renders high APY with K suffix", () => {
    const { unmount } = render(
      <PoolInfoCard apy={15000} project="Aave" chain="Ethereum" />,
    );

    expect(screen.getByText("15.0K%")).toBeTruthy();

    unmount();
  });
});
