import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { type ViewProps, View } from "react-native";

interface FilterButtonProps extends ViewProps {
  label: "Network" | "Protocol";
  activeCount: number;
  onPress?: () => void;
}

export const FilterButton = React.forwardRef<View, FilterButtonProps>(
  function FilterButton({ label, activeCount, onPress, ...rest }, ref) {
    const isActive = activeCount > 0;

    return (
      <View ref={ref} {...rest}>
        <Button
          variant="outline"
          size="sm"
          onPress={onPress}
          accessibilityLabel={
            isActive
              ? `${label} filter, ${activeCount} selected`
              : `${label} filter`
          }
        >
          <View className="flex-row items-center gap-1.5">
            <Feather name="filter" size={14} />

            <Text>{label}</Text>

            {isActive && (
              <View className="h-5 w-5 items-center justify-center rounded-full bg-green-500">
                <Text className="text-xs font-bold text-white">
                  {activeCount}
                </Text>
              </View>
            )}
          </View>
        </Button>
      </View>
    );
  },
);
