import { render, screen } from "@testing-library/react-native";
import React from "react";
import { PoolIdentityBlock } from "../pool-identity-block";

describe("PoolIdentityBlock", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the symbol text in the display area", () => {
    const { unmount } = render(<PoolIdentityBlock symbol="USDT" />);

    // Symbol appears in both the icon box and as large text
    expect(screen.getAllByText("USDT").length).toBeGreaterThanOrEqual(1);

    unmount();
  });

  it("has the correct accessibility label for the token icon box", () => {
    const { unmount } = render(<PoolIdentityBlock symbol="USDT" />);

    expect(screen.getByLabelText("USDT token icon")).toBeTruthy();

    unmount();
  });

  it("renders the symbol as large heading text", () => {
    const { unmount } = render(<PoolIdentityBlock symbol="DAI" />);

    expect(screen.getAllByText("DAI").length).toBeGreaterThanOrEqual(2);

    unmount();
  });

  it("has correct accessibility label with different symbol", () => {
    const { unmount } = render(<PoolIdentityBlock symbol="USDC" />);

    expect(screen.getByLabelText("USDC token icon")).toBeTruthy();

    unmount();
  });
});
