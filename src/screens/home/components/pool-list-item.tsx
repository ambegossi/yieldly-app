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
        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-900/30">
          <Text
            className="text-base font-semibold text-green-700 dark:text-green-400"
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
          <Badge variant="default" className="self-start">
            <Text className="text-green-600 dark:text-green-400">
              {"\u2022 "}
            </Text>
            <Text>{pool.chain}</Text>
          </Badge>
        </View>

        {/* APY */}
        <View className="items-end">
          <Text
            className={`text-xl font-bold ${isNegative ? "text-red-500" : "text-green-600"}`}
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
