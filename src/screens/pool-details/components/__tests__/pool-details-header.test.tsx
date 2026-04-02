import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import { PoolDetailsHeader } from "../pool-details-header";

jest.mock("lucide-react-native", () => ({
  ArrowLeft: jest.fn(() => null),
  ExternalLink: jest.fn(() => null),
}));

describe("PoolDetailsHeader", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the back navigation text", () => {
    const onBack = jest.fn();

    const { unmount } = render(<PoolDetailsHeader onBack={onBack} />);

    expect(screen.getByText("Back to all coins")).toBeTruthy();

    unmount();
  });

  it("calls onBack when pressed", () => {
    const onBack = jest.fn();

    const { unmount } = render(<PoolDetailsHeader onBack={onBack} />);

    fireEvent.press(screen.getByLabelText("Navigate back to pool list"));

    expect(onBack).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("has the correct accessibility label", () => {
    const onBack = jest.fn();

    const { unmount } = render(<PoolDetailsHeader onBack={onBack} />);

    expect(
      screen.getByLabelText("Navigate back to pool list"),
    ).toBeTruthy();

    unmount();
  });
});
