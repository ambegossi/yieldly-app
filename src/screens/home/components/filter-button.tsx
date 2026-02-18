import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { type ViewProps, View } from "react-native";

interface FilterButtonProps extends ViewProps {
  label: "Network" | "Protocol";
  activeFilter: string | null;
  onPress?: () => void;
}

export const FilterButton = React.forwardRef<View, FilterButtonProps>(
  function FilterButton({ label, activeFilter, onPress, ...rest }, ref) {
    const isActive = activeFilter !== null;

    return (
      <View ref={ref} {...rest}>
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          onPress={onPress}
          accessibilityLabel={
            isActive
              ? `${label} filter, ${activeFilter} selected`
              : `${label} filter`
          }
        >
          <View className="flex-row items-center gap-1.5">
            <Feather name="filter" size={14} />
            <Text>{isActive ? `${label}: ${activeFilter}` : label}</Text>
          </View>
        </Button>
      </View>
    );
  },
);
