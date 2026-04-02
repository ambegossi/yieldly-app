import { render, screen, fireEvent } from "@testing-library/react-native";

import { type ApyDataPoint } from "@/domain/pool/apy-data-point";

const mockCartesianChartCalls: unknown[][] = [];

jest.mock("victory-native", () => {
  function MockCartesianChart(
    props: Record<string, unknown> & {
      children: (arg: { points: { apy: never[] } }) => unknown;
    },
  ) {
    const { children, ...rest } = props;
    mockCartesianChartCalls.push([rest]);
    children({ points: { apy: [] } });
    return null;
  }
  MockCartesianChart.displayName = "CartesianChart";

  function MockLine() {
    return null;
  }
  MockLine.displayName = "Line";

  return { CartesianChart: MockCartesianChart, Line: MockLine };
});

jest.mock("@shopify/react-native-skia", () => ({
  useFont: jest.fn(() => "mock-font"),
}));

jest.mock("@/hooks/use-device-layout", () => ({
  useDeviceLayout: jest.fn().mockReturnValue({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    width: 375,
    height: 812,
  }),
}));

// eslint-disable-next-line import/first
import {
  ApyChart,
  formatDateLabel,
  formatApyLabel,
  toChartData,
} from "../apy-chart";

const CAPTION = "APY history over the last 30 days";

const mockData: ApyDataPoint[] = [
  { timestamp: "2024-03-01", apy: 5.2 },
  { timestamp: "2024-03-02", apy: 6.0 },
  { timestamp: "2024-03-03", apy: 7.5 },
];

const defaultProps = {
  data: mockData,
  isPending: false,
  error: null,
  onRetry: jest.fn(),
};

describe("ApyChart", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading state", () => {
    it("renders skeleton with Loading chart label", () => {
      const { unmount } = render(
        <ApyChart {...defaultProps} isPending={true} data={[]} />,
      );

      expect(screen.getByLabelText("Loading chart")).toBeTruthy();

      unmount();
    });

    it("renders caption in loading state", () => {
      const { unmount } = render(
        <ApyChart {...defaultProps} isPending={true} data={[]} />,
      );

      expect(screen.getByText(CAPTION)).toBeTruthy();

      unmount();
    });
  });

  describe("Error state", () => {
    it('renders "Failed to load chart" text', () => {
      const { unmount } = render(
        <ApyChart
          {...defaultProps}
          error={new Error("Network error")}
          data={[]}
        />,
      );

      expect(screen.getByText("Failed to load chart")).toBeTruthy();

      unmount();
    });

    it('renders "Try again" button that calls onRetry', () => {
      const onRetry = jest.fn();
      const { unmount } = render(
        <ApyChart
          {...defaultProps}
          error={new Error("Network error")}
          data={[]}
          onRetry={onRetry}
        />,
      );

      const retryButton = screen.getByText("Try again");
      fireEvent.press(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);

      unmount();
    });

    it("renders caption in error state", () => {
      const { unmount } = render(
        <ApyChart
          {...defaultProps}
          error={new Error("Network error")}
          data={[]}
        />,
      );

      expect(screen.getByText(CAPTION)).toBeTruthy();

      unmount();
    });
  });

  describe("Empty state", () => {
    it('renders "No data available" text', () => {
      const { unmount } = render(<ApyChart {...defaultProps} data={[]} />);

      expect(screen.getByText("No data available")).toBeTruthy();

      unmount();
    });

    it("does not render a retry button", () => {
      const { unmount } = render(<ApyChart {...defaultProps} data={[]} />);

      expect(screen.queryByText("Try again")).toBeNull();

      unmount();
    });

    it("renders caption in empty state", () => {
      const { unmount } = render(<ApyChart {...defaultProps} data={[]} />);

      expect(screen.getByText(CAPTION)).toBeTruthy();

      unmount();
    });
  });

  describe("Success state", () => {
    it("renders CartesianChart with data", () => {
      mockCartesianChartCalls.length = 0;
      const { unmount } = render(<ApyChart {...defaultProps} />);

      expect(mockCartesianChartCalls.length).toBeGreaterThan(0);
      const chartProps = mockCartesianChartCalls[0][0] as Record<
        string,
        unknown
      >;
      expect(chartProps.data).toHaveLength(3);
      expect(chartProps.xKey).toBe("x");
      expect(chartProps.yKeys).toEqual(["apy"]);

      unmount();
    });

    it("renders caption in success state", () => {
      const { unmount } = render(<ApyChart {...defaultProps} />);

      expect(screen.getByText(CAPTION)).toBeTruthy();

      unmount();
    });
  });

  describe("formatDateLabel", () => {
    it('formats timestamp to "Mar 2" format', () => {
      const ts = new Date("2024-03-02T12:00:00").getTime();
      expect(formatDateLabel(ts)).toBe("Mar 2");
    });
  });

  describe("formatApyLabel", () => {
    it('formats integer APY as "7%"', () => {
      expect(formatApyLabel(7)).toBe("7%");
    });

    it('formats fractional APY as "2.5%"', () => {
      expect(formatApyLabel(2.5)).toBe("2.5%");
    });
  });

  describe("toChartData", () => {
    it("transforms ApyDataPoint[] to ChartDataPoint[] with numeric x", () => {
      const result = toChartData(mockData);
      expect(result).toHaveLength(3);
      expect(typeof result[0].x).toBe("number");
      expect(result[0].apy).toBe(5.2);
      expect(result[1].apy).toBe(6.0);
    });
  });
});
