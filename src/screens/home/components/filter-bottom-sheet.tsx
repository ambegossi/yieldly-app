import { BottomSheet } from "@/components/bottom-sheet";
import { Text } from "@/components/core/text";
import GorhomBottomSheet from "@gorhom/bottom-sheet";
import React, { useCallback, useImperativeHandle } from "react";
import { Pressable, ScrollView, View } from "react-native";

interface FilterBottomSheetProps {
  filterType: "network" | "protocol";
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  onClose: () => void;
}

export interface FilterBottomSheetRef {
  open: () => void;
  close: () => void;
}

export const FilterBottomSheet = React.forwardRef<
  FilterBottomSheetRef,
  FilterBottomSheetProps
>(function FilterBottomSheet(
  { filterType, options, selectedValue, onSelect, onClose },
  ref,
) {
  const bottomSheetRef = React.useRef<GorhomBottomSheet>(null);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.snapToIndex(0),
    close: () => bottomSheetRef.current?.close(),
  }));

  const handleSelect = useCallback(
    (value: string | null) => {
      onSelect(value);
      bottomSheetRef.current?.close();
    },
    [onSelect],
  );

  const title = filterType === "network" ? "Select Network" : "Select Protocol";

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["50%", "75%"]}
      onClose={onClose}
    >
      <View className="px-4 pb-2 pt-2">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
      </View>

      <ScrollView className="flex-1">
        <Pressable
          onPress={() => handleSelect(null)}
          className="flex-row items-center justify-between px-4 py-3 active:bg-accent"
          accessibilityRole="menuitem"
        >
          <Text className="text-base text-foreground">All</Text>
          {selectedValue === null && <Text className="text-primary">✓</Text>}
        </Pressable>

        {options.map((option) => (
          <Pressable
            key={option}
            onPress={() => handleSelect(option)}
            className="flex-row items-center justify-between px-4 py-3 active:bg-accent"
            accessibilityRole="menuitem"
          >
            <Text className="text-base text-foreground">{option}</Text>

            {selectedValue === option && (
              <Text className="text-primary">✓</Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </BottomSheet>
  );
});
