import { useCallback, useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";

import { Button } from "@/components/core/button";
import { Text } from "@/components/core/text";
import { type ApyDataPoint } from "@/domain/pool/pool";
import { useDeviceLayout } from "@/hooks/use-device-layout";

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
  return `${value}%`;
}

const CHART_PADDING = { top: 12, right: 16, bottom: 28, left: 48 };
const LABEL_COLOR = "hsl(0 0% 45.1%)";
const LINE_COLOR = "#00AD69";
const GRID_COLOR = "hsl(0 0% 90%)";

function computeNiceTicks(min: number, max: number, count: number): number[] {
  if (min === max) {
    return [min - 1, min, min + 1];
  }

  const range = max - min;
  const step = Math.ceil(range / (count - 1));
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];

  for (let v = start; v <= max + step; v += step) {
    ticks.push(v);
  }

  return ticks;
}

interface SvgLineChartProps {
  data: ChartDataPoint[];
  width: number;
  height: number;
  xTickCount: number;
}

function SvgLineChart({ data, width, height, xTickCount }: SvgLineChartProps) {
  const plotLeft = CHART_PADDING.left;
  const plotRight = width - CHART_PADDING.right;
  const plotTop = CHART_PADDING.top;
  const plotBottom = height - CHART_PADDING.bottom;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  const xMin = Math.min(...data.map((d) => d.x));
  const xMax = Math.max(...data.map((d) => d.x));
  const yValues = data.map((d) => d.apy);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  const yTicks = computeNiceTicks(yMin, yMax, 5);
  const yScaleMin = yTicks[0];
  const yScaleMax = yTicks[yTicks.length - 1];

  function scaleX(x: number): number {
    if (xMax === xMin) return plotLeft + plotWidth / 2;
    return plotLeft + ((x - xMin) / (xMax - xMin)) * plotWidth;
  }

  function scaleY(y: number): number {
    if (yScaleMax === yScaleMin) return plotTop + plotHeight / 2;
    return (
      plotBottom - ((y - yScaleMin) / (yScaleMax - yScaleMin)) * plotHeight
    );
  }

  const points = data.map((d) => `${scaleX(d.x)},${scaleY(d.apy)}`).join(" ");

  const xRange = xMax - xMin;
  const xStep = xTickCount > 1 ? xRange / (xTickCount - 1) : 0;
  const xTicks = Array.from({ length: xTickCount }, (_, i) => xMin + i * xStep);

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
    >
      {/* Horizontal grid lines */}
      {yTicks.map((tick) => (
        <line
          key={`grid-${tick}`}
          x1={plotLeft}
          y1={scaleY(tick)}
          x2={plotRight}
          y2={scaleY(tick)}
          stroke={GRID_COLOR}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((tick) => (
        <text
          key={`y-${tick}`}
          x={plotLeft - 8}
          y={scaleY(tick)}
          textAnchor="end"
          dominantBaseline="middle"
          fill={LABEL_COLOR}
          fontSize={12}
          fontFamily="Inter, system-ui, sans-serif"
        >
          {formatApyLabel(tick)}
        </text>
      ))}

      {/* X-axis labels */}
      {xTicks.map((tick, i) => (
        <text
          key={`x-${i}`}
          x={scaleX(tick)}
          y={plotBottom + 18}
          textAnchor="middle"
          fill={LABEL_COLOR}
          fontSize={12}
          fontFamily="Inter, system-ui, sans-serif"
        >
          {formatDateLabel(tick)}
        </text>
      ))}

      {/* Data line */}
      <polyline
        points={points}
        fill="none"
        stroke={LINE_COLOR}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
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
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  function renderContent() {
    if (isPending) {
      return (
        <View
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

    if (containerWidth === 0) {
      return <View style={{ height: chartHeight }} />;
    }

    const chartData = toChartData(data);

    return (
      <View style={{ height: chartHeight }}>
        <SvgLineChart
          data={chartData}
          width={containerWidth}
          height={chartHeight}
          xTickCount={isMobile ? 3 : 6}
        />
      </View>
    );
  }

  return (
    <View onLayout={handleLayout}>
      {renderContent()}

      <Text className="mt-2 text-center text-sm text-muted-foreground">
        APY history over the last 30 days
      </Text>
    </View>
  );
}
