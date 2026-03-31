import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { View } from "react-native";

interface EmptyStateProps {
  message: string;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({
  message,
  showClearFilters,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <View
      className="flex-1 items-center justify-center p-8"
      accessibilityRole="summary"
    >
      <Text className="mb-4 text-center text-lg text-muted-foreground">
        {message}
      </Text>

      {showClearFilters && onClearFilters && (
        <Button onPress={onClearFilters} accessibilityLabel="Clear filters">
          <Text>Clear Filters</Text>
        </Button>
      )}
    </View>
  );
}
