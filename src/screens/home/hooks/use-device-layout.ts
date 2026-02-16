import { useWindowDimensions } from "react-native";

export interface DeviceLayout {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export function useDeviceLayout(): DeviceLayout {
  const { width, height } = useWindowDimensions();

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    width,
    height,
  };
}
