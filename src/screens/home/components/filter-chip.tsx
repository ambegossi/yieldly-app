import { Text } from "@/components/core/text";
import { Feather } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <Pressable
      onPress={onRemove}
      accessibilityLabel={`Remove ${label} filter`}
      accessibilityRole="button"
      className="flex-row items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 active:bg-accent"
    >
      <Text className="text-sm text-foreground">{label}</Text>

      <Feather name="x" size={14} />
    </Pressable>
  );
}
