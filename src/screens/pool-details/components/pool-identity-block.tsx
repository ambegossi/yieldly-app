import { Text } from "@/components/core/text";
import { View } from "react-native";

interface PoolIdentityBlockProps {
  symbol: string;
}

export function PoolIdentityBlock({ symbol }: PoolIdentityBlockProps) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-4">
      <View
        className="h-14 w-14 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10"
        accessibilityLabel={`${symbol} token icon`}
        accessibilityRole="image"
      >
        <Text className="text-sm font-bold text-brand" numberOfLines={1}>
          {symbol}
        </Text>
      </View>

      <Text className="text-3xl font-bold text-foreground">{symbol}</Text>
    </View>
  );
}
