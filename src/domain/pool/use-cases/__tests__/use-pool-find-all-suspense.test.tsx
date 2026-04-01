import { RepositoryProvider } from "@/infra/repositories/repository-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import { ReactNode, Suspense } from "react";
import { Text } from "react-native";
import { Pool } from "../../pool";
import { PoolRepo } from "../../pool-repo";
import { usePoolFindAllSuspense } from "../use-pool-find-all-suspense";

const createMockPoolRepo = (overrides?: Partial<PoolRepo>): PoolRepo => {
  return {
    findAll: jest.fn(),
    findApyHistory: jest.fn(),
    ...overrides,
  };
};

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });
};

const createWrapper = (poolRepo: PoolRepo, queryClient: QueryClient) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider value={{ poolRepo }}>
          <Suspense fallback={<Text>Loading</Text>}>{children}</Suspense>
        </RepositoryProvider>
      </QueryClientProvider>
    );
  };
};

describe("usePoolFindAllSuspense", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch pools successfully", async () => {
    const mockPools: Pool[] = [
      {
        id: "1",
        chain: "Ethereum",
        project: "Aave",
        symbol: "USDC",
        apy: 5.2,
        url: "https://aave.com/pool/1",
      },
      {
        id: "2",
        chain: "Polygon",
        project: "Yearn",
        symbol: "DAI",
        apy: 8.7,
        url: "https://yearn.finance/pool/2",
      },
    ];

    const mockPoolRepo = createMockPoolRepo({
      findAll: jest.fn().mockResolvedValue(mockPools),
    });

    const { result, unmount } = renderHook(() => usePoolFindAllSuspense(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockPools);
    });

    unmount();
  });

  it("should handle empty array response", async () => {
    const mockPoolRepo = createMockPoolRepo({
      findAll: jest.fn().mockResolvedValue([]),
    });

    const { result, unmount } = renderHook(() => usePoolFindAllSuspense(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });

    unmount();
  });

  it("should use correct query key", async () => {
    const mockPoolRepo = createMockPoolRepo({
      findAll: jest.fn().mockResolvedValue([]),
    });

    const { unmount } = renderHook(() => usePoolFindAllSuspense(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    await waitFor(() => {
      const queries = queryClient.getQueryCache().getAll();
      expect(queries.length).toBe(1);
      expect(queries[0].queryKey).toEqual(["pools"]);
    });

    unmount();
  });

  it("should call poolRepo.findAll exactly once", async () => {
    const findAllMock = jest.fn().mockResolvedValue([]);
    const mockPoolRepo = createMockPoolRepo({
      findAll: findAllMock,
    });

    const { result, unmount } = renderHook(() => usePoolFindAllSuspense(), {
      wrapper: createWrapper(mockPoolRepo, queryClient),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });

    expect(findAllMock).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("should not refetch on component re-render", async () => {
    const mockPools: Pool[] = [
      {
        id: "1",
        chain: "Ethereum",
        project: "Uniswap",
        symbol: "UNI",
        apy: 12.5,
        url: "https://uniswap.org/pool/1",
      },
    ];

    const findAllMock = jest.fn().mockResolvedValue(mockPools);
    const mockPoolRepo = createMockPoolRepo({
      findAll: findAllMock,
    });

    const { result, rerender, unmount } = renderHook(
      () => usePoolFindAllSuspense(),
      {
        wrapper: createWrapper(mockPoolRepo, queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockPools);
    });

    expect(findAllMock).toHaveBeenCalledTimes(1);

    rerender({} as any);

    expect(findAllMock).toHaveBeenCalledTimes(1);

    unmount();
  });
});
