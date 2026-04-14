import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { Header } from "@/components/header";
import { type Pool } from "@/domain/pool/pool";
import { useDeviceLayout } from "@/hooks/use-device-layout";
import { cn } from "@/lib/utils";
import * as WebBrowser from "expo-web-browser";
import { ExternalLink } from "lucide-react-native";
import { useCallback } from "react";
import { Platform, ScrollView, View } from "react-native";
import { PoolDetailsHeader } from "./components/pool-details-header";
import { PoolIdentityBlock } from "./components/pool-identity-block";
import { PoolInfoCard } from "./components/pool-info-card";

interface PoolDetailsScreenProps {
  pool: Pool;
  onBack: () => void;
}

export default function PoolDetailsScreen({
  pool,
  onBack,
}: PoolDetailsScreenProps) {
  const { isMobile } = useDeviceLayout();

  const handleOpenPool = useCallback(async () => {
    const url = `https://defillama.com/yields/pool/${pool.id}`;

    if (Platform.OS === "web") {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    await WebBrowser.openBrowserAsync(url);
  }, [pool.id]);

  return (
    <View className="flex-1 bg-background">
      <Header />

      <ScrollView className="flex-1">
        <PoolDetailsHeader onBack={onBack} />

        <PoolIdentityBlock symbol={pool.symbol} />

        <PoolInfoCard
          apy={pool.apy}
          project={pool.project}
          chain={pool.chain}
          poolId={pool.id}
        />

        {/* CTA Button — Zone 5 */}
        <View className={cn("mx-4 mt-6", !isMobile && "items-start")}>
          <Button
            className={cn(
              "bg-brand shadow-sm shadow-black/5 hover:bg-brand/90 active:bg-brand/90",
              isMobile && "w-full",
            )}
            onPress={handleOpenPool}
            accessibilityRole="button"
            accessibilityLabel={`Open ${pool.project} in external browser`}
          >
            <Text className="text-base font-bold text-white">
              Open {pool.project}
            </Text>

            <ExternalLink size={16} color="white" />
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
