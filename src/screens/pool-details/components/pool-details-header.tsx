import { Text } from "@/components/core/text";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";

interface PoolDetailsHeaderProps {
  onBack: () => void;
}

export function PoolDetailsHeader({ onBack }: PoolDetailsHeaderProps) {
  return (
    <Pressable
      onPress={onBack}
      className="flex-row items-center gap-2 px-4 py-3"
      style={{ minHeight: 44 }}
      accessibilityRole="button"
      accessibilityLabel="Navigate back to pool list"
    >
      <ArrowLeft size={16} className="text-foreground" />

      <Text className="text-sm text-foreground">Back to all coins</Text>
    </Pressable>
  );
}
