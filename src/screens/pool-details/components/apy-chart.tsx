import { matchFont } from "@shopify/react-native-skia";
import { Platform, View } from "react-native";
import { CartesianChart, Line } from "victory-native";

import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { ApyDataPoint } from "@/domain/pool/pool";
import { useDeviceLayout } from "@/hooks/use-device-layout";

const AXIS_FONT_FAMILY = Platform.select({
  ios: "Helvetica Neue",
  default: "Roboto",
});

export interface ChartDataPoint {
  x: number;
  apy: number;
  [key: string]: unknown;
}

export function toChartData(points: ApyDataPoint[]): ChartDataPoint[] {
  return points.map((p) => ({
    x: new Date(p.timestamp).getTime(),
    apy: p.apy,
  }));
}

export function formatDateLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatApyLabel(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${+(value / 1_000_000).toPrecision(3)}M%`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${+(value / 1_000).toPrecision(3)}K%`;
  }
  return `${value}%`;
}

function formatXLabel(label: unknown): string {
  return formatDateLabel(Number(label));
}

function formatYLabelCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${+(value / 1_000_000).toPrecision(3)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${+(value / 1_000).toPrecision(3)}K`;
  }
  return `${value}%`;
}

function formatYLabel(label: unknown): string {
  return formatYLabelCompact(Number(label));
}

interface ApyChartProps {
  data: ApyDataPoint[];
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function ApyChart({ data, isPending, error, onRetry }: ApyChartProps) {
  const { isMobile } = useDeviceLayout();
  const chartHeight = isMobile ? 200 : 250;
  const font = matchFont({ fontFamily: AXIS_FONT_FAMILY, fontSize: 10 });

  function renderContent() {
    if (isPending) {
      return (
        <View
          key="skeleton"
          style={{ height: chartHeight }}
          className="animate-pulse rounded-lg bg-muted"
          accessibilityRole="progressbar"
          accessibilityLabel="Loading chart"
        />
      );
    }

    if (error) {
      return (
        <View
          key="error"
          style={{ height: chartHeight }}
          className="items-center justify-center"
          accessibilityRole="alert"
        >
          <Text className="text-sm font-medium text-foreground">
            Failed to load chart
          </Text>

          <Button
            variant="outline"
            size="sm"
            onPress={onRetry}
            className="mt-3"
          >
            <Text>Try again</Text>
          </Button>
        </View>
      );
    }

    if (data.length === 0) {
      return (
        <View
          key="empty"
          style={{ height: chartHeight }}
          className="items-center justify-center"
          accessibilityLabel="No data available"
        >
          <Text className="text-sm text-muted-foreground">
            No data available
          </Text>
        </View>
      );
    }

    const chartData = toChartData(data);

    return (
      <View key="chart" style={{ height: chartHeight }}>
        <CartesianChart
          data={chartData}
          xKey={"x" as never}
          yKeys={["apy" as never]}
          padding={{ bottom: 16 }}
          xAxis={{
            font,
            tickCount: isMobile ? 3 : 6,
            formatXLabel: formatXLabel,
            labelColor: "#737373",
          }}
          yAxis={[
            {
              font,
              formatYLabel: formatYLabel,
              labelColor: "#737373",
              labelOffset: 0,
            },
          ]}
        >
          {({ points }: { points: Record<string, unknown[]> }) => (
            <Line
              points={points.apy as never}
              color="#00AD69"
              strokeWidth={2}
              curveType="linear"
            />
          )}
        </CartesianChart>
      </View>
    );
  }

  return (
    <View>
      {renderContent()}

      <Text className="mt-2 text-center text-sm text-muted-foreground">
        APY history over the last 30 days
      </Text>
    </View>
  );
}
