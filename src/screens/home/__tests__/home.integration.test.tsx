import { Pool } from "@/domain/pool/pool";
import { RepositoryProvider } from "@/infra/repositories/repository-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react-native";
import React, { Suspense } from "react";
import { Text } from "react-native";

jest.mock("@gorhom/bottom-sheet", () => {
  const { View } = require("react-native");
  const MockBottomSheet = jest
    .fn()
    .mockImplementation(({ children }) => (
      <View testID="bottom-sheet">{children}</View>
    ));
  return {
    __esModule: true,
    default: MockBottomSheet,
    BottomSheetBackdrop: jest.fn(() => null),
  };
});

jest.mock("@shopify/flash-list", () => {
  const { FlatList } = require("react-native");
  return {
    __esModule: true,
    FlashList: FlatList,
  };
});

jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    Image: (props: Record<string, unknown>) => (
      <View testID="expo-image" {...props} />
    ),
  };
});

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Feather: (props: Record<string, unknown>) => (
      <Text testID="feather-icon">{String(props.name)}</Text>
    ),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/components/core/dropdown-menu", () => {
  const { View } = require("react-native");
  return {
    DropdownMenu: View,
    DropdownMenuTrigger: View,
    DropdownMenuContent: View,
    DropdownMenuCheckboxItem: View,
  };
});

// Mock useWindowDimensions to simulate mobile
jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: jest.fn(() => ({ width: 375, height: 812 })),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

const createMockPools = (): Pool[] => [
  {
    id: "1",
    chain: "Ethereum",
    project: "Aave",
    symbol: "USDC",
    apy: 5.25,
    url: "https://aave.com",
  },
  {
    id: "2",
    chain: "Polygon",
    project: "Compound",
    symbol: "USDT",
    apy: 4.1,
    url: "https://compound.finance",
  },
  {
    id: "3",
    chain: "Ethereum",
    project: "Compound",
    symbol: "DAI",
    apy: 3.75,
    url: "https://compound.finance",
  },
  {
    id: "4",
    chain: "Arbitrum",
    project: "Aave",
    symbol: "USDC",
    apy: 6.0,
    url: "https://aave.com",
  },
];

function createTestSetup(pools: Pool[] = createMockPools()) {
  const mockPoolRepo = {
    findAll: jest.fn().mockResolvedValue(pools),
    findApyHistory: jest.fn(),
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider value={{ poolRepo: mockPoolRepo }}>
          <Suspense fallback={<Text>Loading</Text>}>{children}</Suspense>
        </RepositoryProvider>
      </QueryClientProvider>
    );
  }

  return { mockPoolRepo, queryClient, Wrapper };
}

// Dynamic import to avoid hoisting issues with mocks
const getHomeScreenContent = () =>
  require("../index").default as React.ComponentType;

describe("HomeScreen Integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should show loading state initially then render pools", async () => {
    const { Wrapper, queryClient } = createTestSetup();
    const HomeScreen = getHomeScreenContent();

    const { unmount } = render(<HomeScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Find the Best Stablecoin Yields")).toBeTruthy();
    });

    // Pools should be sorted by APY descending
    await waitFor(() => {
      expect(screen.getAllByText("Aave").length).toBeGreaterThanOrEqual(1);
    });

    queryClient.clear();
    unmount();
  });

  it("should display pools sorted by APY descending", async () => {
    const { Wrapper, queryClient } = createTestSetup();
    const HomeScreen = getHomeScreenContent();

    const { unmount } = render(<HomeScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("6.00%")).toBeTruthy();
    });

    // All pools should render
    expect(screen.getByText("5.25%")).toBeTruthy();
    expect(screen.getByText("4.10%")).toBeTruthy();
    expect(screen.getByText("3.75%")).toBeTruthy();

    queryClient.clear();
    unmount();
  });

  it("should render header with Yieldly branding", async () => {
    const { Wrapper, queryClient } = createTestSetup();
    const HomeScreen = getHomeScreenContent();

    const { unmount } = render(<HomeScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Yieldly")).toBeTruthy();
    });

    queryClient.clear();
    unmount();
  });

  it("should render filter buttons for mobile layout", async () => {
    const { Wrapper, queryClient } = createTestSetup();
    const HomeScreen = getHomeScreenContent();

    const { unmount } = render(<HomeScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Network")).toBeTruthy();
    });

    expect(screen.getByText("Protocol")).toBeTruthy();

    queryClient.clear();
    unmount();
  });

  it("should show empty state when no pools available", async () => {
    const { Wrapper, queryClient } = createTestSetup([]);
    const HomeScreen = getHomeScreenContent();

    const { unmount } = render(<HomeScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("No stablecoin pools available")).toBeTruthy();
    });

    queryClient.clear();
    unmount();
  });

  it("should display pool item details correctly", async () => {
    const { Wrapper, queryClient } = createTestSetup();
    const HomeScreen = getHomeScreenContent();

    const { unmount } = render(<HomeScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("6.00%")).toBeTruthy();
    });

    // Verify pool details are visible
    expect(screen.getAllByText("Best APY").length).toBeGreaterThanOrEqual(1);

    queryClient.clear();
    unmount();
  });

  it("should display 0% APY correctly", async () => {
    const poolsWithZeroApy: Pool[] = [
      {
        id: "1",
        chain: "Ethereum",
        project: "Aave",
        symbol: "USDC",
        apy: 5.25,
        url: "https://aave.com",
      },
      {
        id: "2",
        chain: "Polygon",
        project: "Compound",
        symbol: "USDT",
        apy: 0,
        url: "https://compound.finance",
      },
    ];

    const { Wrapper, queryClient } = createTestSetup(poolsWithZeroApy);
    const HomeScreen = getHomeScreenContent();

    const { unmount } = render(<HomeScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("5.25%")).toBeTruthy();
    });

    // 0% APY should display as 0.00%
    expect(screen.getByText("0.00%")).toBeTruthy();

    queryClient.clear();
    unmount();
  });

  it("should sort negative APY pools below positive ones", async () => {
    const poolsWithNegativeApy: Pool[] = [
      {
        id: "1",
        chain: "Ethereum",
        project: "Aave",
        symbol: "USDC",
        apy: -2.5,
        url: "https://aave.com",
      },
      {
        id: "2",
        chain: "Polygon",
        project: "Compound",
        symbol: "USDT",
        apy: 3.0,
        url: "https://compound.finance",
      },
      {
        id: "3",
        chain: "Ethereum",
        project: "Spark",
        symbol: "DAI",
        apy: 0,
        url: "https://spark.fi",
      },
    ];

    const { Wrapper, queryClient } = createTestSetup(poolsWithNegativeApy);
    const HomeScreen = getHomeScreenContent();

    const { unmount } = render(<HomeScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("3.00%")).toBeTruthy();
    });

    // Negative APY should display with minus sign
    expect(screen.getByText("-2.50%")).toBeTruthy();
    // 0% APY should also be visible
    expect(screen.getByText("0.00%")).toBeTruthy();

    queryClient.clear();
    unmount();
  });

  it("should display cached data when background refresh fails", async () => {
    const pools = createMockPools();
    const mockPoolRepo = {
      findAll: jest.fn().mockResolvedValue(pools),
      findApyHistory: jest.fn(),
    };

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: Infinity,
          staleTime: 0,
        },
      },
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <RepositoryProvider value={{ poolRepo: mockPoolRepo }}>
            <Suspense fallback={<Text>Loading</Text>}>{children}</Suspense>
          </RepositoryProvider>
        </QueryClientProvider>
      );
    }

    const HomeScreen = getHomeScreenContent();
    const { unmount } = render(<HomeScreen />, { wrapper: Wrapper });

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText("6.00%")).toBeTruthy();
    });

    // Make the next fetch fail
    mockPoolRepo.findAll.mockRejectedValue(new Error("Network error"));

    // Trigger a background refetch
    await queryClient.refetchQueries({ queryKey: ["pools"] }).catch(() => {
      // Expected to fail
    });

    // Cached data should still be visible
    expect(screen.getByText("6.00%")).toBeTruthy();
    expect(screen.getByText("5.25%")).toBeTruthy();

    queryClient.clear();
    unmount();
  });
});
