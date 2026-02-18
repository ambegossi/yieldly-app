import { Badge } from "@/components/core/badge";
import { Text } from "@/components/core/text";
import { Pool } from "@/domain/pool/pool";
import { Feather } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Pressable, View } from "react-native";

interface PoolListItemProps {
  pool: Pool;
  onPress: (pool: Pool) => void;
}

function formatAPY(apy: number): string {
  const abs = Math.abs(apy);
  const sign = apy < 0 ? "-" : "";

  if (abs >= 10000) {
    return `${sign}${(abs / 1000).toFixed(1)}K%`;
  }

  if (abs >= 1000) {
    return `${sign}${Math.round(abs).toLocaleString("en-US")}%`;
  }

  return `${apy.toFixed(2)}%`;
}

export const PoolListItem = React.memo(
  function PoolListItem({ pool, onPress }: PoolListItemProps) {
    const handlePress = useCallback(() => {
      onPress(pool);
    }, [pool, onPress]);

    const isNegative = pool.apy < 0;

    return (
      <Pressable
        onPress={handlePress}
        className="mb-3 flex-row items-center rounded-xl border border-border bg-card p-4 shadow-sm shadow-black/5 active:bg-accent"
        accessibilityRole="button"
        accessibilityLabel={`${pool.symbol} on ${pool.project} via ${pool.chain}, ${formatAPY(pool.apy)} APY`}
      >
        {/* Symbol Icon */}
        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-brand/20 bg-brand/10 dark:border-brand/20 dark:bg-brand/10">
          <Text
            className="text-base font-semibold text-brand dark:text-brand"
            numberOfLines={1}
          >
            {pool.symbol}
          </Text>
        </View>

        {/* Pool Info */}
        <View className="ml-3 mr-3 flex-1">
          <Text
            className="text-lg font-semibold text-foreground"
            numberOfLines={1}
          >
            {pool.project}
          </Text>
          <Badge variant="subtle" className="self-start">
            <Text className="text-brand dark:text-brand">{"\u2022 "}</Text>
            <Text>{pool.chain}</Text>
          </Badge>
        </View>

        {/* APY */}
        <View className="items-end">
          <Text
            className={`text-xl font-bold ${isNegative ? "text-red-500" : "text-brand"}`}
          >
            {formatAPY(pool.apy)}
          </Text>
          <Text className="text-xs text-muted-foreground">Best APY</Text>
        </View>

        {/* Chevron */}
        <View className="ml-2">
          <Feather name="chevron-right" size={20} color="#9ca3af" />
        </View>
      </Pressable>
    );
  },
  (prevProps, nextProps) => prevProps.pool.id === nextProps.pool.id,
);
