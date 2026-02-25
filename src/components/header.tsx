import { Text } from "@/components/core/text";
import { Image } from "expo-image";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const logo = require("@/assets/svgs/logo.svg");

export function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center border-b border-border bg-card px-4 md:px-6"
      style={{ paddingTop: insets.top, height: 64 + insets.top }}
      accessibilityRole="header"
    >
      <Image
        source={logo}
        style={{ width: 40, height: 40, borderRadius: 10 }}
        contentFit="contain"
        accessibilityLabel="Yieldly logo"
      />

      <Text className="ml-3 text-xl font-bold text-foreground">Yieldly</Text>
    </View>
  );
}
