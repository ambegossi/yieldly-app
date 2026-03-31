import GorhomBottomSheet, {
  type BottomSheetBackdropProps,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import React, { useCallback } from "react";
import { useColorScheme } from "react-native";

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints: string[];
  onClose?: () => void;
}

export const BottomSheet = React.forwardRef<
  GorhomBottomSheet,
  BottomSheetProps
>(function BottomSheet({ children, snapPoints, onClose }, ref) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        opacity={0.5}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  return (
    <GorhomBottomSheet
      ref={ref}
      snapPoints={snapPoints}
      index={-1}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "hsl(0, 0%, 14.9%)" : "hsl(0, 0%, 89.8%)",
      }}
      backgroundStyle={{
        backgroundColor: isDark ? "hsl(0, 0%, 3.9%)" : "hsl(0, 0%, 100%)",
      }}
      accessibilityRole="none"
      accessibilityLabel="Bottom sheet"
    >
      {children}
    </GorhomBottomSheet>
  );
});
