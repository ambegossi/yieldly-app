import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { Feather } from "@expo/vector-icons";
import { View } from "react-native";

interface FilterButtonProps {
  label: "Network" | "Protocol";
  activeFilter: string | null;
  onPress: () => void;
}

export function FilterButton({
  label,
  activeFilter,
  onPress,
}: FilterButtonProps) {
  const isActive = activeFilter !== null;

  return (
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
  );
}
