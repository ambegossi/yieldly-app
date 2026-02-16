import { renderHook } from "@testing-library/react-native";
import { useWindowDimensions } from "react-native";
import { useDeviceLayout } from "../use-device-layout";

jest.mock("react-native", () => ({
  useWindowDimensions: jest.fn(),
}));

const mockUseWindowDimensions = useWindowDimensions as jest.Mock;

describe("useDeviceLayout", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should classify mobile correctly (width < 768)", () => {
    mockUseWindowDimensions.mockReturnValue({ width: 375, height: 812 });

    const { result, unmount } = renderHook(() => useDeviceLayout());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(812);

    unmount();
  });

  it("should classify tablet correctly (768 <= width < 1024)", () => {
    mockUseWindowDimensions.mockReturnValue({ width: 768, height: 1024 });

    const { result, unmount } = renderHook(() => useDeviceLayout());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);

    unmount();
  });

  it("should classify desktop correctly (width >= 1024)", () => {
    mockUseWindowDimensions.mockReturnValue({ width: 1280, height: 800 });

    const { result, unmount } = renderHook(() => useDeviceLayout());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);

    unmount();
  });

  it("should handle boundary value at 768 as tablet", () => {
    mockUseWindowDimensions.mockReturnValue({ width: 768, height: 1024 });

    const { result, unmount } = renderHook(() => useDeviceLayout());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);

    unmount();
  });

  it("should handle boundary value at 1024 as desktop", () => {
    mockUseWindowDimensions.mockReturnValue({ width: 1024, height: 768 });

    const { result, unmount } = renderHook(() => useDeviceLayout());

    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);

    unmount();
  });

  it("should handle small mobile width (320)", () => {
    mockUseWindowDimensions.mockReturnValue({ width: 320, height: 568 });

    const { result, unmount } = renderHook(() => useDeviceLayout());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.width).toBe(320);

    unmount();
  });
});
