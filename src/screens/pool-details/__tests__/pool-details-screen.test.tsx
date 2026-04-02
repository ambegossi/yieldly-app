import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import * as WebBrowser from "expo-web-browser";
import PoolDetailsScreen from "../index";

jest.mock("expo-web-browser", () => ({
  openBrowserAsync: jest.fn().mockResolvedValue({ type: "opened" }),
}));

jest.mock("lucide-react-native", () => ({
  ArrowLeft: jest.fn(() => null),
  ExternalLink: jest.fn(() => null),
}));

jest.mock("@/hooks/use-device-layout", () => ({
  useDeviceLayout: jest.fn().mockReturnValue({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    width: 375,
    height: 812,
  }),
}));

jest.mock("expo-image", () => ({
  Image: jest.fn(() => null),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const testPool = {
  id: "abc-123",
  chain: "Optimism",
  project: "Aave",
  symbol: "USDT",
  apy: 5.67,
  url: "https://aave.com",
};

describe("PoolDetailsScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders all key zones: header, symbol, APY, project, chain, CTA", () => {
    const onBack = jest.fn();

    const { unmount } = render(
      <PoolDetailsScreen pool={testPool} onBack={onBack} />,
    );

    // Back navigation text
    expect(screen.getByText("Back to all coins")).toBeTruthy();

    // Symbol
    expect(screen.getAllByText("USDT").length).toBeGreaterThanOrEqual(1);

    // APY
    expect(screen.getByText("5.67%")).toBeTruthy();

    // Project name
    expect(screen.getAllByText("Aave").length).toBeGreaterThanOrEqual(1);

    // Chain
    expect(screen.getByText("Optimism")).toBeTruthy();

    // CTA button
    expect(screen.getByText("Open Aave")).toBeTruthy();

    unmount();
  });

  it("CTA button shows Open {project} text", () => {
    const onBack = jest.fn();

    const { unmount } = render(
      <PoolDetailsScreen pool={testPool} onBack={onBack} />,
    );

    expect(screen.getByText("Open Aave")).toBeTruthy();

    unmount();
  });

  it("pressing CTA button calls openBrowserAsync with pool url", async () => {
    const onBack = jest.fn();

    const { unmount } = render(
      <PoolDetailsScreen pool={testPool} onBack={onBack} />,
    );

    fireEvent.press(screen.getByLabelText("Open Aave in external browser"));

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      "https://aave.com",
    );

    unmount();
  });

  it("renders back navigation link text", () => {
    const onBack = jest.fn();

    const { unmount } = render(
      <PoolDetailsScreen pool={testPool} onBack={onBack} />,
    );

    expect(screen.getByText("Back to all coins")).toBeTruthy();

    unmount();
  });

  it("pressing back link calls onBack callback", () => {
    const onBack = jest.fn();

    const { unmount } = render(
      <PoolDetailsScreen pool={testPool} onBack={onBack} />,
    );

    fireEvent.press(screen.getByLabelText("Navigate back to pool list"));

    expect(onBack).toHaveBeenCalled();

    unmount();
  });

  it("CTA has correct accessibility label", () => {
    const onBack = jest.fn();

    const { unmount } = render(
      <PoolDetailsScreen pool={testPool} onBack={onBack} />,
    );

    expect(screen.getByLabelText("Open Aave in external browser")).toBeTruthy();

    unmount();
  });
});
