import { Text } from "@/components/core/text";
import { View } from "react-native";

export function HomeHeader() {
  return (
    <View className="mb-6 items-center">
      <Text
        variant="h1"
        className="text-center text-3xl font-bold text-foreground md:text-4xl"
      >
        Find the Best Stablecoin Yields
      </Text>

      <Text className="mt-2 text-center text-base text-muted-foreground md:text-lg">
        Compare lending rates across DeFi protocols and maximize your returns
      </Text>
    </View>
  );
}
