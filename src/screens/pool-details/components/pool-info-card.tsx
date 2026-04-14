import { Badge } from "@/components/core/badge";
import { Text } from "@/components/core/text";
import { usePoolApyHistory } from "@/domain/pool/use-cases/use-pool-apy-history";
import { useDeviceLayout } from "@/hooks/use-device-layout";
import { formatAPY } from "@/lib/format-apy";
import { cn } from "@/lib/utils";
import { View } from "react-native";
import { ApyChart } from "./apy-chart";

interface PoolInfoCardProps {
  apy: number;
  project: string;
  chain: string;
  poolId: string;
}

export function PoolInfoCard({
  apy,
  project,
  chain,
  poolId,
}: PoolInfoCardProps) {
  const { isMobile } = useDeviceLayout();
  const formattedAPY = formatAPY(apy);
  const { data, isPending, error, refetch } = usePoolApyHistory(poolId);

  return (
    <View className="mx-4 mt-2 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
      <View
        className={cn(
          "gap-4",
          isMobile ? "flex-col" : "flex-row justify-between",
        )}
      >
        {/* APY Block */}
        <View>
          <Text className="text-sm text-muted-foreground">Current APY</Text>

          <Text
            className="text-4xl font-bold text-brand"
            accessibilityLabel={`Current APY: ${formattedAPY}`}
          >
            {formattedAPY}
          </Text>
        </View>

        {/* Project/Chain Block */}
        <View className={cn("gap-1", !isMobile && "items-end")}>
          <Text className="text-base font-bold text-foreground">{project}</Text>

          <Badge variant="subtle" className="self-start">
            <Text className="text-brand dark:text-brand">{"\u2022 "}</Text>

            <Text>{chain}</Text>
          </Badge>
        </View>
      </View>

      <View className="mt-6">
        <ApyChart
          data={data ?? []}
          isPending={isPending}
          error={error}
          onRetry={refetch}
        />
      </View>
    </View>
  );
}
